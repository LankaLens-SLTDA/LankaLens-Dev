import math
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

from app.schemas.sustainability import (
    AlternativeDestinationSuggestion,
    CrowdStatusInfo,
    DensityPoint,
    EnvironmentalReportRecord,
    HazardReport,
    HazardReportResponse,
    VisitorLoadCurveResponse,
)
from app.seed_destinations import SEED_DATASETS


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0
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


IN_MEMORY_HAZARD_REPORTS: list[dict[str, Any]] = [
    {
        "id": 1,
        "location": "Sigiriya Rock North Pass Stairway",
        "description": "Loose handrail section near step 420. Maintenance required.",
        "reporter_name": "Dinuka Silva (Ranger Guide)",
        "status": "investigating",
        "reward_points_awarded": 50,
        "created_at": "2026-09-14T08:30:00Z",
    },
    {
        "id": 2,
        "location": "Pidurangala Rock Access Trail",
        "description": "Heavy soil erosion after morning rainfall near boulder section.",
        "reporter_name": "Clara Dupont",
        "status": "pending",
        "reward_points_awarded": 50,
        "created_at": "2026-09-14T10:15:00Z",
    },
]


class BaseCrowdEngine(ABC):
    """Abstract Base Class for LankaLens Sustainability & Crowd Intelligence Engines.

    Enables pluggable architecture for threshold rules & future ML demand forecasting models.
    """

    @abstractmethod
    def get_crowd_status(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> CrowdStatusInfo:
        pass

    @abstractmethod
    def get_visitor_load_curve(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> VisitorLoadCurveResponse:
        pass

    @abstractmethod
    def get_crowd_alternatives(
        self,
        destination_id: int,
        limit: int = 3,
        dataset: list[dict[str, Any]] | None = None,
    ) -> list[AlternativeDestinationSuggestion]:
        pass


class ThresholdCrowdEngine(BaseCrowdEngine):
    """Rule-based Threshold Crowd Intelligence Engine for MVP & Phase 2."""

    def get_crowd_status(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> CrowdStatusInfo:
        dest_pool = dataset if dataset is not None else SEED_DATASETS
        target = next((d for d in dest_pool if d["id"] == destination_id), None)

        if not target:
            target = dest_pool[0]

        # Calculate crowd score based on popularity, rating, and density info
        pop = float(target.get("popularity") or 4.5)
        crowd_info = target.get("crowd_info") or {}
        density_str = ""
        if isinstance(crowd_info, dict):
            density_str = str(crowd_info.get("density", "Moderate")).lower()
        else:
            density_str = str(crowd_info).lower()

        # Compute normalized crowd score (0.0 to 1.0)
        base_score = min(1.0, pop / 5.0)
        if "high" in density_str or "heavy" in density_str or "over" in density_str:
            crowd_score = min(0.95, base_score + 0.15)
        elif "low" in density_str or "quiet" in density_str:
            crowd_score = max(0.20, base_score - 0.30)
        else:
            crowd_score = round(base_score, 2)

        # Classification Thresholds
        if crowd_score >= 0.75:
            status_label = "High"
            is_overcrowded = True
            capacity_pct = round(crowd_score * 100, 1)
            warning = (
                f"Overcrowding Warning: {target.get('name')} is currently at {capacity_pct}% visitor capacity. "
                f"Consider visiting nearby lower-crowd alternatives to reduce environmental footprint."
            )
        elif crowd_score >= 0.40:
            status_label = "Moderate"
            is_overcrowded = False
            capacity_pct = round(crowd_score * 100, 1)
            warning = None
        else:
            status_label = "Low"
            is_overcrowded = False
            capacity_pct = round(crowd_score * 100, 1)
            warning = None

        peak_h = "10:00 - 14:00"
        if isinstance(crowd_info, dict) and crowd_info.get("peak_hours"):
            peak_h = crowd_info["peak_hours"]

        return CrowdStatusInfo(
            destination_id=target["id"],
            destination_name=target.get("name") or target.get("title") or "Destination",
            crowd_score=crowd_score,
            crowd_status=status_label,
            is_overcrowded=is_overcrowded,
            current_capacity_pct=capacity_pct,
            peak_hours=peak_h,
            warning_message=warning,
        )

    def get_visitor_load_curve(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> VisitorLoadCurveResponse:
        status_info = self.get_crowd_status(destination_id, dataset)

        # Generate 24-hour visitor curve multiplier based on crowd score
        peak_multiplier = status_info.crowd_score * 1500
        hourly_curve = [
            DensityPoint(hour="06:00", density=int(peak_multiplier * 0.15)),
            DensityPoint(hour="08:00", density=int(peak_multiplier * 0.45)),
            DensityPoint(hour="10:00", density=int(peak_multiplier * 0.85)),
            DensityPoint(hour="12:00", density=int(peak_multiplier * 1.00)),
            DensityPoint(hour="14:00", density=int(peak_multiplier * 0.88)),
            DensityPoint(hour="16:00", density=int(peak_multiplier * 0.55)),
            DensityPoint(hour="18:00", density=int(peak_multiplier * 0.25)),
            DensityPoint(hour="20:00", density=int(peak_multiplier * 0.08)),
        ]

        return VisitorLoadCurveResponse(
            destination_id=status_info.destination_id,
            destination_name=status_info.destination_name,
            hourly_curve=hourly_curve,
            peak_hour="12:00 PM",
            recommended_offpeak_hours=["Before 08:30 AM", "After 04:30 PM"],
        )

    def get_crowd_alternatives(
        self,
        destination_id: int,
        limit: int = 3,
        dataset: list[dict[str, Any]] | None = None,
    ) -> list[AlternativeDestinationSuggestion]:
        dest_pool = dataset if dataset is not None else SEED_DATASETS
        target = next((d for d in dest_pool if d["id"] == destination_id), None)

        if not target:
            target = dest_pool[0]

        target_lat = float(target.get("latitude", 7.957))
        target_lng = float(target.get("longitude", 80.760))

        suggestions: list[AlternativeDestinationSuggestion] = []

        for candidate in dest_pool:
            if candidate["id"] == destination_id:
                continue

            c_lat = float(candidate.get("latitude", 7.957))
            c_lng = float(candidate.get("longitude", 80.760))
            dist = haversine_distance_km(target_lat, target_lng, c_lat, c_lng)

            # Consider alternatives within 120 km radius
            if dist <= 120.0:
                c_status = self.get_crowd_status(candidate["id"], dest_pool)

                # Prefer Low or Moderate alternatives
                if c_status.crowd_status in ["Low", "Moderate"]:
                    target_status = self.get_crowd_status(destination_id, dest_pool)
                    reduction = max(
                        15.0,
                        round(
                            (
                                (target_status.crowd_score - c_status.crowd_score)
                                / max(0.1, target_status.crowd_score)
                            )
                            * 100,
                            1,
                        ),
                    )

                    reason = (
                        f"Located {dist} km from {target.get('name')}. "
                        f"Offers similar {candidate.get('category')} experiences with {reduction}% lower crowd congestion."
                    )

                    suggestions.append(
                        AlternativeDestinationSuggestion(
                            destination_id=candidate["id"],
                            name=candidate.get("name")
                            or candidate.get("title")
                            or "Alternative",
                            category=candidate.get("category", "heritage"),
                            district=candidate.get("district", "Central"),
                            crowd_status=c_status.crowd_status,
                            crowd_reduction_pct=reduction,
                            distance_km=dist,
                            rating=float(candidate.get("rating") or 4.5),
                            image_url=candidate.get("image_url")
                            or "/stitch_images/discover.png",
                            recommendation_reason=reason,
                        )
                    )

        # Sort by distance and rating
        suggestions.sort(
            key=lambda x: (x.crowd_status == "Low", x.rating, -x.distance_km),
            reverse=True,
        )

        return suggestions[:limit]


class MLDemandForecastingAdapter(BaseCrowdEngine):
    """Adapter class wrapping dynamic ML visitor demand forecasting models with fallback."""

    def __init__(self, fallback_engine: BaseCrowdEngine | None = None):
        self.fallback = fallback_engine or ThresholdCrowdEngine()

    def get_crowd_status(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> CrowdStatusInfo:
        return self.fallback.get_crowd_status(destination_id, dataset)

    def get_visitor_load_curve(
        self, destination_id: int, dataset: list[dict[str, Any]] | None = None
    ) -> VisitorLoadCurveResponse:
        return self.fallback.get_visitor_load_curve(destination_id, dataset)

    def get_crowd_alternatives(
        self,
        destination_id: int,
        limit: int = 3,
        dataset: list[dict[str, Any]] | None = None,
    ) -> list[AlternativeDestinationSuggestion]:
        return self.fallback.get_crowd_alternatives(destination_id, limit, dataset)


def submit_environmental_hazard_report(payload: HazardReport) -> HazardReportResponse:
    """Submits a crowdsourced environmental or safety hazard report."""
    new_id = max([r["id"] for r in IN_MEMORY_HAZARD_REPORTS] or [0]) + 1
    record = {
        "id": new_id,
        "location": payload.location,
        "description": payload.description,
        "reporter_name": payload.reporter_name or "Cartographer Explorer",
        "status": "pending",
        "reward_points_awarded": 50,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    IN_MEMORY_HAZARD_REPORTS.append(record)

    return HazardReportResponse(
        status="success",
        message=f"Hazard report for '{payload.location}' transmitted to LankaLens Ranger Network.",
        rewardPoints=50,
    )


def list_environmental_hazard_reports() -> list[EnvironmentalReportRecord]:
    """Lists all crowdsourced environmental hazard reports."""
    return [EnvironmentalReportRecord(**r) for r in IN_MEMORY_HAZARD_REPORTS]
