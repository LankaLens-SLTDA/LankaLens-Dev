import math

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.destinations import (
    DestinationCreate,
    DestinationListResponse,
    DestinationResponse,
    DestinationUpdate,
)
from app.seed_destinations import SEED_DATASETS
from app.supabase_client import supabase

router = APIRouter(prefix="/api/destinations", tags=["Destinations"])

# In-memory store initialized with full authoritative dataset
IN_MEMORY_DESTINATIONS: list[dict] = [dict(item) for item in SEED_DATASETS]


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def format_destination_record(raw: dict) -> dict:
    """Formats raw database or seed record into complete Destination schema compatibility."""
    desc = raw.get("description") or raw.get("desc") or ""
    image_url = (
        raw.get("image_url") or raw.get("image") or "/stitch_images/discover.png"
    )
    name = raw.get("name") or raw.get("title") or "Sri Lankan Destination"
    title = raw.get("title") or name
    coord_x = raw.get("coord_x") or "50%"
    coord_y = raw.get("coord_y") or "50%"
    distance_str = raw.get("distance_from_colombo") or raw.get("distance") or "N/A"

    return {
        "id": raw["id"],
        "name": name,
        "title": title,
        "category": raw.get("category", "heritage"),
        "district": raw.get("district", "Matale"),
        "province": raw.get("province", "Central"),
        "latitude": float(raw.get("latitude", 7.957)),
        "longitude": float(raw.get("longitude", 80.760)),
        "description": desc,
        "desc": desc,
        "activities": raw.get("activities", ["Sightseeing", "Photography"]),
        "estimated_visit_duration_minutes": int(
            raw.get("estimated_visit_duration_minutes", 180)
        ),
        "baseline_cost": float(raw.get("baseline_cost", 0.0)),
        "popularity": float(raw.get("popularity", 4.5)),
        "rating": float(raw.get("rating", 4.5)),
        "reviews": int(raw.get("reviews", 0)),
        "trust_score": float(raw.get("trust_score", 0.95)),
        "verification_state": raw.get("verification_state", "verified"),
        "publication_status": raw.get("publication_status", "published"),
        "is_verified": bool(raw.get("is_verified", True)),
        "crowd_info": raw.get(
            "crowd_info", {"density": "Moderate", "peak_hours": "10:00 - 14:00"}
        ),
        "community_stats": raw.get("community_stats", {"upvotes": 0, "save_count": 0}),
        "images": raw.get("images", [image_url]),
        "image_url": image_url,
        "image": image_url,
        "coord_x": coord_x,
        "coord_y": coord_y,
        "coords": {"x": coord_x, "y": coord_y},
        "elevation": raw.get("elevation", "N/A"),
        "distance_from_colombo": distance_str,
        "distance": distance_str,
        "distance_km": raw.get("distance_km"),
    }


