from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import SalesAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Sales Analytics"])

@router.get("/sales/trends", response_model=SalesAnalyticsResponse)
def get_sales_trends(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    category: Optional[str] = Query(None, description="Product category filter"),
    db: Session = Depends(get_db)
):
    """
    Returns time-series revenue trends, YoY monthly comparison (2017 vs 2018),
    payment method mix, and top & lowest performing product categories.
    """
    return AnalyticsService.get_sales_analytics(
        db=db,
        start_date=start_date,
        end_date=end_date,
        category=category
    )

@router.get("/sales/categories")
def get_sales_categories(db: Session = Depends(get_db)):
    """Returns top categories by sales volume and revenue."""
    res = AnalyticsService.get_sales_analytics(db=db)
    return {
        "best_performing_categories": res["best_performing_categories"],
        "lowest_performing_categories": res["lowest_performing_categories"]
    }
