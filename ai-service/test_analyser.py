"""
Standalone test for the risk analyser – no HTTP server needed.
Run: python test_analyser.py

Tests two students:
  • Nomsa Dlamini  → expects HIGH risk
  • Bongani Zwane  → expects NONE / LOW risk
"""
import json
from app.models.student import (
    StudentAcademicData, Mark, AttendanceRecord,
    LmsActivity, AssessmentSubmission, TutorSession, EngagementRecord,
)
from app.services.risk_analyser import analyse_risk


# ── HIGH-RISK student: Nomsa Dlamini ─────────────────────────────────────────
nomsa = StudentAcademicData(
    student_id     = "test-nomsa-001",
    student_name   = "Nomsa Dlamini",
    student_number = "22034501",
    programme      = "Diploma in Information Technology",
    year_of_study  = 1,
    marks=[
        Mark(module_code="ICT101", module_name="Intro to Programming", mark=28,  max_mark=50,  assessment_type="TEST"),
        Mark(module_code="ICT101", module_name="Intro to Programming", mark=12,  max_mark=30,  assessment_type="ASSIGNMENT"),
        Mark(module_code="ICT102", module_name="Computer Systems",     mark=15,  max_mark=50,  assessment_type="TEST"),
        Mark(module_code="ICT102", module_name="Computer Systems",     mark=8,   max_mark=30,  assessment_type="ASSIGNMENT"),
    ],
    attendance=[
        AttendanceRecord(module_code="ICT101", sessions_attended=2, sessions_total=10),
        AttendanceRecord(module_code="ICT102", sessions_attended=1, sessions_total=10),
    ],
    lms_activity=[
        LmsActivity(week="2025-02-10", login_count=1),
        LmsActivity(week="2025-02-24", login_count=1),
    ],
    assessment_submissions=[
        AssessmentSubmission(assessment_name="Assignment 1",   due_date="2025-03-07", submitted=False),
        AssessmentSubmission(assessment_name="Assignment 2",   due_date="2025-04-04", submitted=False),
        AssessmentSubmission(assessment_name="Practical Task", due_date="2025-04-11", submitted=False),
        AssessmentSubmission(assessment_name="Assignment 3",   due_date="2025-04-25", submitted=False),
    ],
    tutor_sessions=[
        TutorSession(session_date="2025-02-14", attended=False, module_code="ICT101"),
        TutorSession(session_date="2025-02-28", attended=False, module_code="ICT101"),
        TutorSession(session_date="2025-03-07", attended=False, module_code="ICT102"),
    ],
    engagement=[],
)

# ── LOW/NO-RISK student: Bongani Zwane ───────────────────────────────────────
bongani = StudentAcademicData(
    student_id     = "test-bongani-007",
    student_name   = "Bongani Zwane",
    student_number = "22034507",
    programme      = "B.Tech Software Development",
    year_of_study  = 3,
    marks=[
        Mark(module_code="ICT301", module_name="Software Engineering", mark=88, max_mark=100, assessment_type="TEST"),
        Mark(module_code="ICT301", module_name="Software Engineering", mark=38, max_mark=40,  assessment_type="ASSIGNMENT"),
        Mark(module_code="ICT302", module_name="Networks",             mark=82, max_mark=100, assessment_type="TEST"),
        Mark(module_code="ICT303", module_name="AI Fundamentals",      mark=79, max_mark=100, assessment_type="TEST"),
    ],
    attendance=[
        AttendanceRecord(module_code="ICT301", sessions_attended=9,  sessions_total=10),
        AttendanceRecord(module_code="ICT302", sessions_attended=9,  sessions_total=10),
        AttendanceRecord(module_code="ICT303", sessions_attended=10, sessions_total=10),
    ],
    lms_activity=[
        LmsActivity(week="2025-02-03", login_count=5),
        LmsActivity(week="2025-02-10", login_count=6),
        LmsActivity(week="2025-02-17", login_count=5),
        LmsActivity(week="2025-02-24", login_count=4),
    ],
    assessment_submissions=[
        AssessmentSubmission(assessment_name="Assignment 1", due_date="2025-03-07", submitted=True),
        AssessmentSubmission(assessment_name="Assignment 2", due_date="2025-03-14", submitted=True),
        AssessmentSubmission(assessment_name="Assignment 3", due_date="2025-03-21", submitted=True),
    ],
    tutor_sessions=[
        TutorSession(session_date="2025-02-14", attended=True, module_code="ICT301"),
        TutorSession(session_date="2025-02-28", attended=True, module_code="ICT302"),
    ],
    engagement=[
        EngagementRecord(activity_type="LIBRARY_VISIT",   count=3, period="2025-02"),
        EngagementRecord(activity_type="STUDY_GROUP",     count=4, period="2025-02"),
        EngagementRecord(activity_type="WORKSHOP",        count=2, period="2025-03"),
        EngagementRecord(activity_type="EXTRACURRICULAR", count=2, period="2025-03"),
    ],
)


def print_report(report):
    print(f"\n{'='*60}")
    print(f"  Student : {report.student_name}  ({report.student_id})")
    print(f"  Level   : {report.risk_level}")
    print(f"  Score   : {report.risk_score}%")
    print(f"  Avg Mark: {report.average_mark}%")
    print(f"  Attend  : {report.attendance_pct}%")
    print(f"  LMS/wk  : {report.lms_logins_per_week}")
    print(f"  Missed  : {report.missed_assessments} assessments, {report.missed_tutor_sessions} tutor sessions")
    print(f"\n  Reasons ({len(report.reasons)}):")
    for r in report.reasons:
        print(f"    [{r.severity}] {r.description}")
    print(f"\n  Recommendations ({len(report.recommendations)}):")
    for rec in report.recommendations:
        print(f"    [{rec.priority}] {rec.type}: {rec.description}")
    print(f"\n  Module Breakdown:")
    for m in report.module_marks:
        print(f"    {m['module_code']}  {m['average_pct']}%  [{m['status']}]")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n🔍  TUT REW AI Service – Analyser Test\n")

    r1 = analyse_risk(nomsa)
    print_report(r1)
    assert r1.risk_level == "HIGH", f"Expected HIGH, got {r1.risk_level}"
    assert r1.risk_score >= 70,      f"Expected score >= 70, got {r1.risk_score}"
    print("✅  Nomsa test PASSED")

    r2 = analyse_risk(bongani)
    print_report(r2)
    assert r2.risk_level in ("NONE", "LOW"), f"Expected NONE/LOW, got {r2.risk_level}"
    print("✅  Bongani test PASSED")

    print("\n🎉  All tests passed!\n")
