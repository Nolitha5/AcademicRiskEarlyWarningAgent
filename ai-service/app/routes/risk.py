"""
Risk analysis routes.
Called by the Node.js backend – never directly from the browser.
"""
from fastapi import APIRouter, HTTPException
from app.models.student import StudentAcademicData
from app.models.risk import RiskReport
from app.services.risk_analyser import analyse_risk
from app.services.risk_rules import RISK_RULES

router = APIRouter()


@router.post("/analyse", response_model=RiskReport, summary="Analyse risk for one student")
async def analyse_student_risk(data: StudentAcademicData) -> RiskReport:
    """
    Accepts a StudentAcademicData payload from the Node.js backend.
    Returns a full RiskReport with score, level, reasons, and recommendations.
    """
    try:
        return analyse_risk(data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")


@router.get("/rules", summary="List all active risk rules")
def list_risk_rules():
    """
    Returns the current set of risk evaluation rules (without the lambda functions).
    Useful for the admin dashboard to display what rules are active.
    """
    return {
        "count": len(RISK_RULES),
        "rules": [
            {
                "code":         r["code"],
                "description":  r["description"],
                "severity":     r["severity"],
                "score_weight": r["score_weight"],
            }
            for r in RISK_RULES
        ],
    }
