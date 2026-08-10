from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(title="SellVia API", version="0.1.0")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "env": settings.environment}
