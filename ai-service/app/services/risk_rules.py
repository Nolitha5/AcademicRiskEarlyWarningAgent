"""
Configurable academic risk rules.

Each rule is a dict with:
  code          – unique identifier (matches risk_rules table in Supabase)
  description   – human-readable label shown in the report
  severity      – HIGH | MEDIUM | LOW
  score_weight  – contribution to the 0-100 risk score
  check         – callable(stats: dict) -> bool
  intervention  – the recommended action if this rule fires
"""
from typing import Any


def _make_rule(
    code: str,
    description: str,
    severity: str,
    score_weight: int,
    check,
    intervention: dict[str, Any],
) -> dict:
    return {
        "code":         code,
        "description":  description,
        "severity":     severity,
        "score_weight": score_weight,
        "check":        check,
        "intervention": intervention,
    }


RISK_RULES: list[dict] = [

    _make_rule(
        code         = "AVERAGE_BELOW_40",
        description  = "Average mark below 40%",
        severity     = "HIGH",
        score_weight = 30,
        check        = lambda s: s["average_mark"] < 40,
        intervention = {
            "type":        "Academic Support",
            "description": "Refer student to academic tutor for urgent support",
            "priority":    "URGENT",
        },
    ),

    _make_rule(
        code         = "MISSED_3_ASSESSMENTS",
        description  = "Missed three or more assessments",
        severity     = "HIGH",
        score_weight = 25,
        check        = lambda s: s["missed_assessments"] >= 3,
        intervention = {
            "type":        "Assessment Follow-up",
            "description": "Notify lecturer; schedule missed assessment review with student",
            "priority":    "HIGH",
        },
    ),

    _make_rule(
        code         = "ATTENDANCE_BELOW_60",
        description  = "Attendance below 60%",
        severity     = "HIGH",
        score_weight = 20,
        check        = lambda s: s["attendance_pct"] < 60,
        intervention = {
            "type":        "Attendance Management",
            "description": "Issue formal attendance warning letter and contact student",
            "priority":    "HIGH",
        },
    ),

    _make_rule(
        code         = "MULTIPLE_FAILED_MODULES",
        description  = "Failing two or more modules (average below 50%)",
        severity     = "HIGH",
        score_weight = 25,
        check        = lambda s: s["failed_modules"] >= 2,
        intervention = {
            "type":        "Academic Advisor Referral",
            "description": "Schedule urgent academic advisor meeting; consider module repetition options",
            "priority":    "URGENT",
        },
    ),

    _make_rule(
        code         = "NO_LMS_ACTIVITY_2WEEKS",
        description  = "No LMS activity recorded for two or more consecutive weeks",
        severity     = "HIGH",
        score_weight = 18,
        check        = lambda s: s["lms_logins_per_week"] == 0,
        intervention = {
            "type":        "Digital Engagement",
            "description": "Contact student urgently; check for connectivity or personal issues",
            "priority":    "HIGH",
        },
    ),

    _make_rule(
        code         = "AVERAGE_BELOW_50",
        description  = "Average mark below 50% (at risk of failing all modules)",
        severity     = "MEDIUM",
        score_weight = 15,
        check        = lambda s: 40 <= s["average_mark"] < 50,
        intervention = {
            "type":        "Supplementary Tutorials",
            "description": "Enroll student in supplementary tutorial programme",
            "priority":    "HIGH",
        },
    ),

    _make_rule(
        code         = "LOW_LMS_ACTIVITY",
        description  = "Fewer than two LMS logins per week on average",
        severity     = "MEDIUM",
        score_weight = 10,
        check        = lambda s: 0 < s["lms_logins_per_week"] < 2,
        intervention = {
            "type":        "Digital Engagement",
            "description": "Send LMS engagement reminder; encourage use of online resources",
            "priority":    "MEDIUM",
        },
    ),

    _make_rule(
        code         = "MISSED_TUTOR_SESSIONS",
        description  = "Missed two or more tutor support sessions",
        severity     = "MEDIUM",
        score_weight = 10,
        check        = lambda s: s["missed_tutor_sessions"] >= 2,
        intervention = {
            "type":        "Tutor Referral",
            "description": "Re-enroll student in tutor support programme; follow up attendance",
            "priority":    "MEDIUM",
        },
    ),

    _make_rule(
        code         = "ATTENDANCE_BELOW_75",
        description  = "Attendance below 75% (approaching compulsory minimum)",
        severity     = "MEDIUM",
        score_weight = 8,
        check        = lambda s: 60 <= s["attendance_pct"] < 75,
        intervention = {
            "type":        "Attendance Warning",
            "description": "Send informal attendance reminder to student",
            "priority":    "MEDIUM",
        },
    ),

    _make_rule(
        code         = "LOW_ENGAGEMENT",
        description  = "Low student engagement (fewer than 3 recorded activities)",
        severity     = "MEDIUM",
        score_weight = 5,
        check        = lambda s: s["total_engagement"] < 3,
        intervention = {
            "type":        "Student Wellness",
            "description": "Refer to student support services for wellness and engagement check",
            "priority":    "LOW",
        },
    ),
]
