from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import destinations, planner, ai_assistant, sustainability, community

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Precision Cartography & Intelligent Tourism API for Sri Lanka",
    version="1.0.0",
)

# Configure CORS dynamically from settings
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
if "*" not in origins and "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(destinations.router)
app.include_router(planner.router)
app.include_router(ai_assistant.router)
app.include_router(sustainability.router)
app.include_router(community.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

