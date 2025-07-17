"""
Configuration settings for the annotation backend service
"""
from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    # API Settings
    API_PREFIX: str = "/api"
    PROJECT_NAME: str = "Annotation Backend Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]  # In production, specify exact origins
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    CORS_EXPOSE_HEADERS: list = ["*"]
    
    # Database Settings
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "./data/annotations.db")
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DATABASE_PATH}"
    
    # Logging Settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_PATH: str = os.getenv("LOG_PATH", "./logs")
    LOG_FILE: str = "annotation_service.log"
    LOG_ROTATION: str = "10 MB"
    LOG_RETENTION: str = "30 days"
    LOG_FORMAT: str = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: list = [".xlsx", ".xls", ".csv"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Ensure directories exist
Path(settings.LOG_PATH).mkdir(parents=True, exist_ok=True)
Path(settings.DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)