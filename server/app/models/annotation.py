"""
Data models for annotation system
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class ActionEnum(str, Enum):
    agree = "agree"
    disagree = "disagree"
    skip = "skip"

class AnnotationTypeEnum(str, Enum):
    single_turn = "single-turn"
    multi_turn = "multi-turn"
    multi_dimension_single = "multi-dimension-single"
    multi_dimension_multi = "multi-dimension-multi"

class EvaluationTypeEnum(str, Enum):
    rule_based = "rule-based"
    comparison = "comparison"

# Request/Response Models
class FileUploadResponse(BaseModel):
    fileId: str
    filename: str
    totalRows: int
    columns: List[str]
    isValid: bool
    errors: Optional[List[str]] = None

class AnnotationSubmitRequest(BaseModel):
    itemId: str
    action: ActionEnum
    humanJudgement: Optional[str] = None
    humanReasoning: Optional[str] = None
    dimension: Optional[str] = None
    completeDataRow: Optional[Dict[str, Any]] = None

class AnnotationStats(BaseModel):
    total: int
    completed: int
    agreed: int
    disagreed: int
    skipped: int
    agreementRate: float
    byAnnotator: List[Dict[str, Any]] = []

class ProgressResponse(BaseModel):
    totalRows: int
    annotatedRows: int
    annotatedCaseIds: List[int]
    progress: float

# Database Models
class AnnotationRecord(BaseModel):
    id: str
    task_hash: str
    file_hash: str
    filename: str
    dimension: Optional[str] = None
    case_id: int
    browser_fingerprint: str
    account_name: Optional[str] = None
    original_data: Dict[str, Any]
    llm_judgement: Optional[str] = None
    llm_reasoning: Optional[str] = None
    human_action: ActionEnum
    human_judgement: Optional[str] = None
    human_reasoning: Optional[str] = None
    annotation_type: Optional[str] = None
    evaluation_type: Optional[str] = None
    labels: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None