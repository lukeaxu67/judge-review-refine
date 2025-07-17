"""
File upload API endpoints
"""
import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import FileUploadResponse
from app.utils import calculate_file_hash, parse_uploaded_file
from app.core.logger import log
from config.settings import settings

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Validate uploaded file and return file information
    """
    try:
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Calculate file hash
        file_hash = calculate_file_hash(file.file)
        log.info(f"Calculated file hash: {file_hash} for file: {file.filename}")
        
        # Log file details
        log.info(f"File details - name: {file.filename}, size: {file_size}, hash: {file_hash}")
        
        # Save temporarily and parse
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name
        
        try:
            # Parse file
            data, columns = parse_uploaded_file(tmp_file_path, file.filename)
            
            response = FileUploadResponse(
                fileId=file_hash,
                filename=file.filename,
                totalRows=len(data),
                columns=columns,
                isValid=True
            )
            
            log.info(f"File upload successful: {file.filename}, rows: {len(data)}")
            
            # Return response wrapped in success structure to match frontend expectations
            return {
                "success": True,
                "data": response.model_dump()
            }
            
        finally:
            # Clean up temp file
            os.unlink(tmp_file_path)
            
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))