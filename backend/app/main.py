from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import products, customers, orders, dashboard
from .database import init_db

app = FastAPI(title="Inventory & Order Management API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup (IMPORTANT for Render)
@app.on_event("startup")
def startup():
    init_db()

# Routes
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok"}
