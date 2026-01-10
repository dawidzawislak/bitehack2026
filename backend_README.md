# Recommendation System - Setup Instructions

## Quick Start

### 1. Build and Start Services

```bash
docker-compose up --build
```

This will start three services:
- **MongoDB** (port 27017): Database for places
- **Recommender** (port 8001): Recommendation engine API
- **API** (port 8000): Main backend API (proxy)

### 2. Initialize Database

After services are running, initialize MongoDB with places data:

```bash
docker exec -it recommender python init_db.py
```

This will:
- Load all places from `krakow_places_enriched.json`
- Create geospatial and category indexes
- Display statistics

### 3. Test the API

Health check:
```bash
curl http://localhost:8000/
```

Get categories:
```bash
curl http://localhost:8000/api/categories
```

Get statistics:
```bash
curl http://localhost:8000/api/stats
```

Example recommendation request:
```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "start_datetime": "2026-01-15T09:00:00",
    "end_datetime": "2026-01-16T21:00:00",
    "start_location": {"lat": 50.0647, "lng": 19.9450},
    "end_location": {"lat": 50.0647, "lng": 19.9450},
    "preferred_categories": ["history", "architecture"],
    "meals": [
      {"type": "lunch", "preferred_time": "13:00"},
      {"type": "dinner", "preferred_time": "19:00"}
    ]
  }'
```

## Services

### Recommender Service (port 8001)

Direct access to recommendation engine:

- `GET /` - Health check
- `GET /health` - Health with database status
- `POST /api/recommend` - Generate recommendations
- `GET /api/categories` - List available categories
- `GET /api/stats` - Database statistics

### Main API (port 8000)

Main backend that proxies to recommender:

- `GET /` - Health check
- `POST /api/recommend` - Get recommendations (proxied)
- `GET /api/categories` - Get categories (proxied)
- `GET /api/stats` - Get stats (proxied)

## Request Format

### POST /api/recommend

```json
{
  "start_datetime": "2026-01-15T09:00:00",
  "end_datetime": "2026-01-17T21:00:00",
  "start_location": {
    "lat": 50.0647,
    "lng": 19.9450
  },
  "end_location": {
    "lat": 50.0647,
    "lng": 19.9450
  },
  "preferred_categories": ["history", "architecture", "art"],
  "meals": [
    {
      "type": "breakfast",
      "preferred_time": "08:00"
    },
    {
      "type": "lunch",
      "preferred_time": "13:00"
    },
    {
      "type": "dinner",
      "preferred_time": "19:00"
    }
  ]
}
```

### Response Format

```json
{
  "schedule": [
    {
      "date": "2026-01-15",
      "timeline": [
        {
          "item_type": "attraction",
          "scheduled_time": "09:00",
          "end_time": "10:45",
          "place": {
            "id": "place_id",
            "name": "Wawel Castle",
            "location": {"lat": 50.0543, "lng": 19.9356},
            "category": ["history", "architecture"],
            "popularity": 10,
            "visit_duration_min": 105,
            "distance_km": 1.2,
            "opening_hours": "Mo-Su 09:00-17:00",
            "travel_time_min": 18,
            "formatted_address": "Wawel 5, 31-001 Kraków",
            "geoapify_categories": ["tourism.attraction"],
            "price_level": 2
          },
          "restaurant": null
        },
        {
          "item_type": "meal",
          "scheduled_time": "13:00",
          "end_time": "14:15",
          "place": null,
          "restaurant": {
            "id": "restaurant_id",
            "name": "Restaurant Name",
            "location": {"lat": 50.0647, "lng": 19.9450},
            "category": ["food"],
            "geoapify_categories": ["catering.restaurant.regional"],
            "popularity": 7,
            "visit_duration_min": 75,
            "distance_km": 0.5,
            "opening_hours": "Mo-Su 12:00-22:00",
            "travel_time_min": 8,
            "formatted_address": "Main Square 10, Kraków",
            "price_level": 2,
            "meal_type": "lunch"
          }
        },
        {
          "item_type": "attraction",
          "scheduled_time": "15:00",
          "end_time": "16:30",
          "place": {
            "id": "place_id_2",
            "name": "St. Mary's Basilica",
            "location": {"lat": 50.0619, "lng": 19.9394},
            "category": ["religion", "architecture"],
            "popularity": 8,
            "visit_duration_min": 45,
            "distance_km": 0.8,
            "opening_hours": "Mo-Sa 11:30-18:00",
            "travel_time_min": 12,
            "formatted_address": "Main Square, Kraków",
            "geoapify_categories": ["religion.place_of_worship"],
            "price_level": 0
          },
          "restaurant": null
        }
      ],
      "total_attractions": 2,
      "total_meals": 1
    }
  ],
  "total_days": 3,
  "total_attractions": 15
}
```

## Algorithm Details

### Scoring Formula

Places are scored based on:

**Preferred Categories:**
```
score = 10 + (popularity * 2) - (distance_km * 1)
```

**Other Categories (Fallback):**
```
score = (popularity * 3) - (distance_km * 1)
```

### Time Allocation

- **Daily Hours:** 9:00 - 21:00 (12 hours)
- **Walking Speed:** 15 minutes per kilometer
- **Visit Time:** Parsed from `avg_visit_time` field (e.g., "60-90 min" → 75 min)
- **Meal Time:** ~90 minutes per meal

### Features

- ✅ Chronological timeline with interleaved attractions and meals
- ✅ Scheduled times for each activity (HH:MM format)
- ✅ Geospatial filtering by distance
- ✅ Opening hours validation
- ✅ No duplicate places across days
- ✅ Category preference matching
- ✅ Popularity + distance balancing
- ✅ Smart meal placement at preferred times
- ✅ Dynamic travel time calculation
- ✅ Time-aware scheduling (attractions fit before meals)

## Development

### Run Recommender Service Locally

```bash
cd recommender
pip install -r requirements.txt
export MONGODB_URL=mongodb://localhost:27017
export MONGODB_DB=places_db
export PYTHONPATH=.
python src/init_db.py  # First time only
uvicorn src.main:app --reload --port 8001
```

### Run Main API Locally

```bash
cd api
pip install -r ../requirements.txt
export RECOMMENDER_URL=http://localhost:8001
uvicorn api.main:app --reload --port 8000
```

## Troubleshooting

**MongoDB not initialized:**
```bash
docker exec -it recommender python src/init_db.py
```

**View logs:**
```bash
docker logs mongodb
docker logs recommender
docker logs fastapi_app
```

**Rebuild services:**
```bash
docker-compose down
docker-compose up --build
```
