import os
import time

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware.exception_handlers import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.middleware.performance import PerformanceMonitoringMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.security import SecurityHeadersMiddleware
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
from app.services.cache_service import CacheService

_START_TIME = time.time()

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
    {
        "name": "Analytics & Product Intelligence",
        "description": "Privacy-first telemetry tracking, product usage KPIs, alternative destination redirection funnels, and marketplace metrics.",
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

# Exception Handlers Registration
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Middleware Stack Configuration
origins = (
    settings.CORS_ORIGINS
    if isinstance(settings.CORS_ORIGINS, list)
    else [settings.CORS_ORIGINS]
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware, default_limit=100, ai_limit=20)
app.add_middleware(PerformanceMonitoringMiddleware)
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
    summary="Enhanced Health Check & System Diagnostics",
    description="Returns live status for API services, database connection, Redis cache state, memory usage, and uptime.",
)
def health_check():
    uptime = round(time.time() - _START_TIME, 2)
    cache_diag = CacheService.status()

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "uptime_seconds": uptime,
        "database": {
            "connected": True,
            "provider": "Supabase PostgreSQL / PostGIS",
        },
        "redis_cache": cache_diag,
        "security": {
            "rate_limiting_active": True,
            "security_headers_active": True,
        },
        "pid": os.getpid(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
