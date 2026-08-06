"""
Statistical computation helpers.
All functions accept StudentAcademicData and return clean numeric values.
"""
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.student import StudentAcademicData


def compute_average_mark(data: "StudentAcademicData") -> float:
    """Mean percentage mark across all assessments."""
    if not data.marks:
        return 0.0
    percentages = [m.percentage for m in data.marks]
    return round(sum(percentages) / len(percentages), 2)


def compute_attendance_pct(data: "StudentAcademicData") -> float:
    """Overall attendance percentage across all modules."""
    total    = sum(a.sessions_total    for a in data.attendance)
    attended = sum(a.sessions_attended for a in data.attendance)
    if total == 0:
        return 0.0
    return round((attended / total) * 100, 2)


def compute_lms_logins_per_week(data: "StudentAcademicData") -> float:
    """Average LMS logins per week."""
    if not data.lms_activity:
        return 0.0
    total_logins = sum(l.login_count for l in data.lms_activity)
    weeks        = len(data.lms_activity)
    return round(total_logins / weeks, 2)


def compute_missed_assessments(data: "StudentAcademicData") -> int:
    """Number of assessments not submitted."""
    return sum(1 for s in data.assessment_submissions if not s.submitted)


def compute_missed_tutor_sessions(data: "StudentAcademicData") -> int:
    """Number of tutor sessions not attended."""
    return sum(1 for t in data.tutor_sessions if not t.attended)


def compute_total_engagement(data: "StudentAcademicData") -> int:
    """Total engagement event count."""
    return sum(e.count for e in data.engagement)


def compute_failed_modules(data: "StudentAcademicData") -> int:
    """Modules where the student's mark is below 50%."""
    seen: set[str] = set()
    failed = 0
    for m in data.marks:
        if m.module_code not in seen:
            seen.add(m.module_code)
            if m.percentage < 50:
                failed += 1
    return failed


def compute_module_mark_summary(data: "StudentAcademicData") -> list[dict]:
    """
    Per-module average mark as a list of dicts – used by the frontend charts.
    """
    module_marks: dict[str, list[float]] = {}
    module_names: dict[str, str]         = {}

    for m in data.marks:
        if m.module_code not in module_marks:
            module_marks[m.module_code] = []
            module_names[m.module_code]  = m.module_name
        module_marks[m.module_code].append(m.percentage)

    result = []
    for code, pcts in module_marks.items():
        avg = round(sum(pcts) / len(pcts), 2)
        result.append({
            "module_code":  code,
            "module_name":  module_names[code],
            "average_pct":  avg,
            "status":       "FAIL" if avg < 50 else ("AT_RISK" if avg < 60 else "PASS"),
            "assessments":  len(pcts),
        })

    return sorted(result, key=lambda x: x["average_pct"])


def compute_all_stats(data: "StudentAcademicData") -> dict:
    """Compute every derived statistic in one call."""
    return {
        "average_mark":          compute_average_mark(data),
        "attendance_pct":        compute_attendance_pct(data),
        "lms_logins_per_week":   compute_lms_logins_per_week(data),
        "missed_assessments":    compute_missed_assessments(data),
        "missed_tutor_sessions": compute_missed_tutor_sessions(data),
        "total_engagement":      compute_total_engagement(data),
        "failed_modules":        compute_failed_modules(data),
        "module_marks":          compute_module_mark_summary(data),
    }
