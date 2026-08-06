"""
Pydantic models for the risk report returned by the AI service.
"""
from __future__ import annotations
from typing import List, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["HIGH", "MEDIUM", "LOW", "NONE"]
Priority  = Literal["URGENT", "HIGH", "MEDIUM", "LOW"]


class RiskReason(BaseModel):
    code:        str
    description: str
    severity:    RiskLevel


class Intervention(BaseModel):
    type:        str
    description: str
    priority:    Priority


class RiskReport(BaseModel):
    student_id:            str
    student_name:          str
    risk_level:            RiskLevel
    risk_score:            float = Field(ge=0, le=100)
    reasons:               List[RiskReason]
    recommendations:       List[Intervention]
    # Summary statistics
    average_mark:          float
    attendance_pct:        float
    lms_logins_per_week:   float
    missed_assessments:    int
    missed_tutor_sessions: int
    failed_modules:        int
    # Per-module breakdown (extra detail for the frontend charts)
    module_marks:          List[dict] = Field(default_factory=list)
    analysed_at:           str


class BatchAnalysisRequest(BaseModel):
    """Used when the Node.js backend sends multiple students in one call."""
    students: List[StudentAcademicData]   # noqa: F821 – resolved at runtime


# Resolve forward ref
from app.models.student import StudentAcademicData  # noqa: E402
BatchAnalysisRequest.model_rebuild()
