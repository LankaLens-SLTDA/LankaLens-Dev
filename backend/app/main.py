from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    admin,
    ai_assistant,
    alternatives,
    analytics,
    arrangements,
    community,
    contribution,
    destinations,
    partners,
    planner,
    recommendations,
    reputation,
    sustainability,
)

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
    {
        "name": "Contribution Pipeline & Moderation",
        "description": "Photo submission pipeline, EXIF metadata extraction, AI validation guard, and content moderation.",
    },
    {
        "name": "Trust, Reputation & Gamification",
        "description": "Contributor recognition ladder, badges, reputation score analytics, and guide marketplace onboarding.",
    },
    {
        "name": "Local Partner Network",
        "description": "Local tourism partner onboarding, verified listings, and PostGIS spatial proximity discovery.",
    },
    {
        "name": "Trip Arrangement Broker",
        "description": "Matches trip itineraries against verified local guides, agencies, hotels, vehicle rentals, and transport services.",
    },
    {
        "name": "Admin & Moderation Platform",
        "description": "Centralized control panel managing content, users, destinations, partner approvals, guide verifications, hazard reviews, and audit logs.",
    },
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "**LankaLens API Platform**: Precision Cartography & Intelligent Sustainable Tourism API for Sri Lanka.\n\n"
        "Provides REST endpoints for exploring destinations, building dynamic multi-day itineraries, "
        "interacting with AI assistants, tracking real-time site crowd density, and submitting verified contributions."
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

# Set CORS middleware
origins = (
    settings.CORS_ORIGINS
    if isinstance(settings.CORS_ORIGINS, list)
    else [settings.CORS_ORIGINS]
)

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
app.include_router(contribution.router)
app.include_router(reputation.router)
app.include_router(recommendations.router)
app.include_router(alternatives.router)
app.include_router(partners.router)
app.include_router(arrangements.router)
app.include_router(admin.router)
app.include_router(analytics.router)


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
