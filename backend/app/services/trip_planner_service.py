import hashlib
import math
import time
from datetime import datetime, timedelta
from typing import Any

from app.schemas.planner import (
    AddDestinationToTripPayload,
    TripCreatePayload,
    TripExportResponse,
    TripRecord,
    TripUpdatePayload,
)
from app.seed_destinations import SEED_DATASETS
from app.services.budget_service import DeterministicBudgetEstimator


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


def estimate_drive_time_str(dist_km: float) -> str:
    """Estimates travel drive time string based on average Sri Lankan road speeds (~35 km/h)."""
    if dist_km <= 0.1:
        return "0 min"
    hours = dist_km / 35.0
    total_minutes = int(round(hours * 60))
    if total_minutes < 60:
        return f"{total_minutes} mins"
    hrs = total_minutes // 60
    mins = total_minutes % 60
    if mins == 0:
        return f"{hrs} hrs"
    return f"{hrs}h {mins}m"


# Thread-safe in-memory store for persistable user trips
IN_MEMORY_TRIPS: list[dict[str, Any]] = [
    {
        "id": 1,
        "title": "Ceylon Heritage & Cultural Odyssey",
        "start_date": "2026-10-01",
        "duration_days": 5,
        "group_size": 2,
        "total_budget": 1200.0,
        "starting_location": "Colombo",
        "days": [
            {
                "day_number": 1,
                "title": "Day 01: Colombo Arrival & Coastal Heritage",
                "date": "2026-10-01",
                "estimated_travel_time": "1h 15m",
                "estimated_travel_distance_km": 38.5,
                "day_cost": 140.0,
                "stops": [
                    {
                        "id": 101,
                        "destination_id": 3,
                        "name": "Galle Dutch Fort",
                        "title": "Galle Dutch Fort & Heritage Ramparts",
                        "category": "heritage",
                        "district": "Galle",
                        "scheduled_time": "09:30 AM",
                        "estimated_duration": "3.0 hrs",
                        "visit_cost": 0.0,
                        "image": "/stitch_images/discover.png",
                        "latitude": 6.0267,
                        "longitude": 80.217,
                        "notes": "Explore colonial ramparts at sunrise",
                    }
                ],
            },
            {
                "day_number": 2,
                "title": "Day 02: Sigiriya Rock Fortress & Dambulla Caves",
                "date": "2026-10-02",
                "estimated_travel_time": "2h 30m",
                "estimated_travel_distance_km": 72.0,
                "day_cost": 210.0,
                "stops": [
                    {
                        "id": 102,
                        "destination_id": 1,
                        "name": "Sigiriya Ancient Rock Fortress",
                        "title": "Sigiriya Ancient Rock Fortress",
                        "category": "heritage",
                        "district": "Matale",
                        "scheduled_time": "08:00 AM",
                        "estimated_duration": "4.0 hrs",
                        "visit_cost": 36.0,
                        "image": "/stitch_images/discover.png",
                        "latitude": 7.957,
                        "longitude": 80.760,
                        "notes": "Climb before 09:00 AM to avoid heat",
                    },
                    {
                        "id": 103,
                        "destination_id": 4,
                        "name": "Dambulla Royal Cave Temple",
                        "title": "Dambulla Royal Cave Temple (Jambukola Viharaya)",
                        "category": "temple",
                        "district": "Matale",
                        "scheduled_time": "02:00 PM",
                        "estimated_duration": "2.0 hrs",
                        "visit_cost": 10.0,
                        "image": "/stitch_images/planner.png",
                        "latitude": 7.8567,
                        "longitude": 80.6483,
                        "notes": "Dress modestly covering shoulders and knees",
                    },
                ],
            },
            {
                "day_number": 3,
                "title": "Day 03: Kandy Sacred Temple of Tooth & Royal Botanical",
                "date": "2026-10-03",
                "estimated_travel_time": "1h 45m",
                "estimated_travel_distance_km": 54.0,
                "day_cost": 180.0,
                "stops": [
                    {
                        "id": 104,
                        "destination_id": 6,
                        "name": "Temple of the Sacred Tooth Relic",
                        "title": "Kandy Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)",
                        "category": "temple",
                        "district": "Kandy",
                        "scheduled_time": "09:00 AM",
                        "estimated_duration": "2.5 hrs",
                        "visit_cost": 12.0,
                        "image": "/stitch_images/map.png",
                        "latitude": 7.2936,
                        "longitude": 80.6413,
                        "notes": "Attend the morning Puja ceremony",
                    }
                ],
            },
            {
                "day_number": 4,
                "title": "Day 04: Nuwara Eliya Tea Gardens & Highland Train",
                "date": "2026-10-04",
                "estimated_travel_time": "3h 10m",
                "estimated_travel_distance_km": 88.0,
                "day_cost": 195.0,
                "stops": [
                    {
                        "id": 105,
                        "destination_id": 7,
                        "name": "Horton Plains & World's End",
                        "title": "Horton Plains & World's End Precipice",
                        "category": "nature",
                        "district": "Nuwara Eliya",
                        "scheduled_time": "06:00 AM",
                        "estimated_duration": "4.5 hrs",
                        "visit_cost": 25.0,
                        "image": "/stitch_images/planner.png",
                        "latitude": 6.8028,
                        "longitude": 80.8092,
                        "notes": "Arrive early before mist obscures the precipice view",
                    }
                ],
            },
            {
                "day_number": 5,
                "title": "Day 05: Ella Nine Arch Bridge & Demodara Loop",
                "date": "2026-10-05",
                "estimated_travel_time": "1h 20m",
                "estimated_travel_distance_km": 42.0,
                "day_cost": 160.0,
                "stops": [
                    {
                        "id": 106,
                        "destination_id": 2,
                        "name": "Ella Nine Arch Bridge",
                        "title": "Ella Nine Arch Bridge & Demodara Viaduct",
                        "category": "heritage",
                        "district": "Badulla",
                        "scheduled_time": "08:30 AM",
                        "estimated_duration": "3.0 hrs",
                        "visit_cost": 0.0,
                        "image": "/stitch_images/discover.png",
                        "latitude": 6.8768,
                        "longitude": 81.0608,
                        "notes": "Watch the morning train pass over the bridge",
                    }
                ],
            },
        ],
        "total_calculated_cost": 885.0,
        "per_person_cost": 442.5,
        "total_travel_distance_km": 294.5,
        "budget_fit_status": "Under Budget",
        "share_token": "trip_ceylon_1_a8f9e1",
        "created_at": "2026-09-12T18:00:00Z",
        "updated_at": "2026-09-12T18:00:00Z",
    }
]


