from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import OverviewResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Overview"])

@router.get("/dashboard/overview", response_model=OverviewResponse)
def get_dashboard_overview(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    category: Optional[str] = Query(None, description="Product category filter"),
    state: Optional[str] = Query(None, description="Customer state code filter (e.g. SP, RJ)"),
    db: Session = Depends(get_db)
):
    """
    Returns executive KPI cards, monthly revenue trends, order status distribution,
    and category revenue breakdowns with support for date and category filtering.
    """
    return AnalyticsService.get_overview(
        db=db,
        start_date=start_date,
        end_date=end_date,
        category=category,
        state=state
    )

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Returns a list of all distinct product categories to populate UI filter dropdowns."""
    return AnalyticsService.get_categories_list(db=db)
