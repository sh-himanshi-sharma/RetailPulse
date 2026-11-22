from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import CustomerAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Customer Analytics"])

@router.get("/customers/summary", response_model=CustomerAnalyticsResponse)
def get_customers_summary(db: Session = Depends(get_db)):
    """
    Returns unique customer metrics, repeat purchase rates, spending distribution,
    RFM segmentation breakdown, and highest-value customer accounts.
    """
    return AnalyticsService.get_customer_analytics(db=db)

@router.get("/customers/segments")
def get_customer_segments(db: Session = Depends(get_db)):
    """Returns detailed RFM segment data and strategic definitions."""
    res = AnalyticsService.get_customer_analytics(db=db)
    return {
        "rfm_segments": res["rfm_segments"],
        "rfm_explanation": res["rfm_explanation"]
    }
