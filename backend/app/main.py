"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes.triage import router as triage_router
from app.routes import dashboard
from app.routes.ehr import router as ehr_router
from app.routes.patients import router as patients_router
from app.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB on startup
    init_db()
    yield

app = FastAPI(
    title="AI Triage API",
    description="AI-powered patient triage prediction system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.19.41:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(triage_router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ehr_router, prefix="/api")
app.include_router(patients_router, prefix="/api")

from app.routes.resources import router as resources_router
app.include_router(resources_router, prefix="/api")

from app.routes.voice import router as voice_router
app.include_router(voice_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI Triage API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
