from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ProductAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Product Analytics"])

@router.get("/products/top", response_model=ProductAnalyticsResponse)
def get_top_products(db: Session = Depends(get_db)):
    """
    Returns top product categories by GMV and unit volume,
    accompanied by a detailed category performance matrix with ratings and shipping costs.
    """
    return AnalyticsService.get_product_analytics(db=db)
