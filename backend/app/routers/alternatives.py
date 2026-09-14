"""FastAPI Router for EPIC 17 — Alternative Destination Engine."""

from fastapi import APIRouter, HTTPException, Query, status

from app.routers.destinations import IN_MEMORY_DESTINATIONS
from app.schemas.alternatives import (
    AlternativeMatchRequest,
    AlternativeMatchResponse,
    SideBySideComparisonResponse,
)
from app.services.alternative_engine import MultiCriteriaAlternativeEngine

router = APIRouter(prefix="/api/alternatives", tags=["Alternative Destination Engine"])

engine = MultiCriteriaAlternativeEngine()


@router.post(
    "/match",
    response_model=AlternativeMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Match explainable alternatives for an overcrowded destination",
    description=(
        "Executes multi-criteria matching across distance, category, activities, budget, "
        "crowd level reduction, rating, and AI trust score to return ranked, explainable alternatives."
    ),
)
def match_alternative_destinations(
    payload: AlternativeMatchRequest,
) -> AlternativeMatchResponse:
    """Finds ranked alternatives for a target destination using multi-attribute evaluation."""
    target = next(
        (d for d in IN_MEMORY_DESTINATIONS if d["id"] == payload.destination_id), None
    )
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Original destination with ID {payload.destination_id} not found.",
        )

    return engine.match_alternatives(payload, IN_MEMORY_DESTINATIONS)


@router.get(
    "/destination/{destination_id}",
    response_model=AlternativeMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Get explainable alternative recommendations for a destination ID",
)
def get_alternatives_for_destination(
    destination_id: int,
    limit: int = Query(
        5, ge=1, le=20, description="Max number of alternatives to return"
    ),
    max_distance_km: float = Query(
        120.0, ge=1.0, le=500.0, description="Search radius in km"
    ),
    max_crowd_level: str = Query(
        "Moderate", description="Max crowd status ('Low' or 'Moderate')"
    ),
) -> AlternativeMatchResponse:
    """Returns top explainable alternatives for a given destination ID."""
    target = next(
        (d for d in IN_MEMORY_DESTINATIONS if d["id"] == destination_id), None
    )
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Original destination with ID {destination_id} not found.",
        )

    actual_limit = limit.default if hasattr(limit, "default") else limit
    actual_dist = (
        max_distance_km.default
        if hasattr(max_distance_km, "default")
        else max_distance_km
    )
    actual_crowd = (
        max_crowd_level.default
        if hasattr(max_crowd_level, "default")
        else max_crowd_level
    )

    req = AlternativeMatchRequest(
        destination_id=destination_id,
        limit=int(actual_limit),
        max_distance_km=float(actual_dist),
        max_crowd_level=str(actual_crowd),
    )
    return engine.match_alternatives(req, IN_MEMORY_DESTINATIONS)


@router.get(
    "/compare/{original_id}/{alternative_id}",
    response_model=SideBySideComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Get side-by-side comparison between original and alternative destination",
)
def compare_destinations_side_by_side(
    original_id: int,
    alternative_id: int,
) -> SideBySideComparisonResponse:
    """Generates detailed side-by-side comparison matrix with match explanations."""
    orig = next((d for d in IN_MEMORY_DESTINATIONS if d["id"] == original_id), None)
    if not orig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Original destination with ID {original_id} not found.",
        )

    alt = next((d for d in IN_MEMORY_DESTINATIONS if d["id"] == alternative_id), None)
    if not alt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alternative destination with ID {alternative_id} not found.",
        )

    return engine.build_side_by_side_comparison(
        original_id, alternative_id, IN_MEMORY_DESTINATIONS
    )
