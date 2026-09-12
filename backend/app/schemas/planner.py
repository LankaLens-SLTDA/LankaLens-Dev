from typing import Any

from pydantic import BaseModel, Field


class BudgetItem(BaseModel):
    name: str = Field(
        ..., description="Category of expense", json_schema_extra={"example": "Stay"}
    )
    cost: float = Field(
        ..., description="Estimated cost in USD", json_schema_extra={"example": 450.0}
    )
    color: str = Field(
        ...,
        description="Hex color code for UI visualization",
        json_schema_extra={"example": "#0F5C56"},
    )


class DayPlan(BaseModel):
    id: int = Field(
        ..., description="Day index of the itinerary", json_schema_extra={"example": 1}
    )
    title: str = Field(
        ...,
        description="Title and focus for the day",
        json_schema_extra={"example": "Colombo Arrival & Coastal Heritage"},
    )
    stopsCount: int = Field(
        ..., description="Number of scheduled stops", json_schema_extra={"example": 3}
    )
    duration: str = Field(
        ...,
        description="Estimated total activity duration",
        json_schema_extra={"example": "4.5 hrs"},
    )


class PlannerOverview(BaseModel):
    days: list[DayPlan] = Field(..., description="List of daily itinerary plans")
    totalBudget: float = Field(
        ...,
        description="Total estimated budget in USD",
        json_schema_extra={"example": 1160.0},
    )
    budgetBreakdown: list[BudgetItem] = Field(
        ..., description="Breakdown of costs by category"
    )


class BudgetCalculationRequest(BaseModel):
    travellers_count: int = Field(
        1,
        ge=1,
        description="Number of travelers in the trip",
        json_schema_extra={"example": 2},
    )
    duration_days: int = Field(
        5, ge=1, description="Trip duration in days", json_schema_extra={"example": 7}
    )
    accommodation_style: str = Field(
        "mid_range",
        description="Accommodation tier ('budget', 'mid_range', 'luxury', 'homestay')",
        json_schema_extra={"example": "mid_range"},
    )
    transport_mode: str = Field(
        "private_car",
        description="Primary transportation ('tuk_tuk', 'private_car', 'public_train', 'express_bus', 'flight')",
        json_schema_extra={"example": "private_car"},
    )
    food_preference: str = Field(
        "mid_tier_restaurants",
        description="Dining preference ('local_eateries', 'mid_tier_restaurants', 'fine_dining', 'self_catering')",
        json_schema_extra={"example": "mid_tier_restaurants"},
    )
    activity_level: str = Field(
        "moderate_cultural",
        description="Activity tier ('budget_free', 'moderate_cultural', 'all_inclusive_safari')",
        json_schema_extra={"example": "moderate_cultural"},
    )
    destination_ids: list[int] | None = Field(
        None,
        description="Optional list of target destination IDs to factor exact ticket costs into activities",
        json_schema_extra={"example": [1, 2, 4]},
    )
    currency: str = Field(
        "USD", description="Currency symbol/code", json_schema_extra={"example": "USD"}
    )


class CostCategoryBreakdown(BaseModel):
    category: str = Field(
        ...,
        description="Expense category name",
        json_schema_extra={"example": "Accommodation"},
    )
    amount: float = Field(
        ...,
        description="Estimated cost amount in USD",
        json_schema_extra={"example": 350.0},
    )
    percentage: float = Field(
        ...,
        description="Percentage share of total trip budget",
        json_schema_extra={"example": 40.0},
    )
    color: str = Field(
        ...,
        description="Hex code for UI rendering",
        json_schema_extra={"example": "#0F5C56"},
    )
    description: str = Field(
        ...,
        description="Details and breakdown explanation",
        json_schema_extra={"example": "Mid-range eco lodges ($70/night)"},
    )


