"""
Progress tracking API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models import ProgressResponse
from app.core import db, log
from app.utils import calculate_task_hash

router = APIRouter()

@router.get("/progress", response_model=ProgressResponse)
async def get_annotation_progress(
    file_hash: str = Query(..., description="File hash"),
    dimension: Optional[str] = Query(None, description="Dimension name"),
    fingerprint: Optional[str] = Query(None, description="Browser fingerprint")
):
    """
    Get annotation progress for a task and optionally for a specific annotator
    """
    try:
        task_hash = calculate_task_hash(file_hash, dimension)
        log.info(f"Getting progress for task: {task_hash}, fingerprint: {fingerprint}")
        
        # Build SQL query
        if fingerprint:
            # Get progress for specific annotator
            sql = """
            SELECT 
                COUNT(DISTINCT case_id) as annotated_rows,
                GROUP_CONCAT(DISTINCT case_id) as case_ids
            FROM annotations
            WHERE task_hash = ? AND browser_fingerprint = ?
            """
            params = (task_hash, fingerprint)
        else:
            # Get overall progress
            sql = """
            SELECT 
                COUNT(DISTINCT case_id) as annotated_rows,
                GROUP_CONCAT(DISTINCT case_id) as case_ids
            FROM annotations
            WHERE task_hash = ?
            """
            params = (task_hash,)
        
        result = await db.fetchone(sql, params)
        
        annotated_rows = result['annotated_rows'] if result else 0
        case_ids_str = result['case_ids'] if result and result['case_ids'] else ""
        
        # Parse case IDs
        annotated_case_ids = []
        if case_ids_str:
            annotated_case_ids = sorted([int(id) for id in case_ids_str.split(',')])
        
        # Get total rows (we need to get max case_id + 1 as an estimate)
        max_case_sql = """
        SELECT MAX(case_id) as max_case_id
        FROM annotations
        WHERE task_hash = ?
        """
        max_result = await db.fetchone(max_case_sql, (task_hash,))
        
        # Estimate total rows (actual total should come from original file)
        # Here we use max case_id + 1 as estimate
        total_rows = (max_result['max_case_id'] + 1) if max_result and max_result['max_case_id'] is not None else 0
        
        # If no annotations yet, we can't determine total rows
        if total_rows == 0:
            total_rows = 100  # Default estimate
        
        progress = (annotated_rows / total_rows * 100) if total_rows > 0 else 0.0
        
        return ProgressResponse(
            totalRows=total_rows,
            annotatedRows=annotated_rows,
            annotatedCaseIds=annotated_case_ids,
            progress=round(progress, 2)
        )
        
    except Exception as e:
        log.error(f"Failed to get annotation progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))