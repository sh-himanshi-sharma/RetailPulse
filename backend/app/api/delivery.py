from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import DeliveryPerformanceResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Delivery Analytics"])

@router.get("/delivery/performance", response_model=DeliveryPerformanceResponse)
def get_delivery_performance(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    state: Optional[str] = Query(None, description="Filter delivery by customer state code (e.g. SP, RJ)"),
    db: Session = Depends(get_db)
):
    """
    Returns logistics fulfillment metrics: on-time percentage, delay rate,
    estimated vs actual fulfillment transit time, monthly fulfillment trends, and state-by-state benchmarks.
    """
    return AnalyticsService.get_delivery_performance(
        db=db,
        start_date=start_date,
        end_date=end_date,
        state=state
    )
