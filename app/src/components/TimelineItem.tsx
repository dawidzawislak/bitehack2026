import type { TimelineItem as TimelineItemType } from "../types/models";

interface TimelineItemProps {
  item: TimelineItemType;
  isFirst: boolean;
  isLast: boolean;
}

export default function TimelineItem({ item, isFirst, isLast }: TimelineItemProps) {
  const isMeal = item.item_type === "meal";
  const data = isMeal ? item.restaurant : item.place;

  if (!data) return null;

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM format
  };

  const getMealLabel = () => {
    if (!isMeal || !item.restaurant) return "";
    const mealType = item.restaurant.meal_type;
    const mealLabels: Record<string, string> = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      supper: "Supper",
    };
    return mealLabels[mealType] || mealType;
  };

  return (
    <div className="relative flex items-start">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center mr-4">
        {/* Top line */}
        <div className="w-0.5 h-6 bg-gray-300 -mt-6"></div>
        
        {/* Dot */}
        <div className="w-3 h-3 rounded-full bg-gray-600 border-2 border-white z-10"></div>
        
        {/* Bottom line */}
        {!isLast && <div className="w-0.5 flex-1 bg-gray-300 mt-1"></div>}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        {/* Travel info before this location */}
        {!isFirst && (
          <div className="mb-2 text-xs text-gray-500">
            <div>{data.distance_km.toFixed(2)} km • {data.travel_time_min} min</div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{formatTime(item.scheduled_time)}</span>
            <span className="text-xs text-gray-600">{data.visit_duration_min} min</span>
          </div>
          
          <div className="font-semibold text-base mb-1">{data.name}</div>
          
          {isMeal && item.restaurant && (
            <div className="text-sm text-gray-700 font-medium">{getMealLabel()}</div>
          )}
          
          {!isMeal && item.place && (
            <div className="text-xs text-gray-600 mt-1">
              {item.place.category.join(" • ")}
            </div>
          )}
        </div>

        {/* End time indicator */}
        <div className="mt-1 text-xs text-gray-500">
          End: {formatTime(item.end_time)}
        </div>
      </div>
    </div>
  );
}
