"""
LLM narrative generation prompts.
Phase 4+ feature: attach an OpenAI / Anthropic key in .env to activate
natural-language risk narratives alongside the structured report.
"""

RISK_NARRATIVE_SYSTEM = (
    "You are an academic support AI at Tshwane University of Technology (TUT). "
    "Your role is to help academic staff understand student risk profiles and take "
    "compassionate, effective action. Always write in a professional, empathetic tone."
)

RISK_NARRATIVE_USER = """
A risk analysis has been completed for the following student. Write a concise
intervention narrative (3–5 sentences) for the assigned academic advisor.

Student:       {student_name}  ({student_number})
Programme:     {programme}
Risk Level:    {risk_level}
Risk Score:    {risk_score}%
Average Mark:  {average_mark}%
Attendance:    {attendance_pct}%
LMS Activity:  {lms_logins_per_week} logins/week

Key Issues:
{reasons_list}

Recommended Actions:
{recommendations_list}

Write your narrative below:
"""


def build_narrative_prompt(report: dict) -> tuple[str, str]:
    """
    Build (system_prompt, user_prompt) tuple for an LLM API call.
    Usage:
        system, user = build_narrative_prompt(report)
        # Pass to openai.chat.completions.create or anthropic.messages.create
    """
    reasons_list = "\n".join(f"  • {r['description']}" for r in report.get("reasons", []))
    recs_list    = "\n".join(f"  • {r['description']}" for r in report.get("recommendations", []))

    user = RISK_NARRATIVE_USER.format(
        student_name        = report["student_name"],
        student_number      = report.get("student_number", "N/A"),
        programme           = report.get("programme", "N/A"),
        risk_level          = report["risk_level"],
        risk_score          = report["risk_score"],
        average_mark        = report["average_mark"],
        attendance_pct      = report["attendance_pct"],
        lms_logins_per_week = report["lms_logins_per_week"],
        reasons_list        = reasons_list or "  • No specific risk flags",
        recommendations_list= recs_list    or "  • Continue monitoring",
    )
    return RISK_NARRATIVE_SYSTEM, user
