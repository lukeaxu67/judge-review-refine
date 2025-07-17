"""
File parsing utilities for Excel and CSV files
"""
import pandas as pd
from typing import List, Dict, Any, Tuple
from pathlib import Path
from app.core.logger import log

def parse_uploaded_file(file_path: str, filename: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parse Excel or CSV file and return data and columns
    
    Returns:
        Tuple of (data_rows, column_names)
    """
    try:
        file_ext = Path(filename).suffix.lower()
        
        if file_ext in ['.xlsx', '.xls']:
            # Read Excel file
            df = pd.read_excel(file_path, engine='openpyxl')
        elif file_ext == '.csv':
            # Try different encodings
            for encoding in ['utf-8', 'gbk', 'gb2312', 'utf-16']:
                try:
                    df = pd.read_csv(file_path, encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                raise ValueError("Unable to decode CSV file with common encodings")
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        # Convert NaN to None
        df = df.where(pd.notnull(df), None)
        
        # Get column names
        columns = df.columns.tolist()
        
        # Convert to list of dicts
        data = df.to_dict(orient='records')
        
        log.info(f"Parsed file {filename}: {len(data)} rows, {len(columns)} columns")
        
        return data, columns
        
    except Exception as e:
        log.error(f"Error parsing file {filename}: {e}")
        raise

def validate_file_columns(columns: List[str], annotation_type: str) -> Tuple[bool, List[str]]:
    """
    Validate if file has required columns for the annotation type
    
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []
    columns_lower = [col.lower() for col in columns]
    
    if "single" in annotation_type:
        # Single-turn validation
        if "question" not in columns_lower:
            errors.append("Missing required column: question")
            
        # Check for answer columns
        has_answer = "answer" in columns_lower
        has_comparison = "answer1" in columns_lower and "answer2" in columns_lower
        
        if not has_answer and not has_comparison:
            errors.append("Missing required columns: answer OR (answer1, answer2)")
            
    else:
        # Multi-turn validation
        has_dialog = "dialog" in columns_lower
        has_comparison = "dialog1" in columns_lower and "dialog2" in columns_lower
        has_history = "history" in columns_lower and "question" in columns_lower
        
        if not has_dialog and not has_comparison and not has_history:
            errors.append("Missing required columns: dialog OR (dialog1, dialog2) OR (history, question, answer)")
    
    return len(errors) == 0, errors