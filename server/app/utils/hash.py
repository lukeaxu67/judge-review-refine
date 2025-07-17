"""
Hash utility functions
"""
import hashlib
from typing import BinaryIO

def calculate_file_hash(file: BinaryIO) -> str:
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    # Read file in chunks
    for chunk in iter(lambda: file.read(4096), b""):
        sha256_hash.update(chunk)
    # Reset file pointer
    file.seek(0)
    return sha256_hash.hexdigest()

def calculate_task_hash(file_hash: str, dimension: str = None) -> str:
    """Calculate task hash from file hash and dimension"""
    if dimension:
        content = f"{file_hash}:{dimension}"
    else:
        content = file_hash
    return hashlib.sha256(content.encode()).hexdigest()