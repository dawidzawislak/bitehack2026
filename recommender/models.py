"""
Pydantic models for recommendation API.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class Location(BaseModel):
    """Geographic location."""
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")


class MealRequest(BaseModel):
    """Meal preference in the request."""
    type: str = Field(..., description="Meal type: breakfast, lunch, dinner, supper")
    preferred_time: str = Field(..., description="Preferred time in HH:MM format")


class RecommendRequest(BaseModel):
    """Request model for recommendations."""
    start_datetime: datetime = Field(..., description="Trip start date and time")
    end_datetime: datetime = Field(..., description="Trip end date and time")
    start_location: Location = Field(..., description="Starting location coordinates")
    end_location: Location = Field(..., description="Ending location coordinates")
    preferred_categories: List[str] = Field(
        default=[],
        description="Preferred place categories (e.g., 'history', 'architecture', 'art')"
    )
    meals: List[MealRequest] = Field(
        default=[],
        description="Meal preferences for each day"
    )


class Place(BaseModel):
    """Place information in response."""
    id: str = Field(..., description="Unique place identifier")
    name: str = Field(..., description="Place name")
    location: Location = Field(..., description="Place coordinates")
    category: List[str] = Field(..., description="Place categories")
    popularity: Optional[int] = Field(None, description="Popularity score (5-10)")
    visit_duration_min: int = Field(..., description="Recommended visit duration in minutes")
    distance_km: float = Field(..., description="Distance from start/end location in kilometers")
    opening_hours: Optional[str] = Field(None, description="Opening hours string")
    travel_time_min: int = Field(..., description="Estimated travel time to this place in minutes")
    formatted_address: Optional[str] = Field(None, description="Full address")
    geoapify_categories: Optional[List[str]] = Field(None, description="Detailed categories")
    price_level: Optional[int] = Field(None, description="Price level (0=free, 1-3=paid)")


class Restaurant(BaseModel):
    """Restaurant information in response."""
    id: str = Field(..., description="Unique restaurant identifier")
    name: str = Field(..., description="Restaurant name")
    location: Location = Field(..., description="Restaurant coordinates")
    category: List[str] = Field(..., description="Restaurant categories")
    geoapify_categories: Optional[List[str]] = Field(None, description="Detailed categories (e.g., catering.restaurant.italian)")
    popularity: Optional[int] = Field(None, description="Popularity score")
    visit_duration_min: int = Field(..., description="Expected meal duration in minutes")
    distance_km: float = Field(..., description="Distance from current location in kilometers")
    opening_hours: Optional[str] = Field(None, description="Opening hours")
    travel_time_min: int = Field(..., description="Estimated travel time in minutes")
    formatted_address: Optional[str] = Field(None, description="Full address")
    price_level: Optional[int] = Field(None, description="Price level")
    meal_type: str = Field(..., description="breakfast, lunch, dinner, or supper")


class DaySchedule(BaseModel):
    """Schedule for a single day."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    attractions: List[Place] = Field(..., description="Recommended attractions for this day")
    meal_suggestions: List[Restaurant] = Field(..., description="Restaurant suggestions for meals")


class RecommendResponse(BaseModel):
    """Response model for recommendations."""
    schedule: List[DaySchedule] = Field(..., description="Daily schedule for the entire trip")
    total_days: int = Field(..., description="Total number of days in the trip")
    total_attractions: int = Field(..., description="Total number of attractions recommended")