class BudgetCalculationResponse(BaseModel):
    total_budget: float = Field(
        ...,
        description="Total estimated trip budget in USD",
        json_schema_extra={"example": 875.0},
    )
    per_person_budget: float = Field(
        ...,
        description="Estimated cost per person",
        json_schema_extra={"example": 437.5},
    )
    per_day_budget: float = Field(
        ..., description="Estimated cost per day", json_schema_extra={"example": 175.0}
    )
    currency: str = Field(
        "USD", description="Target currency code", json_schema_extra={"example": "USD"}
    )
    breakdown: list[CostCategoryBreakdown] = Field(
        ..., description="Itemized 5-category budget allocation"
    )
    travel_style_tier: str = Field(
        ...,
        description="Computed travel tier ('Budget Comfort', 'Mid-Range Heritage', 'Luxury Ceylon')",
    )
    calculation_model: str = Field(
        ...,
        description="Algorithm used ('Deterministic Multi-Factor Engine (Baseline Rates)')",
    )
    savings_tips: list[str] = Field(
        ..., description="Contextual money-saving recommendations for Sri Lanka travel"
    )
    query_time_ms: float = Field(..., description="Execution calculation latency in ms")


class BudgetRecommendationRequest(BaseModel):
    max_budget: float = Field(
        ...,
        ge=1.0,
        description="Maximum total trip budget in USD",
        json_schema_extra={"example": 1000.0},
    )
    travellers_count: int = Field(
        1, ge=1, description="Number of travelers", json_schema_extra={"example": 2}
    )
    duration_days: int = Field(
        5, ge=1, description="Trip duration in days", json_schema_extra={"example": 5}
    )
    interests: list[str] = Field(
        default_factory=list, description="Target travel interest tags"
    )


class BudgetRecommendationResponse(BaseModel):
    recommended_destinations: list[dict[str, Any]] = Field(
        ..., description="Destinations matching budget allocation"
    )
    estimated_trip_cost: float = Field(
        ..., description="Estimated budget cost for selected destinations"
    )
    budget_fit_status: str = Field(
        ...,
        description="Budget fit status ('Under Budget', 'Exact Fit', 'Over Budget')",
    )
    budget_utilization_pct: float = Field(
        ..., description="Percentage of max_budget consumed"
    )


# =========================================================
# EPIC 15 — TRIP PLANNER & ITINERARY SCHEMAS
# =========================================================


class TripStopItem(BaseModel):
    id: int = Field(
        ..., description="Unique stop ID", json_schema_extra={"example": 101}
    )
    destination_id: int = Field(
        ..., description="Target destination ID", json_schema_extra={"example": 1}
    )
    name: str = Field(
        ...,
        description="Destination name",
        json_schema_extra={"example": "Sigiriya Rock Fortress"},
    )
    title: str = Field(
        ...,
        description="Destination title",
        json_schema_extra={"example": "Sigiriya Ancient Rock Fortress"},
    )
    category: str = Field(
        ..., description="Category tag", json_schema_extra={"example": "heritage"}
    )
    district: str = Field(
        ..., description="District location", json_schema_extra={"example": "Matale"}
    )
    scheduled_time: str = Field(
        "09:00 AM",
        description="Scheduled start time for stop",
        json_schema_extra={"example": "09:00 AM"},
    )
    estimated_duration: str = Field(
        "2.5 hrs",
        description="Estimated visit duration",
        json_schema_extra={"example": "2.5 hrs"},
    )
    visit_cost: float = Field(
        0.0,
        description="Visit entry ticket cost USD",
        json_schema_extra={"example": 36.0},
    )
    image: str = Field(
        "/stitch_images/discover.png",
        description="Image asset URL",
        json_schema_extra={"example": "/stitch_images/discover.png"},
    )
    latitude: float = Field(
        7.957, description="GPS Latitude", json_schema_extra={"example": 7.957}
    )
    longitude: float = Field(
        80.760, description="GPS Longitude", json_schema_extra={"example": 80.760}
    )
    notes: str | None = Field(
        None,
        description="Optional custom notes",
        json_schema_extra={"example": "Visit at sunrise to avoid crowds"},
    )


class TripDayPlan(BaseModel):
    day_number: int = Field(
        ..., description="1-indexed day number", json_schema_extra={"example": 1}
    )
    title: str = Field(
        ...,
        description="Day title focus",
        json_schema_extra={"example": "Day 01: Cultural Heritage"},
    )
    date: str = Field(
        "2026-10-01",
        description="Date string YYYY-MM-DD",
        json_schema_extra={"example": "2026-10-01"},
    )
    stops: list[TripStopItem] = Field(
        default_factory=list,
        description="List of scheduled destination stops for the day",
    )
    estimated_travel_time: str = Field(
        "1.5 hrs",
        description="Total drive/travel time between stops",
        json_schema_extra={"example": "1.5 hrs"},
    )
    estimated_travel_distance_km: float = Field(
        0.0,
        description="Total drive distance in kilometers",
        json_schema_extra={"example": 45.2},
    )
    day_cost: float = Field(
        0.0,
        description="Estimated total cost for the day USD",
        json_schema_extra={"example": 120.0},
    )


