"""FastAPI Router for EPIC 19 — Local Partner Network."""

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.partners import (
    PartnerListResponse,
    PartnerOnboardingPayload,
    PartnerProfile,
)
from app.services.partner_service import SEED_PARTNERS, LocalPartnerService

router = APIRouter(prefix="/api/partners", tags=["Local Partner Network"])

# In-memory store initialized with authoritative seed partner network
IN_MEMORY_PARTNERS: list[dict] = [dict(item) for item in SEED_PARTNERS]

service = LocalPartnerService()


@router.post(
    "/onboard",
    response_model=PartnerProfile,
    status_code=status.HTTP_201_CREATED,
    summary="Onboard new local tourism partner",
    description="Registers new tour guide, agency, hotel, vehicle rental, or transport service partner and assigns SLTDA verification state.",
)
def onboard_partner(payload: PartnerOnboardingPayload) -> PartnerProfile:
    """Onboards new local tourism partner into LankaLens network."""
    return service.onboard_partner(payload, IN_MEMORY_PARTNERS)


def _unwrap_query(val: Any) -> Any:
    return val.default if hasattr(val, "default") else val


@router.get(
    "",
    response_model=PartnerListResponse,
    status_code=status.HTTP_200_OK,
    summary="Search & filter local tourism partner listings",
    description="Filter partners by partner type (guide, agency, hotel, vehicle, transport), district, province, and verification status.",
)
def get_partners(
    partner_type: str | None = Query(
        None, description="Type: 'guide', 'agency', 'hotel', 'vehicle', 'transport'"
    ),
    district: str | None = Query(
        None, description="District filter (e.g. Matale, Badulla)"
    ),
    province: str | None = Query(
        None, description="Province filter (e.g. Central, Uva)"
    ),
    verified_only: bool = Query(
        False, description="Filter for SLTDA verified partners only"
    ),
    featured_only: bool = Query(False, description="Filter for featured partners only"),
    destination_id: int | None = Query(
        None, description="Filter for partners associated with destination ID"
    ),
) -> PartnerListResponse:
    """Search and filter partner network listings."""
    p_type = _unwrap_query(partner_type)
    dist = _unwrap_query(district)
    prov = _unwrap_query(province)
    v_only = bool(_unwrap_query(verified_only))
    f_only = bool(_unwrap_query(featured_only))
    dest_id = _unwrap_query(destination_id)

    return service.get_partners(
        partner_type=p_type,
        district=dist,
        province=prov,
        verified_only=v_only,
        featured_only=f_only,
        destination_id=dest_id,
        dataset=IN_MEMORY_PARTNERS,
    )


@router.get(
    "/nearby",
    response_model=PartnerListResponse,
    status_code=status.HTTP_200_OK,
    summary="Discover nearby partners using spatial proximity matching",
    description="Executes Haversine & PostGIS spatial proximity search to find partners near target lat/lng coordinates or destination ID.",
)
def discover_nearby_partners(
    lat: float = Query(7.957, description="Target origin latitude"),
    lng: float = Query(80.760, description="Target origin longitude"),
    radius_km: float = Query(
        50.0, ge=1.0, le=500.0, description="Proximity radius in km"
    ),
    partner_type: str | None = Query(None, description="Optional partner type filter"),
    destination_id: int | None = Query(
        None, description="Optional destination ID association"
    ),
) -> PartnerListResponse:
    """Executes spatial PostGIS / Haversine proximity partner discovery."""
    actual_lat = float(_unwrap_query(lat))
    actual_lng = float(_unwrap_query(lng))
    actual_rad = float(_unwrap_query(radius_km))
    p_type = _unwrap_query(partner_type)
    dest_id = _unwrap_query(destination_id)

    return service.discover_nearby_partners(
        lat=actual_lat,
        lng=actual_lng,
        radius_km=actual_rad,
        partner_type=p_type,
        destination_id=dest_id,
        dataset=IN_MEMORY_PARTNERS,
    )


@router.get(
    "/destination/{destination_id}",
    response_model=PartnerListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get partners associated with a specific trip destination",
)
def get_destination_partners(destination_id: int) -> PartnerListResponse:
    """Retrieves partners associated with a specific destination ID."""
    return service.get_partners(
        partner_type=None,
        district=None,
        province=None,
        verified_only=False,
        featured_only=False,
        destination_id=destination_id,
        dataset=IN_MEMORY_PARTNERS,
    )


@router.get(
    "/{partner_id}",
    response_model=PartnerProfile,
    status_code=status.HTTP_200_OK,
    summary="Get detailed partner profile by ID",
)
def get_partner_by_id(partner_id: int) -> PartnerProfile:
    """Fetches partner profile details by ID."""
    profile = service.get_partner_profile(partner_id, IN_MEMORY_PARTNERS)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Partner with ID {partner_id} not found.",
        )
    return profile
