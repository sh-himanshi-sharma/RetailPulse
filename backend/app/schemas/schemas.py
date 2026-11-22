from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Common filter parameters schema
class FilterParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None

# Overview Dashboard Schemas
class MonthlyTrendItem(BaseModel):
    month: str
    revenue: float
    orders: int
    customers: int

class CategoryRevenueItem(BaseModel):
    category: str
    revenue: float
    order_count: int
    percentage: float

class OrderStatusItem(BaseModel):
    status: str
    count: int
    percentage: float

class OverviewKPIs(BaseModel):
    total_revenue: float = Field(..., description="Gross Merchandise Value (GMV) of completed orders")
    total_orders: int
    average_order_value: float
    total_customers: int
    average_delivery_time_days: float
    ontime_delivery_rate: float
    late_delivery_rate: float
    cancellation_rate: float

class OverviewResponse(BaseModel):
    kpis: OverviewKPIs
    monthly_revenue_trend: List[MonthlyTrendItem]
    top_categories: List[CategoryRevenueItem]
    order_status_distribution: List[OrderStatusItem]
    revenue_definition: str = "GMV calculated as the total item merchandise value (sum of product prices) for valid customer orders."

# Sales Analytics Schemas
class PaymentTypeItem(BaseModel):
    payment_type: str
    total_revenue: float
    order_count: int
    percentage: float

class YearComparisonItem(BaseModel):
    month: str
    revenue_2017: float
    revenue_2018: float
    orders_2017: int
    orders_2018: int

class SalesTrendItem(BaseModel):
    date: str
    revenue: float
    orders: int
    aov: float

class CategoryPerformanceItem(BaseModel):
    category: str
    revenue: float
    orders_count: int
    units_sold: int
    aov: float

class SalesAnalyticsResponse(BaseModel):
    revenue_over_time: List[SalesTrendItem]
    monthly_yearly_comparison: List[YearComparisonItem]
    revenue_by_category: List[CategoryRevenueItem]
    revenue_by_payment_type: List[PaymentTypeItem]
    best_performing_categories: List[CategoryPerformanceItem]
    lowest_performing_categories: List[CategoryPerformanceItem]

# Customer Analytics Schemas
class RFMSegmentSummary(BaseModel):
    segment: str
    customer_count: int
    percentage: float
    avg_recency: float
    avg_frequency: float
    avg_monetary: float

class TopCustomerItem(BaseModel):
    customer_unique_id: str
    state: str
    city: str
    orders_count: int
    total_spent: float
    segment: str
    last_order_date: Optional[str] = None

class CustomerOrderFrequencyItem(BaseModel):
    frequency_bucket: str
    customer_count: int
    percentage: float

class SpendingDistributionItem(BaseModel):
    spending_range: str
    customer_count: int
    percentage: float

class CustomerTrendItem(BaseModel):
    month: str
    new_customers: int
    returning_customers: int

class CustomerSummaryKPIs(BaseModel):
    total_unique_customers: int
    repeat_customers: int
    repeat_customer_rate: float
    avg_orders_per_customer: float
    avg_customer_lifetime_value: float

class CustomerAnalyticsResponse(BaseModel):
    kpis: CustomerSummaryKPIs
    customer_trends: List[CustomerTrendItem]
    rfm_segments: List[RFMSegmentSummary]
    spending_distribution: List[SpendingDistributionItem]
    order_frequency: List[CustomerOrderFrequencyItem]
    top_customers: List[TopCustomerItem]
    rfm_explanation: Dict[str, str]

# Product Analytics Schemas
class ProductTableItem(BaseModel):
    category: str
    total_revenue: float
    units_sold: int
    unique_products: int
    aov: float
    avg_freight: float
    avg_review_score: float

class ProductAnalyticsResponse(BaseModel):
    top_categories_by_revenue: List[CategoryRevenueItem]
    top_categories_by_volume: List[Dict[str, Any]]
    category_performance_table: List[ProductTableItem]

# Delivery Analytics Schemas
class DeliveryTrendItem(BaseModel):
    month: str
    avg_delivery_days: float
    avg_estimated_days: float
    ontime_rate: float
    late_rate: float
    total_delivered: int

class StateDeliveryItem(BaseModel):
    state: str
    total_orders: int
    avg_delivery_days: float
    ontime_percentage: float
    late_percentage: float

class DeliveryPerformanceResponse(BaseModel):
    average_delivery_time_days: float
    average_estimated_delivery_days: float
    delivery_difference_days: float
    ontime_delivery_percentage: float
    late_delivery_percentage: float
    total_analyzed_orders: int
    performance_over_time: List[DeliveryTrendItem]
    delays_by_state: List[StateDeliveryItem]

# Business Insights Schemas
class InsightItem(BaseModel):
    id: str
    category: str
    title: str
    severity: str # 'positive', 'warning', 'action_required', 'info'
    observation: str
    data_evidence: str
    recommendation: str

class BusinessInsightsResponse(BaseModel):
    summary_headline: str
    generated_at: str
    insights: List[InsightItem]
