"""
Core academic risk analysis engine.

Pipeline:
  1. Compute all statistics from raw student data
  2. Evaluate every rule against the statistics
  3. Sum the weights of triggered rules → risk score (0-100)
  4. Derive risk level from score thresholds
  5. Build sorted reason list and deduplicated intervention list
  6. Return a fully populated RiskReport
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.config import settings
from app.models.student import StudentAcademicData
from app.models.risk import RiskReport, RiskReason, Intervention, RiskLevel
from app.services.risk_rules import RISK_RULES
from app.utils.stats import compute_all_stats


# Priority sort order
_PRIORITY_ORDER = {"URGENT": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
# Severity sort order
_SEVERITY_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


def analyse_risk(data: StudentAcademicData) -> RiskReport:
    """
    Main entry point.
    Accepts a StudentAcademicData object and returns a RiskReport.
    """
    # ── Step 1: compute all statistics ───────────────────────────────────────
    stats = compute_all_stats(data)

    # ── Step 2: evaluate every rule ───────────────────────────────────────────
    triggered: list[dict] = [
        rule for rule in RISK_RULES
        if rule["check"](stats)
    ]

    # ── Step 3: risk score ────────────────────────────────────────────────────
    raw_score  = sum(r["score_weight"] for r in triggered)
    risk_score = float(min(raw_score, 100))

    # ── Step 4: risk level ────────────────────────────────────────────────────
    risk_level: RiskLevel
    if risk_score >= settings.HIGH_RISK_THRESHOLD:
        risk_level = "HIGH"
    elif risk_score >= settings.MEDIUM_RISK_THRESHOLD:
        risk_level = "MEDIUM"
    elif risk_score > 0:
        risk_level = "LOW"
    else:
        risk_level = "NONE"

    # ── Step 5a: build reasons (sorted HIGH → MEDIUM → LOW) ──────────────────
    reasons = sorted(
        [
            RiskReason(
                code        = r["code"],
                description = r["description"],
                severity    = r["severity"],
            )
            for r in triggered
        ],
        key=lambda x: _SEVERITY_ORDER.get(x.severity, 99),
    )

    # ── Step 5b: build recommendations (deduplicated, sorted by priority) ─────
    seen_types: set[str] = set()
    recommendations: list[Intervention] = []

    for rule in sorted(
        triggered,
        key=lambda r: _PRIORITY_ORDER.get(r["intervention"]["priority"], 99),
    ):
        iv   = rule["intervention"]
        itype = iv["type"]
        if itype not in seen_types:
            seen_types.add(itype)
            recommendations.append(
                Intervention(
                    type        = itype,
                    description = iv["description"],
                    priority    = iv["priority"],
                )
            )

    # ── Step 6: assemble report ───────────────────────────────────────────────
    return RiskReport(
        student_id            = data.student_id,
        student_name          = data.student_name,
        risk_level            = risk_level,
        risk_score            = risk_score,
        reasons               = reasons,
        recommendations       = recommendations,
        average_mark          = stats["average_mark"],
        attendance_pct        = stats["attendance_pct"],
        lms_logins_per_week   = stats["lms_logins_per_week"],
        missed_assessments    = stats["missed_assessments"],
        missed_tutor_sessions = stats["missed_tutor_sessions"],
        failed_modules        = stats["failed_modules"],
        module_marks          = stats["module_marks"],
        analysed_at           = datetime.now(timezone.utc).isoformat(),
    )
