import time
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import init_db, engine
from app.api import api_router

app = FastAPI(
    title=settings.APP_NAME,
    description="High-performance executive analytics & business intelligence API powering the RetailPulse dashboard.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access (Vercel production and localhost dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows Vercel preview URLs and local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

@app.on_event("startup")
def on_startup():
    """Ensure database schema is created on application startup."""
    init_db()

@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for deployment monitoring (Render, Neon)."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database_dialect": engine.dialect.name,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

app.include_router(api_router)
