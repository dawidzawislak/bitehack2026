"""
Recommendation engine for suggesting places to visit.
"""
from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime, timedelta, time
from haversine import haversine, Unit
from pymongo.database import Database

from models import Location, MealRequest, Place, Restaurant, DaySchedule
from opening_hours_parser import OpeningHoursParser, calculate_travel_time


class RecommendationEngine:
    """Engine for generating place recommendations."""
    
    def __init__(self, db: Database):
        self.db = db
        self.parser = OpeningHoursParser()
    
    def calculate_distance(self, loc1: Location, loc2: Dict[str, float]) -> float:
        """Calculate distance between two locations in kilometers."""
        point1 = (loc1.lat, loc1.lng)
        point2 = (loc2["lat"], loc2["lng"])
        return haversine(point1, point2, unit=Unit.KILOMETERS)
    
    def score_place(
        self,
        place: Dict,
        distance_km: float,
        preferred_categories: List[str]
    ) -> float:
        """
        Calculate score for a place.
        
        Scoring formula:
        - If category matches preferences: score = 10 + popularity * 2 - distance_km * 1
        - Otherwise (fallback): score = popularity * 3 - distance_km * 1
        """
        popularity = place.get("popularity", 5)
        place_categories = place.get("categories", [])
        
        # Check if any category matches preferred categories
        category_match = any(
            cat in preferred_categories for cat in place_categories
        ) if preferred_categories else False
        
        if category_match:
            score = 10 + (popularity * 2) - (distance_km * 1)
        else:
            # Fallback: higher weight on popularity
            score = (popularity * 3) - (distance_km * 1)
        
        return score
    
    def is_food_place(self, place: Dict) -> bool:
        """Check if a place is a food/restaurant venue."""
        categories = place.get("categories", [])
        geoapify_categories = place.get("geoapify_categories", [])
        
        # Check if "food" in categories or "catering" in geoapify_categories
        if "food" in categories:
            return True
        
        for geo_cat in geoapify_categories:
            if "catering" in geo_cat:
                return True
        
        return False
    
    def get_candidate_places(
        self,
        start_location: Location,
        end_location: Location,
        date: datetime,
        visited_ids: Set[str],
        preferred_categories: List[str],
        max_distance_km: float = 20.0
    ) -> List[Tuple[Dict, float, float]]:
        """
        Get candidate places for a given day.
        
        Returns:
            List of tuples (place_dict, distance_km, score)
        """
        candidates = []
        
        # Query all places (we'll filter in memory for simplicity)
        # In production, use MongoDB $geoNear for better performance
        all_places = list(self.db.places.find())
        
        for place in all_places:
            # Skip if already visited
            if place.get("id") in visited_ids:
                continue
            
            # Skip food places (they're handled separately as restaurants)
            if self.is_food_place(place):
                continue
            
            # Check if place has required fields
            if not place.get("lat") or not place.get("lng"):
                continue
            
            # Calculate distance from both start and end locations
            dist_from_start = self.calculate_distance(
                start_location,
                {"lat": place["lat"], "lng": place["lng"]}
            )
            dist_from_end = self.calculate_distance(
                end_location,
                {"lat": place["lat"], "lng": place["lng"]}
            )
            
            # Use minimum distance for scoring
            distance_km = min(dist_from_start, dist_from_end)
            
            # Skip if too far
            if distance_km > max_distance_km:
                continue
            
            # Check if open during the day (sample check at 12:00)
            check_time = datetime.combine(date.date(), time(12, 0))
            if not self.parser.is_open(place.get("opening_hours"), check_time):
                continue
            
            # Calculate score
            score = self.score_place(place, distance_km, preferred_categories)
            
            candidates.append((place, distance_km, score))
        
        # Sort by score descending
        candidates.sort(key=lambda x: x[2], reverse=True)
        
        return candidates
    
    def get_restaurant_suggestions(
        self,
        location: Location,
        meal_type: str,
        meal_time: datetime,
        visited_ids: Set[str],
        max_distance_km: float = 5.0,
        limit: int = 5
    ) -> List[Tuple[Dict, float]]:
        """
        Get restaurant suggestions for a specific meal.
        
        Returns:
            List of tuples (restaurant_dict, distance_km)
        """
        suggestions = []
        
        # Query all places
        all_places = list(self.db.places.find())
        
        for place in all_places:
            # Skip if already visited
            if place.get("id") in visited_ids:
                continue
            
            # Only include food places
            if not self.is_food_place(place):
                continue
            
            # Check if place has required fields
            if not place.get("lat") or not place.get("lng"):
                continue
            
            # Calculate distance
            distance_km = self.calculate_distance(
                location,
                {"lat": place["lat"], "lng": place["lng"]}
            )
            
            # Skip if too far
            if distance_km > max_distance_km:
                continue
            
            # Check if open at meal time
            if not self.parser.is_open(place.get("opening_hours"), meal_time):
                continue
            
            # Check meal suitability
            meal_suitability = self.parser.get_meal_suitability(place.get("opening_hours"))
            
            # Map meal type to suitability key
            suitability_key = {
                "breakfast": "breakfast",
                "lunch": "lunch",
                "dinner": "dinner",
                "supper": "dinner"  # Supper uses dinner suitability
            }.get(meal_type.lower(), "lunch")
            
            if not meal_suitability.get(suitability_key, False):
                continue
            
            # Calculate score based on popularity and distance
            popularity = place.get("popularity", 5)
            score = (popularity * 2) - (distance_km * 1)
            
            suggestions.append((place, distance_km, score))
        
        # Sort by score descending
        suggestions.sort(key=lambda x: x[2], reverse=True)
        
        # Return top suggestions
        return [(place, dist) for place, dist, score in suggestions[:limit]]
    
    def allocate_places_to_day(
        self,
        candidates: List[Tuple[Dict, float, float]],
        available_minutes: int,
        visited_ids: Set[str]
    ) -> List[Tuple[Dict, float]]:
        """
        Allocate places to a day schedule based on available time.
        
        Returns:
            List of tuples (place_dict, distance_km)
        """
        allocated = []
        remaining_minutes = available_minutes
        
        for place, distance_km, score in candidates:
            # Get visit duration
            visit_duration = self.parser.parse_visit_time(place.get("avg_visit_time"))
            travel_time = calculate_travel_time(distance_km)
            
            total_time_needed = visit_duration + travel_time
            
            # Check if we have enough time
            if total_time_needed <= remaining_minutes:
                allocated.append((place, distance_km))
                visited_ids.add(place.get("id"))
                remaining_minutes -= total_time_needed
                
                # Stop if we have less than 30 minutes left
                if remaining_minutes < 30:
                    break
        
        return allocated
    
    def generate_recommendations(
        self,
        start_datetime: datetime,
        end_datetime: datetime,
        start_location: Location,
        end_location: Location,
        preferred_categories: List[str],
        meals: List[MealRequest]
    ) -> List[DaySchedule]:
        """
        Generate complete recommendation schedule.
        
        Returns:
            List of DaySchedule objects for each day
        """
        schedule = []
        visited_ids: Set[str] = set()
        
        # Calculate number of days
        current_date = start_datetime.date()
        end_date = end_datetime.date()
        
        # Daily schedule: 9:00 - 21:00 (12 hours = 720 minutes)
        daily_available_minutes = 12 * 60  # 720 minutes
        
        while current_date <= end_date:
            day_datetime = datetime.combine(current_date, time(9, 0))
            
            # Get candidate places for this day
            candidates = self.get_candidate_places(
                start_location=start_location,
                end_location=end_location,
                date=day_datetime,
                visited_ids=visited_ids,
                preferred_categories=preferred_categories
            )
            
            # Allocate meals time (approximate 90 minutes per meal)
            meal_time_total = len(meals) * 90
            available_for_attractions = daily_available_minutes - meal_time_total
            
            # Allocate places to this day
            day_places = self.allocate_places_to_day(
                candidates=candidates,
                available_minutes=available_for_attractions,
                visited_ids=visited_ids
            )
            
            # Convert to Place models
            attractions = []
            for place_dict, distance_km in day_places:
                visit_duration = self.parser.parse_visit_time(place_dict.get("avg_visit_time"))
                travel_time = calculate_travel_time(distance_km)
                
                attractions.append(Place(
                    id=place_dict.get("id", ""),
                    name=place_dict.get("name", "Unknown"),
                    location=Location(
                        lat=place_dict.get("lat"),
                        lng=place_dict.get("lng")
                    ),
                    category=place_dict.get("categories", []),
                    popularity=place_dict.get("popularity"),
                    visit_duration_min=visit_duration,
                    distance_km=round(distance_km, 2),
                    opening_hours=place_dict.get("opening_hours"),
                    travel_time_min=travel_time,
                    formatted_address=place_dict.get("formatted_address"),
                    geoapify_categories=place_dict.get("geoapify_categories"),
                    price_level=place_dict.get("price_level")
                ))
            
            # Get restaurant suggestions for each meal
            meal_suggestions = []
            for meal in meals:
                # Parse preferred time
                try:
                    hour, minute = map(int, meal.preferred_time.split(':'))
                    meal_datetime = datetime.combine(current_date, time(hour, minute))
                except:
                    # Default times
                    default_times = {
                        "breakfast": time(8, 0),
                        "lunch": time(13, 0),
                        "dinner": time(19, 0),
                        "supper": time(20, 0)
                    }
                    meal_time = default_times.get(meal.type.lower(), time(12, 0))
                    meal_datetime = datetime.combine(current_date, meal_time)
                
                # Get suggestions (use start_location as reference)
                restaurant_tuples = self.get_restaurant_suggestions(
                    location=start_location,
                    meal_type=meal.type,
                    meal_time=meal_datetime,
                    visited_ids=visited_ids
                )
                
                for rest_dict, distance_km in restaurant_tuples:
                    visit_duration = self.parser.parse_visit_time(rest_dict.get("avg_visit_time"))
                    travel_time = calculate_travel_time(distance_km)
                    
                    meal_suggestions.append(Restaurant(
                        id=rest_dict.get("id", ""),
                        name=rest_dict.get("name", "Unknown"),
                        location=Location(
                            lat=rest_dict.get("lat"),
                            lng=rest_dict.get("lng")
                        ),
                        category=rest_dict.get("categories", []),
                        geoapify_categories=rest_dict.get("geoapify_categories"),
                        popularity=rest_dict.get("popularity"),
                        visit_duration_min=visit_duration,
                        distance_km=round(distance_km, 2),
                        opening_hours=rest_dict.get("opening_hours"),
                        travel_time_min=travel_time,
                        formatted_address=rest_dict.get("formatted_address"),
                        price_level=rest_dict.get("price_level"),
                        meal_type=meal.type
                    ))
                    
                    # Mark as visited so it's not suggested multiple times
                    visited_ids.add(rest_dict.get("id"))
            
            # Create day schedule
            day_schedule = DaySchedule(
                date=current_date.strftime("%Y-%m-%d"),
                attractions=attractions,
                meal_suggestions=meal_suggestions
            )
            
            schedule.append(day_schedule)
            
            # Move to next day
            current_date += timedelta(days=1)
        
        return schedule
