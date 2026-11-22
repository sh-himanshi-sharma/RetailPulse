from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import BusinessInsightsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Business Insights"])

@router.get("/insights", response_model=BusinessInsightsResponse)
def get_business_insights(db: Session = Depends(get_db)):
    """
    Returns automated, data-backed strategic observations and recommendations
    spanning revenue drivers, CSAT delivery penalties, seasonality, and customer retention.
    """
    return AnalyticsService.get_business_insights(db=db)