@router.get(
    "",
    response_model=DestinationListResponse,
    summary="List & filter Sri Lankan destinations",
    description=(
        "Retrieve destinations with search filter support by category, district, province, "
        "verification state, publication status, cost, rating, and search query."
    ),
)
def get_destinations(
    category: str | None = Query(
        None,
        description="Filter by category (temple, nature, beach, wildlife, heritage, culture, adventure)",
    ),
    district: str | None = Query(
        None, description="Filter by Sri Lankan district (e.g. Matale, Badulla, Galle)"
    ),
    province: str | None = Query(
        None, description="Filter by Sri Lankan province (e.g. Central, Uva, Southern)"
    ),
    verification_state: str | None = Query(
        None,
        description="Filter by verification state ('verified', 'community_submitted', 'pending_review')",
    ),
    publication_status: str | None = Query(
        "published",
        description="Filter by publication status ('published', 'draft', 'archived')",
    ),
    verified_only: bool | None = Query(
        False, description="Quick toggle to return only SLTDA verified destinations"
    ),
    q: str | None = Query(
        None, description="Search query string matching name, title, or description"
    ),
    min_cost: float | None = Query(None, description="Minimum baseline visit cost"),
    max_cost: float | None = Query(None, description="Maximum baseline visit cost"),
    min_rating: float | None = Query(
        None, description="Minimum rating / popularity score"
    ),
):
    """Retrieve list of destinations from Supabase or authoritative memory dataset."""
    category = category if isinstance(category, str) else None
    district = district if isinstance(district, str) else None
    province = province if isinstance(province, str) else None
    verification_state = (
        verification_state if isinstance(verification_state, str) else None
    )
    publication_status = (
        publication_status if isinstance(publication_status, str) else "published"
    )
    verified_only = verified_only if isinstance(verified_only, bool) else False
    q = q if isinstance(q, str) else None
    min_cost = min_cost if isinstance(min_cost, (int, float)) else None
    max_cost = max_cost if isinstance(max_cost, (int, float)) else None
    min_rating = min_rating if isinstance(min_rating, (int, float)) else None

    results: list[dict] = []

    if supabase:
        try:
            query = supabase.table("destinations").select("*")
            if publication_status and publication_status != "all":
                query = query.eq("publication_status", publication_status)
            if category and category != "all":
                query = query.eq("category", category)
            if district:
                query = query.ilike("district", f"%{district}%")
            if province:
                query = query.ilike("province", f"%{province}%")
            if verified_only:
                query = query.eq("is_verified", True)
            elif verification_state:
                query = query.eq("verification_state", verification_state)
            if q:
                query = query.or_(f"title.ilike.%{q}%,description.ilike.%{q}%")

            res = query.execute()
            if res.data and len(res.data) > 0:
                results = [format_destination_record(d) for d in res.data]
        except Exception as e:
            print(f"[LankaLens Supabase destinations fallback] {e}")

    if not results:
        results = [format_destination_record(d) for d in IN_MEMORY_DESTINATIONS]

    # Filter in-memory dataset according to query parameters
    if publication_status and publication_status != "all":
        results = [d for d in results if d["publication_status"] == publication_status]
    if category and category != "all":
        results = [d for d in results if d["category"].lower() == category.lower()]
    if district:
        results = [d for d in results if district.lower() in d["district"].lower()]
    if province:
        results = [d for d in results if province.lower() in d["province"].lower()]
    if verified_only:
        results = [d for d in results if d["is_verified"] is True]
    elif verification_state:
        results = [
            d
            for d in results
            if d["verification_state"].lower() == verification_state.lower()
        ]
    if q:
        q_lower = q.lower()
        results = [
            d
            for d in results
            if q_lower in d["name"].lower() or q_lower in d["description"].lower()
        ]
    if min_cost is not None:
        results = [d for d in results if d["baseline_cost"] >= min_cost]
    if max_cost is not None:
        results = [d for d in results if d["baseline_cost"] <= max_cost]
    if min_rating is not None:
        results = [d for d in results if d["rating"] >= min_rating]

    return {"destinations": results, "total": len(results)}


@router.get(
    "/nearby",
    response_model=DestinationListResponse,
    summary="PostGIS Nearby Location Query",
    description="Find destinations near given GPS coordinates within radius in kilometers, sorted by distance.",
)
def get_nearby_destinations(
    lat: float = Query(
        ..., description="Origin latitude coordinate", ge=-90.0, le=90.0
    ),
    lng: float = Query(
        ...,
        description="Origin longitude coordinate",
        ge=-180.0,
        le=180.0,
    ),
    radius_km: float = Query(
        50.0, description="Search radius in kilometers", gt=0, le=500
    ),
    category: str | None = Query(None, description="Optional category filter"),
    verified_only: bool | None = Query(
        False, description="Filter only verified destinations"
    ),
):
    """Execute PostGIS spatial nearby query with Haversine fallback."""
    category = category if isinstance(category, str) else None
    verified_only = verified_only if isinstance(verified_only, bool) else False

    nearby_results: list[dict] = []

    # Attempt PostGIS RPC call via Supabase
    if supabase:
        try:
            rpc_res = supabase.rpc(
                "nearby_destinations",
                {"lat": lat, "lng": lng, "radius_km": radius_km},
            ).execute()
            if rpc_res.data:
                for item in rpc_res.data:
                    formatted = format_destination_record(item)
                    formatted["distance_km"] = round(item.get("distance_km", 0.0), 2)
                    nearby_results.append(formatted)
        except Exception as e:
            print(f"[LankaLens PostGIS RPC fallback to Haversine] {e}")

    # Fallback to in-memory spatial distance calculation
    if not nearby_results:
        all_destinations = [
            format_destination_record(d) for d in IN_MEMORY_DESTINATIONS
        ]
        for dest in all_destinations:
            dist = haversine_distance_km(lat, lng, dest["latitude"], dest["longitude"])
            if dist <= radius_km:
                dest_copy = dict(dest)
                dest_copy["distance_km"] = dist
                nearby_results.append(dest_copy)

        nearby_results.sort(key=lambda x: x["distance_km"])

    # Apply secondary filters
    if category and category != "all":
        nearby_results = [
            d for d in nearby_results if d["category"].lower() == category.lower()
        ]
    if verified_only:
        nearby_results = [d for d in nearby_results if d["is_verified"] is True]

    return {"destinations": nearby_results, "total": len(nearby_results)}


