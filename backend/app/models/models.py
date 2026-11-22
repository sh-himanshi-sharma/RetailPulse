from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.session import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(36), primary_key=True, index=True)
    customer_unique_id = Column(String(36), nullable=False, index=True)
    customer_zip_code_prefix = Column(Integer, nullable=True)
    customer_city = Column(String(100), nullable=True)
    customer_state = Column(String(10), nullable=True, index=True)

    orders = relationship("Order", back_populates="customer")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String(36), primary_key=True, index=True)
    product_category_name = Column(String(100), nullable=True)
    product_category_name_english = Column(String(100), nullable=True, index=True, default="uncategorized")
    product_name_lenght = Column(Float, nullable=True)
    product_description_lenght = Column(Float, nullable=True)
    product_photos_qty = Column(Float, nullable=True)
    product_weight_g = Column(Float, nullable=True)
    product_length_cm = Column(Float, nullable=True)
    product_height_cm = Column(Float, nullable=True)
    product_width_cm = Column(Float, nullable=True)

    order_items = relationship("OrderItem", back_populates="product")

class Seller(Base):
    __tablename__ = "sellers"

    seller_id = Column(String(36), primary_key=True, index=True)
    seller_zip_code_prefix = Column(Integer, nullable=True)
    seller_city = Column(String(100), nullable=True)
    seller_state = Column(String(10), nullable=True)

    order_items = relationship("OrderItem", back_populates="seller")

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String(36), primary_key=True, index=True)
    customer_id = Column(String(36), ForeignKey("customers.customer_id"), nullable=False, index=True)
    order_status = Column(String(30), nullable=False, index=True)
    order_purchase_timestamp = Column(DateTime, nullable=False, index=True)
    order_approved_at = Column(DateTime, nullable=True)
    order_delivered_carrier_date = Column(DateTime, nullable=True)
    order_delivered_customer_date = Column(DateTime, nullable=True, index=True)
    order_estimated_delivery_date = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(36), ForeignKey("orders.order_id"), nullable=False, index=True)
    order_item_id = Column(Integer, nullable=False)
    product_id = Column(String(36), ForeignKey("products.product_id"), nullable=False, index=True)
    seller_id = Column(String(36), ForeignKey("sellers.seller_id"), nullable=False, index=True)
    shipping_limit_date = Column(DateTime, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    freight_value = Column(Float, nullable=False, default=0.0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    seller = relationship("Seller", back_populates="order_items")

class Payment(Base):
    __tablename__ = "order_payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(36), ForeignKey("orders.order_id"), nullable=False, index=True)
    payment_sequential = Column(Integer, nullable=False, default=1)
    payment_type = Column(String(50), nullable=False, index=True)
    payment_installments = Column(Integer, nullable=False, default=1)
    payment_value = Column(Float, nullable=False, default=0.0)

    order = relationship("Order", back_populates="payments")

class Review(Base):
    __tablename__ = "order_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(String(36), nullable=False)
    order_id = Column(String(36), ForeignKey("orders.order_id"), nullable=False, index=True)
    review_score = Column(Integer, nullable=False, index=True)
    review_comment_title = Column(String(255), nullable=True)
    review_comment_message = Column(Text, nullable=True)
    review_creation_date = Column(DateTime, nullable=True)
    review_answer_timestamp = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="reviews")

class CustomerRFM(Base):
    __tablename__ = "customer_rfm"

    customer_unique_id = Column(String(36), primary_key=True, index=True)
    recency_days = Column(Integer, nullable=False)
    frequency = Column(Integer, nullable=False)
    monetary_value = Column(Float, nullable=False)
    r_score = Column(Integer, nullable=False)
    f_score = Column(Integer, nullable=False)
    m_score = Column(Integer, nullable=False)
    rfm_segment = Column(String(50), nullable=False, index=True)
    first_purchase_date = Column(DateTime, nullable=True)
    last_purchase_date = Column(DateTime, nullable=True)

# Composite indexes for high query performance
Index("ix_orders_status_date", Order.order_status, Order.order_purchase_timestamp)
Index("ix_items_order_product", OrderItem.order_id, OrderItem.product_id)
