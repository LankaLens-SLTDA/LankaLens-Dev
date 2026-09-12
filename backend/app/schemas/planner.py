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
        1, ge=1, description="Number of travelers in the trip", json_schema_extra={"example": 2}
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
    currency: str = Field("USD", description="Currency symbol/code", json_schema_extra={"example": "USD"})


class CostCategoryBreakdown(BaseModel):
    category: str = Field(..., description="Expense category name", json_schema_extra={"example": "Accommodation"})
    amount: float = Field(..., description="Estimated cost amount in USD", json_schema_extra={"example": 350.0})
    percentage: float = Field(..., description="Percentage share of total trip budget", json_schema_extra={"example": 40.0})
    color: str = Field(..., description="Hex code for UI rendering", json_schema_extra={"example": "#0F5C56"})
    description: str = Field(..., description="Details and breakdown explanation", json_schema_extra={"example": "Mid-range eco lodges ($70/night)"})


class BudgetCalculationResponse(BaseModel):
    total_budget: float = Field(..., description="Total estimated trip budget in USD", json_schema_extra={"example": 875.0})
    per_person_budget: float = Field(..., description="Estimated cost per person", json_schema_extra={"example": 437.5})
    per_day_budget: float = Field(..., description="Estimated cost per day", json_schema_extra={"example": 175.0})
    currency: str = Field("USD", description="Target currency code", json_schema_extra={"example": "USD"})
    breakdown: list[CostCategoryBreakdown] = Field(..., description="Itemized 5-category budget allocation")
    travel_style_tier: str = Field(..., description="Computed travel tier ('Budget Comfort', 'Mid-Range Heritage', 'Luxury Ceylon')")
    calculation_model: str = Field(..., description="Algorithm used ('Deterministic Multi-Factor Engine (Baseline Rates)')")
    savings_tips: list[str] = Field(..., description="Contextual money-saving recommendations for Sri Lanka travel")
    query_time_ms: float = Field(..., description="Execution calculation latency in ms")


class BudgetRecommendationRequest(BaseModel):
    max_budget: float = Field(..., ge=1.0, description="Maximum total trip budget in USD", json_schema_extra={"example": 1000.0})
    travellers_count: int = Field(1, ge=1, description="Number of travelers", json_schema_extra={"example": 2})
    duration_days: int = Field(5, ge=1, description="Trip duration in days", json_schema_extra={"example": 5})
    interests: list[str] = Field(default_factory=list, description="Target travel interest tags")


class BudgetRecommendationResponse(BaseModel):
    recommended_destinations: list[dict[str, Any]] = Field(..., description="Destinations matching budget allocation")
    estimated_trip_cost: float = Field(..., description="Estimated budget cost for selected destinations")
    budget_fit_status: str = Field(..., description="Budget fit status ('Under Budget', 'Exact Fit', 'Over Budget')")
    budget_utilization_pct: float = Field(..., description="Percentage of max_budget consumed")
