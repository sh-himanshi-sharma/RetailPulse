from fastapi import APIRouter
from app.api.overview import router as overview_router
from app.api.sales import router as sales_router
from app.api.customers import router as customers_router
from app.api.products import router as products_router
from app.api.delivery import router as delivery_router
from app.api.insights import router as insights_router

api_router = APIRouter(prefix="/api")

api_router.include_router(overview_router)
api_router.include_router(sales_router)
api_router.include_router(customers_router)
api_router.include_router(products_router)
api_router.include_router(delivery_router)
api_router.include_router(insights_router)
