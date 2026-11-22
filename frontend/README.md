# RetailPulse - Frontend

Enterprise E-commerce Business Intelligence Dashboard built with React, Vite, Tailwind CSS, and Recharts, connecting to the FastAPI backend at `http://127.0.0.1:8001`.

## Features
- **Executive Overview**: Total GMV revenue, total orders, AOV, customer count, on-time delivery rate, monthly revenue & order trends, order status breakdown.
- **Sales Analytics**: Monthly revenue comparison (YoY 2017 vs 2018), revenue & AOV trajectory, payment method distribution, best and lowest performing categories.
- **Customer Analytics**: RFM behavioral segmentation (Champions, Loyal, Potential Loyalists, At Risk, Hibernating), customer acquisition cohorts, spending tiers, and top customer accounts leaderboard.
- **Product Analytics**: Category GMV revenue rankings, unit sales volume, and a comprehensive performance matrix with SKUs, shipping freight, and review scores.
- **Delivery Analytics**: Carrier transit times, estimated delivery target comparison, monthly SLA fulfillment rates, and regional state-by-state benchmarks.
- **Business Insights**: Algorithmic business intelligence findings categorized by severity (Growth Driver, Risk Warning, Action Required, Market Trend) with empirical data evidence and actionable recommendations.

## Prerequisites
- Node.js (v18+)
- Python 3.10+ (for FastAPI backend)

## Setup & Running

### 1. Start Backend Server
From the project root:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
API docs will be available at `http://127.0.0.1:8001/docs`.

### 2. Start Frontend Server
From the `frontend` directory:
```bash
cd frontend
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

### 3. Build for Production
```bash
cd frontend
npm run build
```
Preview production build:
```bash
npm run preview
```
