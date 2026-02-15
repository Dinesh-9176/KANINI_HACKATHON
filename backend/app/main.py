"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.triage import router as triage_router

app = FastAPI(
    title="AI Triage API",
    description="AI-powered patient triage prediction system",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(triage_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI Triage API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