class TripPlannerService:
    """Multi-Day Spatial Trip Planner & Automated Itinerary Generator Engine."""

    @classmethod
    def _recalculate_trip_metrics(cls, trip_dict: dict[str, Any]) -> dict[str, Any]:
        """Recalculates travel times, distances, daily costs, and budget status across all days."""
        total_dist = 0.0
        total_ticket_costs = 0.0

        for day in trip_dict.get("days", []):
            stops = day.get("stops", [])
            day_dist = 0.0
            day_tickets = 0.0

            if len(stops) >= 2:
                for i in range(len(stops) - 1):
                    s1 = stops[i]
                    s2 = stops[i + 1]
                    try:
                        d = haversine_distance_km(
                            float(s1.get("latitude", 7.0)),
                            float(s1.get("longitude", 80.0)),
                            float(s2.get("latitude", 7.0)),
                            float(s2.get("longitude", 80.0)),
                        )
                        day_dist += d
                    except (ValueError, TypeError):
                        pass

            for s in stops:
                try:
                    day_tickets += float(s.get("visit_cost", 0.0))
                except (ValueError, TypeError):
                    pass

            day["estimated_travel_distance_km"] = round(day_dist, 2)
            day["estimated_travel_time"] = estimate_drive_time_str(day_dist)
            day["day_cost"] = round(
                day_tickets + 45.0, 2
            )  # Entry tickets + daily food/transport baseline share

            total_dist += day_dist
            total_ticket_costs += day_tickets

        # Total cost rollup: Stay + Transport + Food + Activities
        duration = max(1, int(trip_dict.get("duration_days", 1)))
        group_size = max(1, int(trip_dict.get("group_size", 1)))
        target_budget = float(trip_dict.get("total_budget", 1000.0))

        # Use DeterministicBudgetEstimator for full trip baseline
        estimator = DeterministicBudgetEstimator()
        dest_ids = []
        for day in trip_dict.get("days", []):
            for s in day.get("stops", []):
                if s.get("destination_id"):
                    dest_ids.append(s["destination_id"])

        calc_req = estimator.calculate_trip_budget(
            type(
                "Req",
                (),
                {
                    "travellers_count": group_size,
                    "duration_days": duration,
                    "accommodation_style": "mid_range",
                    "transport_mode": "private_car",
                    "food_preference": "mid_tier_restaurants",
                    "activity_level": "moderate_cultural",
                    "destination_ids": dest_ids,
                    "currency": "USD",
                },
            )()
        )

        total_cost = calc_req.total_budget
        per_person = round(total_cost / group_size, 2)

        if total_cost <= target_budget * 0.95:
            fit_status = "Under Budget"
        elif total_cost <= target_budget * 1.05:
            fit_status = "Exact Fit"
        else:
            fit_status = "Over Budget"

        trip_dict["total_calculated_cost"] = total_cost
        trip_dict["per_person_cost"] = per_person
        trip_dict["total_travel_distance_km"] = round(total_dist, 2)
        trip_dict["budget_fit_status"] = fit_status
        trip_dict["updated_at"] = datetime.utcnow().isoformat() + "Z"
        return trip_dict

    @classmethod
    def list_trips(cls) -> list[TripRecord]:
        """Lists all trips persisted in the user account store."""
        results = []
        for raw in IN_MEMORY_TRIPS:
            updated = cls._recalculate_trip_metrics(dict(raw))
            results.append(TripRecord(**updated))
        return results

    @classmethod
    def get_trip(cls, trip_id: int) -> TripRecord:
        """Retrieves a single trip record by ID."""
        for raw in IN_MEMORY_TRIPS:
            if raw["id"] == trip_id:
                updated = cls._recalculate_trip_metrics(dict(raw))
                return TripRecord(**updated)
        raise ValueError(f"Trip with ID {trip_id} not found.")

    @classmethod
    def create_trip(
        cls, payload: TripCreatePayload, dataset: list[dict[str, Any]] | None = None
    ) -> TripRecord:
        """Creates a new multi-day trip with auto-assigned itinerary stops."""
        dest_pool = dataset if dataset is not None else SEED_DATASETS
        dest_map = {d["id"]: d for d in dest_pool}

        new_id = max([t["id"] for t in IN_MEMORY_TRIPS] or [0]) + 1
        token = f"trip_ceylon_{new_id}_{hashlib.md5(str(time.time()).encode()).hexdigest()[:6]}"

        try:
            start_dt = datetime.strptime(payload.start_date, "%Y-%m-%d")
        except ValueError:
            start_dt = datetime.utcnow()

        selected_dests = []
        for did in payload.destination_ids:
            if did in dest_map:
                selected_dests.append(dest_map[did])

        if not selected_dests:
            selected_dests = dest_pool[: max(3, payload.duration_days)]

        # Distribute destinations across daily itinerary plans
        days_list: list[dict[str, Any]] = []
        dests_per_day = math.ceil(len(selected_dests) / max(1, payload.duration_days))

        for d_idx in range(payload.duration_days):
            day_num = d_idx + 1
            day_dt = start_dt + timedelta(days=d_idx)
            day_date_str = day_dt.strftime("%Y-%m-%d")

            day_dests = selected_dests[
                d_idx * dests_per_day : (d_idx + 1) * dests_per_day
            ]
            stops_list: list[dict[str, Any]] = []

            for s_idx, d_item in enumerate(day_dests):
                stop_id = (new_id * 100) + (d_idx * 10) + s_idx + 1
                times = ["08:30 AM", "01:00 PM", "04:30 PM"]
                time_str = times[s_idx % len(times)]

                cost_val = 0.0
                if d_item.get("baseline_cost") is not None:
                    try:
                        cost_val = float(d_item["baseline_cost"])
                    except (ValueError, TypeError):
                        pass

                stops_list.append(
                    {
                        "id": stop_id,
                        "destination_id": d_item["id"],
                        "name": d_item.get("name")
                        or d_item.get("title")
                        or "Destination",
                        "title": d_item.get("title")
                        or d_item.get("name")
                        or "Destination",
                        "category": d_item.get("category", "heritage"),
                        "district": d_item.get("district", "Matale"),
                        "scheduled_time": time_str,
                        "estimated_duration": "2.5 hrs",
                        "visit_cost": cost_val,
                        "image": d_item.get("image_url")
                        or "/stitch_images/discover.png",
                        "latitude": float(d_item.get("latitude", 7.957)),
                        "longitude": float(d_item.get("longitude", 80.760)),
                        "notes": f"Auto-scheduled stop for {d_item.get('name')}",
                    }
                )

            day_title = (
                f"Day 0{day_num}: {day_dests[0]['district']} Exploration"
                if day_dests
                else f"Day 0{day_num}: Island Discovery"
            )

            days_list.append(
                {
                    "day_number": day_num,
                    "title": day_title,
                    "date": day_date_str,
                    "stops": stops_list,
                    "estimated_travel_time": "1h 00m",
                    "estimated_travel_distance_km": 25.0,
                    "day_cost": 100.0,
                }
            )

        new_trip = {
            "id": new_id,
            "title": payload.title,
            "start_date": payload.start_date,
            "duration_days": payload.duration_days,
            "group_size": payload.group_size,
            "total_budget": payload.total_budget,
            "starting_location": payload.starting_location,
            "days": days_list,
            "total_calculated_cost": 0.0,
            "per_person_cost": 0.0,
            "total_travel_distance_km": 0.0,
            "budget_fit_status": "Under Budget",
            "share_token": token,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }

        updated_trip = cls._recalculate_trip_metrics(new_trip)
        IN_MEMORY_TRIPS.append(updated_trip)

        return TripRecord(**updated_trip)

    @classmethod
    def update_trip(cls, trip_id: int, payload: TripUpdatePayload) -> TripRecord:
        """Updates an existing trip's metadata or daily itinerary schedule."""
        target_idx = None
        for idx, raw in enumerate(IN_MEMORY_TRIPS):
            if raw["id"] == trip_id:
                target_idx = idx
                break

        if target_idx is None:
            raise ValueError(f"Trip with ID {trip_id} not found.")

        target = IN_MEMORY_TRIPS[target_idx]
        if payload.title is not None:
            target["title"] = payload.title
        if payload.start_date is not None:
            target["start_date"] = payload.start_date
        if payload.duration_days is not None:
            target["duration_days"] = payload.duration_days
        if payload.group_size is not None:
            target["group_size"] = payload.group_size
        if payload.total_budget is not None:
            target["total_budget"] = payload.total_budget
        if payload.starting_location is not None:
            target["starting_location"] = payload.starting_location
        if payload.days is not None:
            target["days"] = [d.model_dump() for d in payload.days]

        updated = cls._recalculate_trip_metrics(target)
        IN_MEMORY_TRIPS[target_idx] = updated
        return TripRecord(**updated)

    @classmethod
    def add_destination_to_trip(
        cls,
        trip_id: int,
        payload: AddDestinationToTripPayload,
        dataset: list[dict[str, Any]] | None = None,
    ) -> TripRecord:
        """Adds a destination stop to a target day in the trip itinerary."""
        dest_pool = dataset if dataset is not None else SEED_DATASETS
        target_dest = next(
            (d for d in dest_pool if d["id"] == payload.destination_id), None
        )
        if not target_dest:
            raise ValueError(f"Destination with ID {payload.destination_id} not found.")

        target_idx = None
        for idx, raw in enumerate(IN_MEMORY_TRIPS):
            if raw["id"] == trip_id:
                target_idx = idx
                break

        if target_idx is None:
            raise ValueError(f"Trip with ID {trip_id} not found.")

        trip = IN_MEMORY_TRIPS[target_idx]
        days = trip.get("days", [])

        # Ensure target day exists or append new day
        target_day_obj = next(
            (d for d in days if d["day_number"] == payload.target_day), None
        )
        if not target_day_obj:
            day_num = len(days) + 1
            target_day_obj = {
                "day_number": day_num,
                "title": f"Day 0{day_num}: {target_dest.get('district', 'Island')} Exploration",
                "date": "2026-10-01",
                "stops": [],
                "estimated_travel_time": "0 min",
                "estimated_travel_distance_km": 0.0,
                "day_cost": 0.0,
            }
            days.append(target_day_obj)

        new_stop_id = (trip_id * 100) + len(target_day_obj.get("stops", [])) + 1
        cost_val = 0.0
        if target_dest.get("baseline_cost") is not None:
            try:
                cost_val = float(target_dest["baseline_cost"])
            except (ValueError, TypeError):
                pass

        new_stop = {
            "id": new_stop_id,
            "destination_id": target_dest["id"],
            "name": target_dest.get("name")
            or target_dest.get("title")
            or "Destination",
            "title": target_dest.get("title")
            or target_dest.get("name")
            or "Destination",
            "category": target_dest.get("category", "heritage"),
            "district": target_dest.get("district", "Matale"),
            "scheduled_time": payload.scheduled_time or "11:00 AM",
            "estimated_duration": "2.5 hrs",
            "visit_cost": cost_val,
            "image": target_dest.get("image_url") or "/stitch_images/discover.png",
            "latitude": float(target_dest.get("latitude", 7.957)),
            "longitude": float(target_dest.get("longitude", 80.760)),
            "notes": payload.notes or f"Added {target_dest.get('name')}",
        }

        target_day_obj["stops"].append(new_stop)

        updated = cls._recalculate_trip_metrics(trip)
        IN_MEMORY_TRIPS[target_idx] = updated
        return TripRecord(**updated)

    @classmethod
    def remove_destination_from_trip(
        cls, trip_id: int, destination_id: int, day_number: int | None = None
    ) -> TripRecord:
        """Removes a destination stop from a trip."""
        target_idx = None
        for idx, raw in enumerate(IN_MEMORY_TRIPS):
            if raw["id"] == trip_id:
                target_idx = idx
                break

        if target_idx is None:
            raise ValueError(f"Trip with ID {trip_id} not found.")

        trip = IN_MEMORY_TRIPS[target_idx]
        for day in trip.get("days", []):
            if day_number is not None and day["day_number"] != day_number:
                continue
            day["stops"] = [
                s
                for s in day.get("stops", [])
                if s.get("destination_id") != destination_id
            ]

        updated = cls._recalculate_trip_metrics(trip)
        IN_MEMORY_TRIPS[target_idx] = updated
        return TripRecord(**updated)

    @classmethod
    def export_trip(cls, trip_id: int) -> TripExportResponse:
        """Exports a trip payload with shareable URL token."""
        trip_record = cls.get_trip(trip_id)
        share_url = (
            f"https://lankalens.sltda.gov.lk/planner/share/{trip_record.share_token}"
        )
        return TripExportResponse(
            share_token=trip_record.share_token,
            share_url=share_url,
            trip=trip_record,
        )
