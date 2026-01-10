"""
Recommendation engine for suggesting places to visit.
"""
from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime, timedelta, time
from haversine import haversine, Unit
from pymongo.database import Database

from src.models import Location, DayRequest, Place, Restaurant, DaySchedule, TimelineItem
from src.opening_hours_parser import OpeningHoursParser, calculate_travel_time


class RecommendationEngine:
    """Engine for generating place recommendations."""
    
    # Meal time windows
    MEAL_TIME_WINDOWS = {
        "breakfast": (time(8, 0), time(10, 0)),
        "lunch": (time(12, 0), time(14, 0)),
        "dinner": (time(16, 0), time(18, 0)),
        "supper": (time(20, 0), time(22, 0))
    }
    
    def __init__(self, db: Database):
        self.db = db
        self.parser = OpeningHoursParser()
    
    def validate_and_adjust_meal_time(
        self,
        meal_type: str,
        day_start: time,
        day_end: time,
        current_date: datetime.date
    ) -> Optional[datetime]:
        """
        Validate and adjust meal time to fit within day boundaries.
        
        Returns:
            datetime for the meal or None if meal doesn't fit
        """
        if meal_type not in self.MEAL_TIME_WINDOWS:
            return None
        
        window_start, window_end = self.MEAL_TIME_WINDOWS[meal_type]
        
        # Check if meal window overlaps with day schedule
        if window_end < day_start or window_start > day_end:
            return None  # Meal window completely outside day schedule
        
        # Adjust meal time to fit within day boundaries
        meal_start = max(window_start, day_start)
        meal_start = min(meal_start, day_end)
        
        # Check if we have at least 30 minutes for the meal
        meal_end_limit = min(window_end, day_end)
        if (datetime.combine(current_date, meal_end_limit) - 
            datetime.combine(current_date, meal_start)).total_seconds() / 60 < 30:
            return None  # Not enough time for meal
        
        return datetime.combine(current_date, meal_start)
    
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
        food_preferences: List[str] = [],
        max_distance_km: float = 5.0,
        limit: int = 5
    ) -> List[Tuple[Dict, float]]:
        """
        Get restaurant suggestions for a specific meal.
        
        Returns:
            List of tuples (restaurant_dict, distance_km)
        """
        suggestions = []
        
        # Default food type preferences by meal type
        default_preferences = {
            "breakfast": ["catering.cafe", "catering.cafe.coffee"],
            "lunch": ["catering.cafe", "catering.restaurant"],
            "dinner": ["catering.restaurant"],
            "supper": ["catering.restaurant", "catering.pub"]
        }
        
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
            
            place_food_categories = place.get('geoapify_categories', [])
            
            # If user has food preferences, filter strictly by them
            if food_preferences:
                has_preferred_food = any(
                    pref in place_food_categories for pref in food_preferences
                )
                # If user specified preferences but place doesn't match, skip it
                if not has_preferred_food:
                    # Check if it at least matches default preferences for this meal type
                    meal_defaults = default_preferences.get(meal_type.lower(), [])
                    has_default_match = any(
                        any(default in cat for default in meal_defaults)
                        for cat in place_food_categories
                    )
                    # Skip if doesn't match user preferences and not a default type
                    if not has_default_match:
                        continue
            
            # Calculate base score
            popularity = place.get('popularity', 5)
            score = (popularity * 2) - (distance_km * 1)
            
            # Highest priority: User's food preferences (if specified)
            if food_preferences:
                if any(pref in place_food_categories for pref in food_preferences):
                    score += 8  # Strong bonus for user preferences
            
            # Secondary priority: Default meal type preferences
            meal_defaults = default_preferences.get(meal_type.lower(), [])
            for cat in place_food_categories:
                for default_pref in meal_defaults:
                    if default_pref in cat:
                        score += 3  # Moderate bonus for meal type match
                        break
            
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
        start_location: Location,
        end_location: Location,
        days: List[DayRequest],
        preferred_categories: List[str],
        food_preferences: List[str]
    ) -> List[DaySchedule]:
        """
        Generate complete recommendation schedule with chronological timeline.
        
        Returns:
            List of DaySchedule objects for each day with timeline
        """
        schedule = []
        visited_ids: Set[str] = set()
        
        for day_request in days:
            # Parse date and times
            try:
                current_date = datetime.strptime(day_request.date, "%Y-%m-%d").date()
                day_start_time = datetime.strptime(day_request.start_time, "%H:%M").time()
                day_end_time = datetime.strptime(day_request.end_time, "%H:%M").time()
            except ValueError:
                continue  # Skip invalid date/time format
            
            day_datetime = datetime.combine(current_date, day_start_time)
            
            # Get candidate places for this day
            candidates = self.get_candidate_places(
                start_location=start_location,
                end_location=end_location,
                date=day_datetime,
                visited_ids=visited_ids,
                preferred_categories=preferred_categories
            )
            
            # Build chronological timeline for the day
            timeline = []
            current_time = datetime.combine(current_date, day_start_time)
            end_of_day = datetime.combine(current_date, day_end_time)
            
            # Validate and schedule meals for this day
            day_meals = []
            for meal_type in day_request.meals:
                meal_time = self.validate_and_adjust_meal_time(
                    meal_type, day_start_time, day_end_time, current_date
                )
                if meal_time:
                    day_meals.append((meal_time, meal_type))
            
            day_meals.sort(key=lambda x: x[0])  # Sort by time
            
            # Track which meal we should insert next
            next_meal_idx = 0
            candidate_idx = 0
            
            # Build timeline by inserting attractions and meals chronologically
            while current_time < end_of_day:
                # Check if it's time for a meal
                if next_meal_idx < len(day_meals):
                    meal_time, meal_type = day_meals[next_meal_idx]
                    
                    # If current time is close to meal time (within 30 min), insert meal
                    if current_time >= meal_time - timedelta(minutes=30):
                        # Get restaurant suggestion
                        restaurant_tuples = self.get_restaurant_suggestions(
                            location=start_location,
                            meal_type=meal_type,
                            meal_time=meal_time,
                            visited_ids=visited_ids,
                            food_preferences=food_preferences,
                            limit=1  # Get only 1 restaurant per meal
                        )
                        
                        if restaurant_tuples:
                            rest_dict, distance_km = restaurant_tuples[0]
                            visit_duration = self.parser.parse_visit_time(rest_dict.get("avg_visit_time"))
                            travel_time = calculate_travel_time(distance_km)
                            
                            # Add travel time before meal
                            current_time += timedelta(minutes=travel_time)
                            
                            # Create restaurant object
                            restaurant = Restaurant(
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
                                meal_type=meal_type
                            )
                            
                            # Add meal to timeline
                            meal_start = current_time.strftime("%H:%M")
                            current_time += timedelta(minutes=visit_duration)
                            meal_end = current_time.strftime("%H:%M")
                            
                            timeline.append(TimelineItem(
                                item_type="meal",
                                scheduled_time=meal_start,
                                end_time=meal_end,
                                place=None,
                                restaurant=restaurant
                            ))
                            
                            visited_ids.add(rest_dict.get("id"))
                        
                        next_meal_idx += 1
                        continue
                
                # Insert attraction if we have time
                if candidate_idx < len(candidates):
                    place_dict, distance_km, score = candidates[candidate_idx]
                    visit_duration = self.parser.parse_visit_time(place_dict.get("avg_visit_time"))
                    travel_time = calculate_travel_time(distance_km)
                    
                    total_time = visit_duration + travel_time
                    
                    # Check if we have enough time before next meal or end of day
                    time_until_next_meal = float('inf')
                    if next_meal_idx < len(day_meals):
                        meal_time, _ = day_meals[next_meal_idx]
                        time_until_next_meal = (meal_time - current_time).total_seconds() / 60
                    
                    time_until_end = (end_of_day - current_time).total_seconds() / 60
                    available_time = min(time_until_next_meal - 30, time_until_end)  # 30 min buffer before meal
                    
                    if total_time <= available_time:
                        # Add travel time
                        current_time += timedelta(minutes=travel_time)
                        
                        # Create place object
                        place = Place(
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
                        )
                        
                        # Add attraction to timeline
                        attraction_start = current_time.strftime("%H:%M")
                        current_time += timedelta(minutes=visit_duration)
                        attraction_end = current_time.strftime("%H:%M")
                        
                        timeline.append(TimelineItem(
                            item_type="attraction",
                            scheduled_time=attraction_start,
                            end_time=attraction_end,
                            place=place,
                            restaurant=None
                        ))
                        
                        visited_ids.add(place_dict.get("id"))
                        candidate_idx += 1
                    else:
                        # Not enough time for this attraction, skip to next meal or end of day
                        if next_meal_idx < len(day_meals):
                            current_time = day_meals[next_meal_idx][0]
                        else:
                            break
                else:
                    # No more candidates, skip to next meal or end
                    if next_meal_idx < len(day_meals):
                        current_time = day_meals[next_meal_idx][0]
                    else:
                        break
            
            # Count attractions and meals
            total_attractions = sum(1 for item in timeline if item.item_type == "attraction")
            total_meals = sum(1 for item in timeline if item.item_type == "meal")
            
            # Create day schedule
            day_schedule = DaySchedule(
                date=current_date.strftime("%Y-%m-%d"),
                timeline=timeline,
                total_attractions=total_attractions,
                total_meals=total_meals
            )
            
            schedule.append(day_schedule)
        
        return schedule
