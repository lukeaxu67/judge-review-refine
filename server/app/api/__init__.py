from fastapi import APIRouter
from .upload import router as upload_router
from .annotations import router as annotations_router
from .analytics import router as analytics_router
from .export import router as export_router
from .progress import router as progress_router

# Create main API router
api_router = APIRouter()

# Include all sub-routers
api_router.include_router(upload_router, tags=["upload"])
api_router.include_router(annotations_router, tags=["annotations"])
api_router.include_router(analytics_router, tags=["analytics"])
api_router.include_router(export_router, tags=["export"])
api_router.include_router(progress_router, tags=["progress"])