@router.get(
    "/{id}",
    response_model=DestinationResponse,
    summary="Get single destination details",
    description="Retrieve full record details for a single destination by integer ID.",
)
def get_destination(id: int):
    """Get single destination by ID."""
    if supabase:
        try:
            res = supabase.table("destinations").select("*").eq("id", id).execute()
            if res.data and len(res.data) > 0:
                return {
                    "destination": format_destination_record(res.data[0]),
                    "message": "Destination retrieved successfully",
                }
        except Exception as e:
            print(f"[LankaLens Supabase get by id error] {e}")

    # Check in-memory store
    for item in IN_MEMORY_DESTINATIONS:
        if item["id"] == id:
            return {
                "destination": format_destination_record(item),
                "message": "Destination retrieved successfully",
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Destination with ID {id} not found.",
    )


@router.post(
    "",
    response_model=DestinationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new tourism destination record",
    description="Create a new destination record (supports verified official entries or community submissions).",
)
def create_destination(payload: DestinationCreate):
    """Create a new destination record."""
    new_id = max([d["id"] for d in IN_MEMORY_DESTINATIONS] or [0]) + 1
    record = payload.model_dump()
    record["id"] = new_id

    # Automatically ensure boolean & string alignment
    if payload.verification_state == "verified":
        record["is_verified"] = True
    elif payload.verification_state == "community_submitted":
        record["is_verified"] = False

    formatted = format_destination_record(record)
    IN_MEMORY_DESTINATIONS.append(formatted)

    if supabase:
        try:
            supabase.table("destinations").insert(record).execute()
        except Exception as e:
            print(f"[LankaLens Supabase insert error] {e}")

    return {
        "destination": formatted,
        "message": "Destination created successfully",
    }


@router.put(
    "/{id}",
    response_model=DestinationResponse,
    summary="Update existing destination record",
    description="Update destination parameters, category, crowd info, baseline cost, or verification status.",
)
def update_destination(id: int, payload: DestinationUpdate):
    """Update destination by ID."""
    target_idx = None
    for idx, item in enumerate(IN_MEMORY_DESTINATIONS):
        if item["id"] == id:
            target_idx = idx
            break

    if target_idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {id} not found.",
        )

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    IN_MEMORY_DESTINATIONS[target_idx].update(updates)

    if "verification_state" in updates:
        IN_MEMORY_DESTINATIONS[target_idx]["is_verified"] = (
            updates["verification_state"] == "verified"
        )

    formatted = format_destination_record(IN_MEMORY_DESTINATIONS[target_idx])

    if supabase:
        try:
            supabase.table("destinations").update(updates).eq("id", id).execute()
        except Exception as e:
            print(f"[LankaLens Supabase update error] {e}")

    return {
        "destination": formatted,
        "message": "Destination updated successfully",
    }


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete or archive destination record",
    description="Soft delete / archive destination record from the active catalog.",
)
def delete_destination(id: int):
    """Archive or remove destination record."""
    global IN_MEMORY_DESTINATIONS
    found = False

    for item in IN_MEMORY_DESTINATIONS:
        if item["id"] == id:
            item["publication_status"] = "archived"
            found = True
            break

    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {id} not found.",
        )

    if supabase:
        try:
            supabase.table("destinations").update(
                {"publication_status": "archived"}
            ).eq("id", id).execute()
        except Exception as e:
            print(f"[LankaLens Supabase delete error] {e}")

    return {"message": f"Destination with ID {id} archived successfully."}
