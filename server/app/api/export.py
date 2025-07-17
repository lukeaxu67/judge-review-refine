"""
Export API endpoints
"""

import csv
import io
import json
import re
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional
from app.core import db, log
from app.utils import calculate_task_hash
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter()


def safe_str(value):
    """Convert value to safe string for CSV export"""
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    # Convert to string and replace problematic characters
    text = str(value)
    # Replace common problematic characters that might cause encoding issues
    text = text.replace("\x00", "")  # Remove null bytes
    text = text.replace("\r\n", "\n")  # Normalize line endings
    text = text.replace("\r", "\n")
    return text


@router.get("/export")
async def export_annotations(
    file_hash: str = Query(..., description="File hash"),
    dimension: Optional[str] = Query(None, description="Dimension name"),
    format: str = Query("csv", description="Export format", pattern="^(csv|excel)$"),
):
    """
    Export annotation data in CSV or Excel format
    """
    if format != "csv":  # Only CSV is implemented in this example
        raise HTTPException(status_code=400, detail="Only CSV format is supported for now.")

    try:
        task_hash = calculate_task_hash(file_hash, dimension)
        log.info(f"Exporting annotations for task: {task_hash}, format: {format}")

        # Query all annotations for this task
        sql = """
        SELECT 
            id,
            task_hash,
            file_hash,
            filename,
            dimension,
            case_id,
            browser_fingerprint,
            account_name,
            original_data,
            llm_judgement,
            llm_reasoning,
            human_action,
            human_judgement,
            human_reasoning,
            annotation_type,
            evaluation_type,
            labels,
            created_at,
            updated_at
        FROM annotations
        WHERE task_hash = ?
        ORDER BY case_id, created_at
        """

        rows = await db.fetchall(sql, (task_hash,))

        if not rows:
            raise HTTPException(status_code=404, detail="No annotations found for this task")

        # Prepare CSV data with UTF-8 encoding
        output = io.StringIO()

        # Define CSV headers
        fieldnames = [
            "case_id",
            "browser_fingerprint",
            "account_name",
            "human_action",
            "human_judgement",
            "human_reasoning",
            "llm_judgement",
            "llm_reasoning",
            "annotation_type",
            "evaluation_type",
            "dimension",
            "created_at",
            "updated_at",
        ]

        # Get all unique keys from original_data
        all_original_keys = set()
        for row in rows:
            try:
                original_data = json.loads(row["original_data"])
                all_original_keys.update(original_data.keys())
            except json.JSONDecodeError:
                log.warning(
                    f"Could not parse original_data for row id: {row['id']}. Skipping original data keys for this row."
                )
                continue  # Continue to the next row if JSON parsing fails

        # Add original data keys to fieldnames, ensure they are sorted for consistent column order
        fieldnames.extend(sorted(all_original_keys))

        # Use UTF-8 compatible CSV writer
        # csv.writer automatically handles UTF-8 when using io.StringIO
        writer = csv.DictWriter(output, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()

        # Write data rows
        for row in rows:
            # Parse JSON fields, handling potential errors
            original_data = {}
            try:
                original_data = json.loads(row["original_data"])
            except json.JSONDecodeError:
                log.warning(f"Could not parse original_data for row id: {row['id']}. Using empty dict.")

            # Create row dict with safe string handling for all fields
            row_dict = {
                "case_id": safe_str(row["case_id"]),
                "browser_fingerprint": safe_str(row["browser_fingerprint"]),
                "account_name": safe_str(row["account_name"]),
                "human_action": safe_str(row["human_action"]),
                "human_judgement": safe_str(row["human_judgement"]),
                "human_reasoning": safe_str(row["human_reasoning"]),
                "llm_judgement": safe_str(row["llm_judgement"]),
                "llm_reasoning": safe_str(row["llm_reasoning"]),
                "annotation_type": safe_str(row["annotation_type"]),
                "evaluation_type": safe_str(row["evaluation_type"]),
                "dimension": safe_str(row["dimension"]),
                "created_at": safe_str(row["created_at"]),
                "updated_at": safe_str(row["updated_at"]),
            }

            # Add original data fields with safe encoding
            for key in all_original_keys:
                value = original_data.get(key, "")
                row_dict[key] = safe_str(value)

            writer.writerow(row_dict)

        # Get CSV content
        csv_content = output.getvalue()
        output.close()

        # Create completely safe ASCII-only filename for the basic 'filename' part
        # and a UTF-8 encoded filename for 'filename*' part
        base_name = f"annotations_{file_hash[:8]}"

        # Ensure dimension is safely represented for filename
        # Use a more robust approach to remove or replace invalid characters
        # For the base filename, it's safer to stick to ASCII
        if dimension:
            # Transliterate or replace non-ASCII characters for basic filename part
            # This is a simplification; a full solution might involve unicodedata.normalize
            safe_dimension_ascii = re.sub(r"[^\w\-_\.]", "_", dimension)
            # Limit length to avoid very long filenames
            safe_dimension_ascii = safe_dimension_ascii[:20]
            filename_for_header = f"{base_name}_{safe_dimension_ascii}.csv"
        else:
            filename_for_header = f"{base_name}.csv"

        # For the UTF-8 filename part, use the original (potentially non-ASCII) dimension
        # and ensure the full filename is URL-encoded
        full_filename_utf8 = f"{base_name}"
        if dimension:
            full_filename_utf8 += f"_{dimension}"
        full_filename_utf8 += ".csv"

        # Quote the full UTF-8 filename for filename*
        # RFC 5987: filename* = <charset>'<language>'<encoded_text>
        # Here, charset is UTF-8, language is empty, encoded_text is URL-encoded filename
        utf8_filename_encoded = quote(full_filename_utf8)

        buffer = BytesIO(csv_content.encode("utf-8-sig"))
        headers = {
            "Content-Disposition": (
                f'attachment; filename="ascii_filename"; ' f"filename*=utf-8''{utf8_filename_encoded}"
            )
        }
        return StreamingResponse(buffer, media_type="text/csv; charset=utf-8", headers=headers)

    except HTTPException:
        raise  # Re-raise FastAPI HTTPExceptions directly
    except Exception as e:
        log.error(f"Failed to export annotations: {e}", exc_info=True)  # Log full traceback
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
