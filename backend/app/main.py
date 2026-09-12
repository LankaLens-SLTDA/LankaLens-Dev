from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ai_assistant, community, destinations, planner, sustainability

tags_metadata = [
    {
        "name": "Health",
        "description": "System health and status monitoring endpoints.",
    },
    {
        "name": "Destinations",
        "description": "Cartographic destinations, cultural heritage sites, and filtering capabilities.",
    },
    {
        "name": "Planner",
        "description": "Smart itinerary builder, day-by-day routing, and travel budget optimization.",
    },
    {
        "name": "AI Assistant",
        "description": "Conversational travel recommendations powered by AI models.",
    },
    {
        "name": "Sustainability",
        "description": "Real-time crowd density analysis and crowdsourced environmental hazard reporting.",
    },
    {
        "name": "Community Feed",
        "description": "Verified traveler posts, eco contributions, and local explorer stories.",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "**LankaLens API Platform**: Precision Cartography & Intelligent Sustainable Tourism API for Sri Lanka.\n\n"
        "Provides REST endpoints for exploring destinations, building dynamic multi-day itineraries, "
        "interacting with AI assistants, tracking real-time site crowd density, and reporting eco hazards."
    ),
    version="1.0.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "LankaLens Platform Engineering",
        "url": "https://github.com/LankaLens-SLTDA/LankaLens-Dev",
        "email": "dev@lankalens.lk",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configure CORS dynamically from settings
origins = (
    settings.CORS_ORIGINS
    if isinstance(settings.CORS_ORIGINS, list)
    else [settings.CORS_ORIGINS]
)
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


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Health check endpoint",
    description="Returns current API operational status, service name, and active environment.",
)
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
