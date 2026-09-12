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
