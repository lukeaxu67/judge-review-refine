"""
Annotation submission API endpoints
"""
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from app.models import AnnotationSubmitRequest, AnnotationRecord
from app.core import db, log
from app.utils import calculate_task_hash

router = APIRouter()

def get_browser_fingerprint(request: Request) -> str:
    """Extract browser fingerprint from request headers"""
    # In real implementation, this would be sent from frontend
    return request.headers.get("X-Browser-Fingerprint", "unknown")

@router.post("/projects/{project_id}/annotations")
async def submit_annotation(
    project_id: str,
    submission: AnnotationSubmitRequest,
    request: Request
):
    """
    Submit annotation for a data item
    """
    try:
        # Log the received data for debugging
        log.info(f"Received submission data: {submission.dict()}")
        
        # Extract data from submission
        if not submission.completeDataRow:
            raise HTTPException(status_code=400, detail="Missing completeDataRow")
        
        data_row = submission.completeDataRow
        
        # Log the complete data row
        log.info(f"CompleteDataRow content: {data_row}")
        
        # Required fields
        file_hash = data_row.get("file_hash")
        filename = data_row.get("filename")
        case_id = data_row.get("case_id")
        account_name = data_row.get("account_name")
        original_data = data_row.get("original_data", {})
        
        # Check which fields are missing
        missing_fields = []
        if not file_hash:
            missing_fields.append("file_hash")
        if not filename:
            missing_fields.append("filename")
        if case_id is None:  # case_id could be 0, so check for None specifically
            missing_fields.append("case_id")
        if not account_name or not account_name.strip():
            missing_fields.append("account_name")
        
        if missing_fields:
            log.error(f"Missing fields: {missing_fields}, received data: {data_row}")
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Calculate task hash
        task_hash = calculate_task_hash(file_hash, submission.dimension)
        
        # Get browser fingerprint
        browser_fingerprint = get_browser_fingerprint(request)
        
        # Extract LLM judgement from original data
        llm_judgement = None
        llm_reasoning = None
        
        # Try to find judgement columns
        for key, value in original_data.items():
            key_lower = key.lower()
            if any(keyword in key_lower for keyword in ['judgement', '判断', 'judgment']):
                llm_judgement = str(value) if value is not None else None
            elif any(keyword in key_lower for keyword in ['reasoning', '理由', 'reason']):
                llm_reasoning = str(value) if value is not None else None
        
        # Create annotation record
        annotation_id = str(uuid.uuid4())
        
        # Prepare SQL
        sql = """
        INSERT INTO annotations (
            id, task_hash, file_hash, filename, dimension, case_id,
            browser_fingerprint, account_name, original_data,
            llm_judgement, llm_reasoning, human_action,
            human_judgement, human_reasoning, annotation_type,
            evaluation_type, labels, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(task_hash, case_id, browser_fingerprint) DO UPDATE SET
            human_action = excluded.human_action,
            human_judgement = excluded.human_judgement,
            human_reasoning = excluded.human_reasoning,
            updated_at = excluded.updated_at
        """
        
        # Account name is now validated as required field above
        # account_name is already extracted from data_row
        
        # Prepare values
        values = (
            annotation_id,
            task_hash,
            file_hash,
            filename,
            submission.dimension,
            case_id,
            browser_fingerprint,
            account_name,
            json.dumps(original_data, ensure_ascii=False),
            llm_judgement,
            llm_reasoning,
            submission.action,
            submission.humanJudgement,
            submission.humanReasoning,
            data_row.get("annotation_type"),
            data_row.get("evaluation_type"),
            json.dumps(data_row.get("labels", []), ensure_ascii=False) if data_row.get("labels") else None,
            json.dumps(data_row.get("metadata", {}), ensure_ascii=False) if data_row.get("metadata") else None,
            datetime.now().isoformat(),
            datetime.now().isoformat()
        )
        
        # Execute insert
        await db.execute(sql, values)
        
        log.info(f"Annotation submitted: task={task_hash}, case={case_id}, action={submission.action}")
        
        # Return response compatible with frontend
        return {
            "success": True,
            "data": {
                "id": annotation_id,
                "projectId": project_id,
                "status": submission.action,
                "humanJudgement": submission.humanJudgement,
                "humanReasoning": submission.humanReasoning,
                "annotatedAt": datetime.now().isoformat()
            },
            "message": "标注提交成功"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to submit annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))