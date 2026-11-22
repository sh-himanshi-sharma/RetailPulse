import os
import sys
import time
from datetime import datetime
import pandas as pd
import numpy as np

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database.session import engine, init_db, SessionLocal
from backend.app.models.models import (
    Customer, Product, Seller, Order, OrderItem, Payment, Review, CustomerRFM
)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))

def validate_environment():
    """Verify that all required CSV files are present in the data folder."""
    print("=" * 60)
    print("RETAILPULSE DATA INGESTION & PIPELINE ENGINE")
    print("=" * 60)
    
    required_files = [
        "olist_customers_dataset.csv",
        "olist_orders_dataset.csv",
        "olist_order_items_dataset.csv",
        "olist_order_payments_dataset.csv",
        "olist_order_reviews_dataset.csv",
        "olist_products_dataset.csv",
        "olist_sellers_dataset.csv",
        "product_category_name_translation.csv"
    ]
    
    missing = []
    for f in required_files:
        path = os.path.join(DATA_DIR, f)
        if not os.path.exists(path):
            missing.append(f)
            
    if missing:
        print(f"ERROR: Missing required dataset files in '{DATA_DIR}':")
        for m in missing:
            print(f" - {m}")
        print("\nPlease download the Olist Brazilian E-commerce dataset from Kaggle:")
        print("https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce")
        print(f"Extract all CSV files into the '{DATA_DIR}' folder and rerun.")
        sys.exit(1)
        
    print(f"[OK] All 8 required Olist CSV files confirmed in {DATA_DIR}\n")

