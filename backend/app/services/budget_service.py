import math
import time
from abc import ABC, abstractmethod
from typing import Any

from app.schemas.planner import (
    BudgetCalculationRequest,
    BudgetCalculationResponse,
    BudgetRecommendationRequest,
    BudgetRecommendationResponse,
    CostCategoryBreakdown,
)
from app.seed_destinations import SEED_DATASETS


class BaseBudgetEstimator(ABC):
    """Abstract Base Class for LankaLens Budget Estimation Engines.

    Enables pluggable architecture for deterministic baseline rules & future ML regression models.
    """

    @abstractmethod
    def calculate_trip_budget(
        self, req: BudgetCalculationRequest
    ) -> BudgetCalculationResponse:
        pass


class DeterministicBudgetEstimator(BaseBudgetEstimator):
    """Deterministic Multi-Factor Budget Engine based on Sri Lanka baseline rates."""

    ACCOMMODATION_RATES = {
        "homestay": 25.0,
        "budget": 40.0,
        "mid_range": 85.0,
        "luxury": 220.0,
    }

    TRANSPORT_RATES = {
        "public_train": 8.0,
        "express_bus": 12.0,
        "tuk_tuk": 25.0,
        "private_car": 65.0,
        "flight": 140.0,
    }

    FOOD_RATES = {
        "self_catering": 10.0,
        "local_eateries": 18.0,
        "mid_tier_restaurants": 35.0,
        "fine_dining": 80.0,
    }

    ACTIVITY_RATES = {
        "budget_free": 8.0,
        "moderate_cultural": 25.0,
        "all_inclusive_safari": 75.0,
    }

    def calculate_trip_budget(
        self, req: BudgetCalculationRequest
    ) -> BudgetCalculationResponse:
        start_time = time.time()

        travellers = max(1, req.travellers_count)
        days = max(1, req.duration_days)

        # 1. Accommodation Calculation
        rooms_needed = math.ceil(travellers / 2)
        nightly_rate = self.ACCOMMODATION_RATES.get(
            req.accommodation_style.lower(), 85.0
        )
        total_acc = round(rooms_needed * nightly_rate * days, 2)

        # 2. Transport Calculation
        daily_transport_rate = self.TRANSPORT_RATES.get(
            req.transport_mode.lower(), 65.0
        )
        total_transport = round(daily_transport_rate * days, 2)

        # 3. Food Calculation
        daily_food_rate = self.FOOD_RATES.get(req.food_preference.lower(), 35.0)
        total_food = round(daily_food_rate * days * travellers, 2)

        # 4. Activities Calculation
        destination_ticket_sum = 0.0
        if req.destination_ids:
            dest_map = {d["id"]: d for d in SEED_DATASETS}
            for did in req.destination_ids:
                if did in dest_map:
                    cost = dest_map[did].get("baseline_cost", 0.0)
                    try:
                        destination_ticket_sum += float(cost)
                    except (ValueError, TypeError):
                        pass

        daily_act_rate = self.ACTIVITY_RATES.get(req.activity_level.lower(), 25.0)
        base_act_cost = daily_act_rate * days * travellers
        total_activities = round(
            base_act_cost + (destination_ticket_sum * travellers), 2
        )

        # 5. Miscellaneous Buffer (8% of subtotal)
        subtotal = total_acc + total_transport + total_food + total_activities
        total_misc = round(subtotal * 0.08, 2)

        total_budget = round(subtotal + total_misc, 2)
        per_person = round(total_budget / travellers, 2)
        per_day = round(total_budget / days, 2)

        # Build Category Breakdown
        breakdown = [
            CostCategoryBreakdown(
                category="Accommodation",
                amount=total_acc,
                percentage=round((total_acc / max(1.0, total_budget)) * 100, 1),
                color="#0F5C56",
                description=f"{rooms_needed} room(s) at ${nightly_rate}/night ({req.accommodation_style.replace('_', ' ').title()})",
            ),
            CostCategoryBreakdown(
                category="Transport",
                amount=total_transport,
                percentage=round((total_transport / max(1.0, total_budget)) * 100, 1),
                color="#8FD3D6",
                description=f"{req.transport_mode.replace('_', ' ').title()} at ${daily_transport_rate}/day for {days} days",
            ),
            CostCategoryBreakdown(
                category="Food & Dining",
                amount=total_food,
                percentage=round((total_food / max(1.0, total_budget)) * 100, 1),
                color="#5E2E19",
                description=f"{req.food_preference.replace('_', ' ').title()} at ${daily_food_rate}/day per person",
            ),
            CostCategoryBreakdown(
                category="Activities & Experiences",
                amount=total_activities,
                percentage=round((total_activities / max(1.0, total_budget)) * 100, 1),
                color="#E08A2C",
                description=f"{req.activity_level.replace('_', ' ').title()} pass + monument entry tickets",
            ),
            CostCategoryBreakdown(
                category="Miscellaneous & Emergency",
                amount=total_misc,
                percentage=round((total_misc / max(1.0, total_budget)) * 100, 1),
                color="#6C757D",
                description="Local SIM card, tipping, water & 8% emergency buffer",
            ),
        ]

        # Determine Travel Style Tier
        if per_day < 60.0:
            tier = "Backpacker Comfort"
        elif per_day < 160.0:
            tier = "Mid-Range Explorer"
        else:
            tier = "Luxury Ceylon Heritage"

        # Actionable Sri Lanka Travel Savings Tips
        tips = [
            "Book Sri Lanka Railways Observation Car 30 days in advance to save 60% on inter-city transfers.",
            "Hire SLTDA-certified local guides directly at cultural sites for standardized non-inflated rates.",
            "Purchase combined cultural triangle site passes to save on single-entry tickets.",
            "Opt for local eco-tuk co-ops for short-distance regional travel.",
        ]

        query_time = round((time.time() - start_time) * 1000, 2)

        return BudgetCalculationResponse(
            total_budget=total_budget,
            per_person_budget=per_person,
            per_day_budget=per_day,
            currency="USD",
            breakdown=breakdown,
            travel_style_tier=tier,
            calculation_model="Deterministic Multi-Factor Engine (Baseline Rates)",
            savings_tips=tips,
            query_time_ms=query_time,
        )

    def get_budget_recommendations(
        self,
        req: BudgetRecommendationRequest,
        dataset: list[dict[str, Any]] | None = None,
    ) -> BudgetRecommendationResponse:
        destinations = dataset if dataset is not None else SEED_DATASETS

        # Filter destinations by baseline cost and rating
        filtered = []
        for d in destinations:
            cost = d.get("baseline_cost", 0.0)
            try:
                c_val = float(cost)
            except (ValueError, TypeError):
                c_val = 0.0

            # Calculate total visit cost including baseline fee + daily activity estimate
            est_visit_cost = c_val * req.travellers_count
            if est_visit_cost <= (
                req.max_budget * 0.4
            ):  # Destination cost fits budget share
                filtered.append(d)

        # Sort recommended destinations by rating / popularity
        filtered.sort(
            key=lambda x: (
                float(x.get("rating") or 4.5),
                float(x.get("popularity") or 4.5),
            ),
            reverse=True,
        )

        top_destinations = filtered[:5]
        dest_costs = (
            sum([float(d.get("baseline_cost") or 0.0) for d in top_destinations])
            * req.travellers_count
        )
        est_total = round(
            dest_costs + (req.duration_days * 50.0 * req.travellers_count), 2
        )

        if est_total <= req.max_budget * 0.9:
            fit_status = "Under Budget"
        elif est_total <= req.max_budget * 1.1:
            fit_status = "Exact Fit"
        else:
            fit_status = "Over Budget"

        utilization = round((est_total / max(1.0, req.max_budget)) * 100, 1)

        return BudgetRecommendationResponse(
            recommended_destinations=top_destinations,
            estimated_trip_cost=est_total,
            budget_fit_status=fit_status,
            budget_utilization_pct=utilization,
        )


class MLBudgetPricingAdapter(BaseBudgetEstimator):
    """Adapter class wrapping dynamic ML pricing models with deterministic fallback."""

    def __init__(self, fallback_estimator: BaseBudgetEstimator | None = None):
        self.fallback = fallback_estimator or DeterministicBudgetEstimator()

    def calculate_trip_budget(
        self, req: BudgetCalculationRequest
    ) -> BudgetCalculationResponse:
        try:
            # Placeholder interface for dynamic ML model (e.g. XGBoost / Dynamic Pricing API)
            # In production without ML weights, delegate cleanly to baseline deterministic engine
            res = self.fallback.calculate_trip_budget(req)
            res.calculation_model = (
                "LankaLens ML Dynamic Pricing Adapter (Hybrid Baseline)"
            )
            return res
        except Exception:
            return self.fallback.calculate_trip_budget(req)
