import pytest
from backend.app.database.session import SessionLocal
from backend.app.services.analytics_service import AnalyticsService
from backend.app.models.models import CustomerRFM, Order

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_rfm_scores_validity(db):
    """Verify that all ingested RFM records have valid scores (1-5) and recognized segments."""
    rfm_records = db.query(CustomerRFM).limit(100).all()
    assert len(rfm_records) > 0
    valid_segments = {
        "Champions", "Loyal Customers", "Potential Loyalists", 
        "At Risk", "Hibernating", "Recent Customers"
    }
    for rec in rfm_records:
        assert 1 <= rec.r_score <= 5
        assert 1 <= rec.f_score <= 5
        assert 1 <= rec.m_score <= 5
        assert rec.rfm_segment in valid_segments
        assert rec.recency_days >= 0
        assert rec.frequency >= 1
        assert rec.monetary_value > 0

def test_revenue_and_aov_calculation(db):
    """Verify that GMV, order counts, and AOV satisfy mathematical relationships."""
    overview = AnalyticsService.get_overview(db)
    kpis = overview["kpis"]
    revenue = kpis["total_revenue"]
    orders = kpis["total_orders"]
    aov = kpis["average_order_value"]

    assert revenue > 0
    assert orders > 0
    calculated_aov = round(revenue / orders, 2)
    # Check within rounding precision of 0.05
    assert abs(aov - calculated_aov) <= 0.05

def test_delivery_metrics_calculation(db):
    """Verify delivery percentages add up correctly."""
    delivery = AnalyticsService.get_delivery_performance(db)
    ontime_pct = delivery["ontime_delivery_percentage"]
    late_pct = delivery["late_delivery_percentage"]
    assert abs((ontime_pct + late_pct) - 100.0) < 0.1
