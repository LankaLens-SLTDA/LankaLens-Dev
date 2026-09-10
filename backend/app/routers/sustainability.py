from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])

class DensityPoint(BaseModel):
    hour: str
    density: int

class HazardReport(BaseModel):
    location: str
    description: str

@router.get("/density", response_model=List[DensityPoint])
def get_crowd_density():
    return [
        {"hour": "06:00", "density": 120},
        {"hour": "08:00", "density": 450},
        {"hour": "10:00", "density": 1100},
        {"hour": "12:00", "density": 1420},
        {"hour": "14:00", "density": 1250},
        {"hour": "16:00", "density": 780},
        {"hour": "18:00", "density": 310},
    ]

@router.post("/report")
def submit_hazard_report(report: HazardReport):
    return {
        "status": "success",
        "message": f"Hazard report for '{report.location}' transmitted to LankaLens Ranger Network.",
        "rewardPoints": 50
    }