def process_and_ingest():
    start_total_time = time.time()
    
    # 1. Initialize tables in the database
    print("Initializing database tables...")
    init_db()
    
    # Clear existing data if any (idempotent run)
    with engine.begin() as conn:
        for tbl in ["customer_rfm", "order_reviews", "order_payments", "order_items", "orders", "sellers", "products", "customers"]:
            try:
                conn.exec_driver_sql(f"DELETE FROM {tbl};")
            except Exception:
                pass
    print("[OK] Database tables initialized and cleared.\n")

    # 2. Customers
    cust_file = os.path.join(DATA_DIR, "olist_customers_dataset.csv")
    print(f"Loading Customers from {os.path.basename(cust_file)}...")
    df_customers = pd.read_csv(cust_file)
    print(f" - Raw customer records: {len(df_customers):,}")
    df_customers.drop_duplicates(subset=["customer_id"], inplace=True)
    df_customers.to_sql("customers", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(df_customers):,} customers ingested.\n")

    # 3. Product Category Translation & Products
    trans_file = os.path.join(DATA_DIR, "product_category_name_translation.csv")
    df_trans = pd.read_csv(trans_file, encoding="utf-8-sig")
    # Clean BOM or rename if needed
    df_trans.columns = [c.replace("\ufeff", "").strip() for c in df_trans.columns]
    trans_dict = dict(zip(df_trans["product_category_name"], df_trans["product_category_name_english"]))

    prod_file = os.path.join(DATA_DIR, "olist_products_dataset.csv")
    print(f"Loading Products from {os.path.basename(prod_file)}...")
    df_products = pd.read_csv(prod_file)
    print(f" - Raw products count: {len(df_products):,}")
    
    # Map Portuguese to English categories
    df_products["product_category_name_english"] = df_products["product_category_name"].map(trans_dict)
    df_products["product_category_name_english"] = df_products["product_category_name_english"].fillna("uncategorized")
    df_products.drop_duplicates(subset=["product_id"], inplace=True)
    df_products.to_sql("products", con=engine, if_exists="append", index=False, chunksize=5000)
    print(f"[OK] {len(df_products):,} products ingested with English translations.\n")

    # 4. Sellers
    sellers_file = os.path.join(DATA_DIR, "olist_sellers_dataset.csv")
    print(f"Loading Sellers from {os.path.basename(sellers_file)}...")
    df_sellers = pd.read_csv(sellers_file)
    df_sellers.drop_duplicates(subset=["seller_id"], inplace=True)
    df_sellers.to_sql("sellers", con=engine, if_exists="append", index=False, chunksize=5000)
    print(f"[OK] {len(df_sellers):,} sellers ingested.\n")

    # 5. Orders
    orders_file = os.path.join(DATA_DIR, "olist_orders_dataset.csv")
    print(f"Loading Orders from {os.path.basename(orders_file)}...")
    df_orders = pd.read_csv(orders_file)
    print(f" - Raw orders count: {len(df_orders):,}")
    
    date_cols = [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date"
    ]
    for col in date_cols:
        df_orders[col] = pd.to_datetime(df_orders[col], errors="coerce")

    df_orders.drop_duplicates(subset=["order_id"], inplace=True)
    df_orders.to_sql("orders", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(df_orders):,} orders ingested.\n")

    # 6. Order Items
    items_file = os.path.join(DATA_DIR, "olist_order_items_dataset.csv")
    print(f"Loading Order Items from {os.path.basename(items_file)}...")
    df_items = pd.read_csv(items_file)
    df_items["shipping_limit_date"] = pd.to_datetime(df_items["shipping_limit_date"], errors="coerce")
    # Verify foreign key integrity against orders and products
    df_items = df_items[df_items["order_id"].isin(df_orders["order_id"])]
    df_items = df_items[df_items["product_id"].isin(df_products["product_id"])]
    df_items.to_sql("order_items", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(df_items):,} order items ingested.\n")

    # 7. Payments
    payments_file = os.path.join(DATA_DIR, "olist_order_payments_dataset.csv")
    print(f"Loading Order Payments from {os.path.basename(payments_file)}...")
    df_payments = pd.read_csv(payments_file)
    df_payments = df_payments[df_payments["order_id"].isin(df_orders["order_id"])]
    df_payments.to_sql("order_payments", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(df_payments):,} order payment records ingested.\n")

    # 8. Reviews
    reviews_file = os.path.join(DATA_DIR, "olist_order_reviews_dataset.csv")
    print(f"Loading Order Reviews from {os.path.basename(reviews_file)}...")
    df_reviews = pd.read_csv(reviews_file)
    df_reviews["review_creation_date"] = pd.to_datetime(df_reviews["review_creation_date"], errors="coerce")
    df_reviews["review_answer_timestamp"] = pd.to_datetime(df_reviews["review_answer_timestamp"], errors="coerce")
    df_reviews = df_reviews[df_reviews["order_id"].isin(df_orders["order_id"])]
    df_reviews.drop_duplicates(subset=["review_id", "order_id"], inplace=True)
    df_reviews.to_sql("order_reviews", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(df_reviews):,} reviews ingested.\n")

    # 9. Compute RFM Segmentation
    print("Computing Customer RFM Analysis (Recency, Frequency, Monetary)...")
    valid_statuses = ["delivered", "shipped", "invoiced", "processing"]
    valid_orders = df_orders[df_orders["order_status"].isin(valid_statuses)]
    
    # Merge order items with orders and customers
    merged_rfm = valid_orders.merge(df_customers[["customer_id", "customer_unique_id"]], on="customer_id")
    merged_rfm = merged_rfm.merge(df_items[["order_id", "price"]], on="order_id")

    # Reference snapshot date (day after the max purchase timestamp)
    snapshot_date = df_orders["order_purchase_timestamp"].max() + pd.Timedelta(days=1)
    print(f" - Snapshot reference date for Recency: {snapshot_date}")

    # Group by customer_unique_id
    rfm_agg = merged_rfm.groupby("customer_unique_id").agg(
        recency_days=("order_purchase_timestamp", lambda dates: (snapshot_date - dates.max()).days),
        frequency=("order_id", "nunique"),
        monetary_value=("price", "sum"),
        first_purchase_date=("order_purchase_timestamp", "min"),
        last_purchase_date=("order_purchase_timestamp", "max")
    ).reset_index()

    # Assign R, F, M scores (1 to 5)
    # Recency: lower days is better -> reverse quintiles
    rfm_agg["r_score"] = pd.qcut(rfm_agg["recency_days"], q=5, labels=[5, 4, 3, 2, 1]).astype(int)

    # Frequency: in e-commerce with mostly 1-time buyers, assign custom thresholds
    def assign_f_score(f):
        if f >= 4:
            return 5
        elif f == 3:
            return 4
        elif f == 2:
            return 3
        elif f == 1:
            return 2
        return 1

    rfm_agg["f_score"] = rfm_agg["frequency"].apply(assign_f_score)

    # Monetary: higher spend is better -> quintiles
    rfm_agg["m_score"] = pd.qcut(rfm_agg["monetary_value"].rank(method="first"), q=5, labels=[1, 2, 3, 4, 5]).astype(int)

    # Segmentation mapping based on standard industry RFM logic
    def assign_segment(row):
        r, f, m = row["r_score"], row["f_score"], row["m_score"]
        if (r >= 4 and f >= 3) or (r >= 4 and m >= 4):
            return "Champions"
        elif (f >= 3) or (r >= 3 and f >= 2 and m >= 3):
            return "Loyal Customers"
        elif (r >= 4 and m >= 2):
            return "Potential Loyalists"
        elif (r <= 2 and m >= 3):
            return "At Risk"
        elif (r <= 2 and m <= 2):
            return "Hibernating"
        else:
            return "Recent Customers"

    rfm_agg["rfm_segment"] = rfm_agg.apply(assign_segment, axis=1)
    
    print(" - Segment breakdown:")
    print(rfm_agg["rfm_segment"].value_counts())

    rfm_agg.to_sql("customer_rfm", con=engine, if_exists="append", index=False, chunksize=10000)
    print(f"[OK] {len(rfm_agg):,} customer RFM profiles calculated and ingested.\n")

    elapsed = time.time() - start_total_time
    print("=" * 60)
    print(f"INGESTION COMPLETE IN {elapsed:.2f} SECONDS!")
    print(f"Total Unique Customers Analyzed: {len(rfm_agg):,}")
    print(f"Total Completed Orders Processed: {len(valid_orders):,}")
    print("=" * 60)

if __name__ == "__main__":
    validate_environment()
    process_and_ingest()
