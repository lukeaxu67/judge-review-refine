"""
Analytics API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models import AnnotationStats
from app.core import db, log
from app.utils import calculate_task_hash

router = APIRouter()

@router.get("/analytics/dimensions")
async def get_file_dimensions(
    file_hash: str = Query(..., description="File hash")
):
    """
    Get all dimensions available for a file hash
    """
    try:
        log.info(f"Getting dimensions for file: {file_hash}")
        
        # Query all unique dimensions for this file
        sql = """
        SELECT DISTINCT 
            dimension,
            COUNT(*) as annotation_count,
            MIN(created_at) as first_annotation,
            MAX(created_at) as last_annotation
        FROM annotations
        WHERE file_hash = ?
        GROUP BY dimension
        ORDER BY annotation_count DESC, dimension
        """
        
        rows = await db.fetchall(sql, (file_hash,))
        
        dimensions = []
        for row in rows:
            dimensions.append({
                "name": row['dimension'] or "默认维度",
                "annotationCount": row['annotation_count'],
                "firstAnnotation": row['first_annotation'],
                "lastAnnotation": row['last_annotation']
            })
        
        return {
            "success": True,
            "data": {
                "fileHash": file_hash,
                "dimensions": dimensions,
                "totalDimensions": len(dimensions)
            }
        }
        
    except Exception as e:
        log.error(f"Failed to get file dimensions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/stats", response_model=AnnotationStats)
async def get_annotation_stats(
    file_hash: str = Query(..., description="File hash"),
    dimension: Optional[str] = Query(None, description="Dimension name")
):
    """
    Get annotation statistics for a task
    """
    try:
        log.info(f"Getting stats for file_hash: {file_hash}, dimension: {dimension}")
        
        # Use file_hash based query instead of task_hash for better flexibility
        if dimension:
            # Specific dimension
            where_clause = "WHERE file_hash = ? AND dimension = ?"
            params = (file_hash, dimension)
            log.info(f"Querying for specific dimension: {dimension}")
        else:
            # All dimensions for this file
            where_clause = "WHERE file_hash = ?"
            params = (file_hash,)
            log.info(f"Querying for all dimensions")
        
        # Get total unique cases for this file/dimension
        total_cases_sql = f"""
        SELECT COUNT(DISTINCT case_id) as total
        FROM annotations
        {where_clause}
        """
        total_result = await db.fetchone(total_cases_sql, params)
        total_cases = total_result['total'] if total_result else 0
        log.info(f"Total cases found: {total_cases}")
        
        # Get overall statistics
        stats_sql = f"""
        SELECT 
            COUNT(*) as total_annotations,
            COUNT(DISTINCT case_id) as annotated_cases,
            COALESCE(SUM(CASE WHEN human_action = 'agree' THEN 1 ELSE 0 END), 0) as agreed,
            COALESCE(SUM(CASE WHEN human_action = 'disagree' THEN 1 ELSE 0 END), 0) as disagreed,
            COALESCE(SUM(CASE WHEN human_action = 'skip' THEN 1 ELSE 0 END), 0) as skipped
        FROM annotations
        {where_clause}
        """
        
        stats_result = await db.fetchone(stats_sql, params)
        log.info(f"Stats result: {stats_result}")
        
        if not stats_result or stats_result['total_annotations'] == 0:
            # Return empty stats
            return AnnotationStats(
                total=0,
                completed=0,
                agreed=0,
                disagreed=0,
                skipped=0,
                agreementRate=0.0,
                byAnnotator=[]
            )
        
        # Get by-annotator statistics
        annotator_sql = f"""
        SELECT 
            browser_fingerprint,
            account_name,
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN human_action = 'agree' THEN 1 ELSE 0 END), 0) as agree,
            COALESCE(SUM(CASE WHEN human_action = 'disagree' THEN 1 ELSE 0 END), 0) as disagree,
            COALESCE(SUM(CASE WHEN human_action = 'skip' THEN 1 ELSE 0 END), 0) as skip
        FROM annotations
        {where_clause}
        GROUP BY browser_fingerprint, account_name
        ORDER BY total DESC
        """
        
        annotator_results = await db.fetchall(annotator_sql, params)
        
        # Format annotator data
        by_annotator = []
        for row in annotator_results:
            annotator_data = {
                "fingerprint": row['browser_fingerprint'],
                "account": row['account_name'] or "未命名标注员",
                "name": row['account_name'] or f"标注员{row['browser_fingerprint'][:8]}",
                "total": row['total'],
                "agree": row['agree'],
                "disagree": row['disagree'],
                "skip": row['skip']
            }
            by_annotator.append(annotator_data)
        
        # Calculate agreement rate - now the values are guaranteed to be integers from COALESCE
        total_annotations = stats_result['total_annotations']
        agreed = stats_result['agreed']
        agreement_rate = round((agreed / total_annotations * 100), 2) if total_annotations > 0 else 0.0
        
        log.info(f"Final stats: total={total_cases}, completed={total_annotations}, agreed={agreed}, disagreed={stats_result['disagreed']}, skipped={stats_result['skipped']}")
        
        return AnnotationStats(
            total=total_cases or stats_result['annotated_cases'],
            completed=total_annotations,
            agreed=agreed,
            disagreed=stats_result['disagreed'],
            skipped=stats_result['skipped'],
            agreementRate=agreement_rate,
            byAnnotator=by_annotator
        )
        
    except Exception as e:
        log.error(f"Failed to get annotation stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))