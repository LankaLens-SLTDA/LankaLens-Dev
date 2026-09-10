from pydantic import BaseModel
from typing import Optional, List

class Coords(BaseModel):
    x: str
    y: str

class Destination(BaseModel):
    id: int
    title: str
    category: str
    region: str
    rating: float
    reviews: int
    desc: str
    image: str
    coords: Coords
    elevation: str
    distance: str

class DestinationResponse(BaseModel):
    destinations: List[Destination]
    total: int
