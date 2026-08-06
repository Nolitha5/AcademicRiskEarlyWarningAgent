"""
Pydantic models for student academic data.
These mirror the shapes sent by the Node.js backend.
"""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator


class Mark(BaseModel):
    module_code:     str
    module_name:     str
    mark:            float = Field(ge=0)
    max_mark:        float = Field(gt=0)
    assessment_type: str

    @model_validator(mode="after")
    def mark_not_exceed_max(self) -> "Mark":
        if self.mark > self.max_mark:
            raise ValueError(f"mark ({self.mark}) cannot exceed max_mark ({self.max_mark})")
        return self

    @property
    def percentage(self) -> float:
        return round((self.mark / self.max_mark) * 100, 2)


class AttendanceRecord(BaseModel):
    module_code:       str
    sessions_attended: int = Field(ge=0)
    sessions_total:    int = Field(ge=0)

    @property
    def percentage(self) -> float:
        if self.sessions_total == 0:
            return 0.0
        return round((self.sessions_attended / self.sessions_total) * 100, 2)


class LmsActivity(BaseModel):
    week:        str
    login_count: int = Field(ge=0)


class AssessmentSubmission(BaseModel):
    assessment_name: str
    submitted:       bool
    due_date:        str


class TutorSession(BaseModel):
    session_date: str
    attended:     bool
    module_code:  str


class EngagementRecord(BaseModel):
    activity_type: str
    count:         int = Field(ge=0)
    period:        str


class StudentAcademicData(BaseModel):
    student_id:             str
    student_name:           str
    student_number:         str
    programme:              str
    year_of_study:          int = Field(ge=1, le=6)
    marks:                  List[Mark]                  = Field(default_factory=list)
    attendance:             List[AttendanceRecord]      = Field(default_factory=list)
    lms_activity:           List[LmsActivity]           = Field(default_factory=list)
    assessment_submissions: List[AssessmentSubmission]  = Field(default_factory=list)
    tutor_sessions:         List[TutorSession]          = Field(default_factory=list)
    engagement:             List[EngagementRecord]      = Field(default_factory=list)
