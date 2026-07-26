import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, dns_records, hosted_zones

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Route 53 Clone API", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(dns_records.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
