"""
Main FastAPI application
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from config import settings
from app.core import log, db
from app.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    log.info("Starting annotation backend service...")
    
    # Initialize database
    try:
        await db.init_tables()
        log.info("Database initialized successfully")
    except Exception as e:
        log.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    log.info("Shutting down annotation backend service...")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    expose_headers=settings.CORS_EXPOSE_HEADERS,
)

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Health check endpoint (before static files)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Static files serving configuration
static_dir = Path(__file__).parent.parent / "static"
static_exists = static_dir.exists() and static_dir.is_dir()

if static_exists:
    # Production mode: serve static files
    log.info(f"📁 Serving static files from {static_dir}")
    
    # Mount assets directory for static resources
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Catch-all route for SPA (Single Page Application)
    # This must be defined after all other routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the frontend SPA for all non-API routes"""
        # Check if it's a static file request
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # For all other routes, return index.html (frontend routing)
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        
        # If index.html doesn't exist, return API info
        return {
            "message": "Frontend not found",
            "hint": "Run 'npm run build:server' from project root to build frontend",
            "api_docs": f"{settings.API_PREFIX}/docs"
        }
else:
    # Development mode: API only
    log.info("🚀 Running in API-only mode (no static files found)")
    
    @app.get("/")
    async def root():
        """Root endpoint in API-only mode"""
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "running",
            "mode": "api-only",
            "docs": f"{settings.API_PREFIX}/docs",
            "hint": "Frontend is served separately in development mode"
        }

if __name__ == "__main__":
    import uvicorn
    
    log.info(f"Starting server on http://localhost:8000")
    log.info(f"API documentation: http://localhost:8000{settings.API_PREFIX}/docs")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )