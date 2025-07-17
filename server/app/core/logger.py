"""
Logging configuration using loguru
"""
import sys
from pathlib import Path
from loguru import logger
from config.settings import settings

def setup_logger():
    """Configure logger with rotation and proper formatting"""
    # Remove default handler
    logger.remove()
    
    # Console handler
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        format=settings.LOG_FORMAT,
        colorize=True
    )
    
    # File handler with rotation
    log_file = Path(settings.LOG_PATH) / settings.LOG_FILE
    logger.add(
        log_file,
        level=settings.LOG_LEVEL,
        format=settings.LOG_FORMAT,
        rotation=settings.LOG_ROTATION,
        retention=settings.LOG_RETENTION,
        compression="zip",
        enqueue=True  # Thread-safe
    )
    
    # Error file handler
    error_file = Path(settings.LOG_PATH) / "errors.log"
    logger.add(
        error_file,
        level="ERROR",
        format=settings.LOG_FORMAT,
        rotation=settings.LOG_ROTATION,
        retention=settings.LOG_RETENTION,
        compression="zip",
        enqueue=True
    )
    
    return logger

# Initialize logger
log = setup_logger()