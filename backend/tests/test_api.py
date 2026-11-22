import pytest
from starlette.testclient import TestClient
from backend.app.main import app

# lifespan="off" skips the startup/shutdown lifespan events during testing.
# The DB is already populated; we don't need init_db() to run again in tests.
client = TestClient(app, raise_server_exceptions=True)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "database_dialect" in data

def test_categories_endpoint():
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    assert "health_beauty" in categories or "watches_gifts" in categories or "bed_bath_table" in categories

def test_dashboard_overview_endpoint():
    response = client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    
    # Check KPIs
    kpis = data["kpis"]
    assert kpis["total_revenue"] > 1000000.0
    assert kpis["total_orders"] > 50000
    assert kpis["average_order_value"] > 0
    assert kpis["total_customers"] > 50000
    assert 0 < kpis["ontime_delivery_rate"] <= 100
    assert 0 <= kpis["late_delivery_rate"] <= 100
    assert abs((kpis["ontime_delivery_rate"] + kpis["late_delivery_rate"]) - 100.0) < 0.1

    # Check trends and distributions
    assert len(data["monthly_revenue_trend"]) > 10
    assert len(data["top_categories"]) > 0
    assert len(data["order_status_distribution"]) > 0
    assert "revenue_definition" in data

def test_dashboard_overview_filters():
    # Filter by date range
    response = client.get("/api/dashboard/overview?start_date=2018-01-01&end_date=2018-06-30")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_revenue"] > 0
    
    # Verify monthly trend dates fall within filter
    for item in data["monthly_revenue_trend"]:
        assert item["month"] >= "2018-01"
        assert item["month"] <= "2018-06"

def test_sales_trends_endpoint():
    response = client.get("/api/sales/trends")
    assert response.status_code == 200
    data = response.json()
    assert len(data["revenue_over_time"]) > 0
    assert len(data["monthly_yearly_comparison"]) == 12
    assert len(data["revenue_by_payment_type"]) > 0
    assert len(data["best_performing_categories"]) > 0
    assert len(data["lowest_performing_categories"]) > 0

def test_customer_analytics_endpoint():
    response = client.get("/api/customers/summary")
    assert response.status_code == 200
    data = response.json()
    kpis = data["kpis"]
    assert kpis["total_unique_customers"] > 90000
    assert kpis["repeat_customers"] > 0
    assert kpis["repeat_customer_rate"] > 0
    assert len(data["rfm_segments"]) >= 5
    assert len(data["spending_distribution"]) == 4
    assert len(data["top_customers"]) == 10
    assert "Champions" in data["rfm_explanation"]

def test_products_endpoint():
    response = client.get("/api/products/top")
    assert response.status_code == 200
    data = response.json()
    assert len(data["top_categories_by_revenue"]) > 0
    assert len(data["top_categories_by_volume"]) > 0
    assert len(data["category_performance_table"]) > 0

def test_delivery_performance_endpoint():
    response = client.get("/api/delivery/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["average_delivery_time_days"] > 0
    assert data["ontime_delivery_percentage"] > 0
    assert len(data["performance_over_time"]) > 0
    assert len(data["delays_by_state"]) > 0

def test_business_insights_endpoint():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "summary_headline" in data
    assert len(data["insights"]) >= 5
    for insight in data["insights"]:
        assert "title" in insight
        assert "observation" in insight
        assert "recommendation" in insight
        assert "data_evidence" in insight
