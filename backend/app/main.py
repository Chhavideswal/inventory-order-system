from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import products, customers, orders, dashboard
from .database import init_db

app = FastAPI(title="Inventory & Order Management API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup():
    init_db()

# ✅ ROOT ROUTE (fix for your "Not Found")
@app.get("/")
def home():
    return {"message": "Backend is running"}

# API ROUTES
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok"}