class TripCreatePayload(BaseModel):
    title: str = Field(
        "My Sri Lanka Ceylon Odyssey",
        description="Trip title",
        json_schema_extra={"example": "7-Day Cultural Triangle & Coast"},
    )
    start_date: str = Field(
        "2026-10-01",
        description="Start date YYYY-MM-DD",
        json_schema_extra={"example": "2026-10-01"},
    )
    duration_days: int = Field(
        5,
        ge=1,
        le=30,
        description="Trip duration in days",
        json_schema_extra={"example": 5},
    )
    group_size: int = Field(
        2,
        ge=1,
        description="Number of travelers in group",
        json_schema_extra={"example": 2},
    )
    total_budget: float = Field(
        1200.0,
        ge=1.0,
        description="Target total budget in USD",
        json_schema_extra={"example": 1200.0},
    )
    starting_location: str = Field(
        "Colombo",
        description="Starting city / origin location",
        json_schema_extra={"example": "Colombo"},
    )
    destination_ids: list[int] = Field(
        default_factory=list,
        description="Optional pre-selected destination IDs to assign",
        json_schema_extra={"example": [1, 2, 4, 5]},
    )
    interests: list[str] = Field(
        default_factory=list,
        description="Travel interest tags",
        json_schema_extra={"example": ["heritage", "nature"]},
    )


class TripUpdatePayload(BaseModel):
    title: str | None = Field(None, description="Updated trip title")
    start_date: str | None = Field(None, description="Updated start date YYYY-MM-DD")
    duration_days: int | None = Field(None, description="Updated duration in days")
    group_size: int | None = Field(None, description="Updated group size")
    total_budget: float | None = Field(None, description="Updated total budget USD")
    starting_location: str | None = Field(None, description="Updated starting location")
    days: list[TripDayPlan] | None = Field(
        None, description="Updated daily itinerary plans"
    )


class TripRecord(BaseModel):
    id: int = Field(..., description="Unique trip ID", json_schema_extra={"example": 1})
    title: str = Field(..., description="Trip title")
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    duration_days: int = Field(..., description="Duration in days")
    group_size: int = Field(..., description="Group size")
    total_budget: float = Field(..., description="Target budget USD")
    starting_location: str = Field(..., description="Starting origin city")
    days: list[TripDayPlan] = Field(..., description="Multi-day itinerary schedule")
    total_calculated_cost: float = Field(
        ..., description="Sum of daily costs + estimated transport/stay"
    )
    per_person_cost: float = Field(..., description="Calculated cost per person USD")
    total_travel_distance_km: float = Field(
        ..., description="Total travel distance across trip in km"
    )
    budget_fit_status: str = Field(
        ...,
        description="Budget fit indicator ('Under Budget', 'Exact Fit', 'Over Budget')",
    )
    share_token: str = Field(
        ..., description="Unique token for exporting / sharing trip"
    )
    created_at: str = Field(..., description="ISO creation timestamp")
    updated_at: str = Field(..., description="ISO updated timestamp")


class AddDestinationToTripPayload(BaseModel):
    destination_id: int = Field(
        ..., description="Destination ID to add", json_schema_extra={"example": 3}
    )
    target_day: int = Field(
        1,
        ge=1,
        description="Target day number to assign stop to",
        json_schema_extra={"example": 1},
    )
    scheduled_time: str = Field(
        "10:00 AM",
        description="Custom scheduled time",
        json_schema_extra={"example": "10:00 AM"},
    )
    notes: str | None = Field(
        None,
        description="Optional custom notes",
        json_schema_extra={"example": "Hire local guide"},
    )


class ReorderStopsPayload(BaseModel):
    day_number: int = Field(
        ...,
        ge=1,
        description="Day number being reordered",
        json_schema_extra={"example": 1},
    )
    destination_ids: list[int] = Field(
        ..., description="Ordered list of destination IDs for the day"
    )


class TripExportResponse(BaseModel):
    share_token: str = Field(..., description="Unique share token")
    share_url: str = Field(..., description="Shareable URL for viewing itinerary")
    trip: TripRecord = Field(..., description="Complete exported trip record")
