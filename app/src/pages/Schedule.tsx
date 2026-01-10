import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import TimelineItem from "../components/TimelineItem";
import { Heading, Section, Button } from "../components/common";
import { useRouteCtx } from "../hooks/useRouteCtx";
import type { DaySchedule } from "../types/models";

export default function Schedule() {
  const { schedule, setSchedule } = useRouteCtx();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Only fetch if schedule is empty
        if (schedule.length === 0) {
          const response = await API.schedule.get();
          setSchedule(response.data.schedule as DaySchedule[]);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [schedule.length, setSchedule]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-xl text-gray-600">No scheduled days</div>
      </div>
    );
  }

  const currentDaySchedule = schedule[selectedDay];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Helper to format location for display
  const formatLocation = (location: { lat: number; lng: number }) => {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <Heading level={1} className="mb-4">
          Local route
        </Heading>

        {/* Day selector */}
        <div className="flex items-center gap-2">
          {schedule.map((day, index) => (
            <Button
              key={day.date}
              onClick={() => setSelectedDay(index)}
              variant={selectedDay === index ? "primary" : "secondary"}            >
              Day {index + 1} • {formatDate(day.date)}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Timeline section */}
        <Section className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6">
            <Heading level={2} className="mb-6 text-center tracking-wider">
              Plan for {formatDate(currentDaySchedule.date)}
            </Heading>

            {/* Timeline */}
            <div className="relative">
              {/* Start point */}
              <div className="relative flex items-start mb-8">
                <div className="relative flex flex-col items-center mr-4">
                  <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white z-10"></div>
                  <div className="w-0.5 flex-1 bg-gray-300 mt-1"></div>
                </div>
                <div className="flex-1">
                  <div className="bg-green-100 rounded-lg p-4 shadow-sm border-2 border-green-500">
                    <div className="font-bold text-lg mb-1">🏠 Start</div>
                    <div className="text-sm text-gray-600">
                      {formatLocation(currentDaySchedule.start_location)}
                    </div>
                    {currentDaySchedule.timeline.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {currentDaySchedule.timeline[0].scheduled_time} - Start of route
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {currentDaySchedule.timeline.map((item, index) => (
                <TimelineItem
                  key={`${item.scheduled_time}-${index}`}
                  item={item}
                  isFirst={index === 0}
                  isLast={index === currentDaySchedule.timeline.length - 1}
                />
              ))}

              {/* End point */}
              <div className="relative flex items-start mt-4">
                <div className="relative flex flex-col items-center mr-4">
                  <div className="w-0.5 h-6 bg-gray-300 -mt-6"></div>
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white z-10"></div>
                </div>
                <div className="flex-1">
                  <div className="bg-red-100 rounded-lg p-4 shadow-sm border-2 border-red-500">
                    <div className="font-bold text-lg mb-1">🏁 Return home</div>
                    <div className="text-sm text-gray-600">
                      {formatLocation(currentDaySchedule.end_location)}
                    </div>
                    {currentDaySchedule.timeline.length > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        {currentDaySchedule.timeline[currentDaySchedule.timeline.length - 1].end_time} - End of route
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {currentDaySchedule.total_attractions}
                  </div>
                  <div className="text-sm text-gray-600">Attractions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {currentDaySchedule.total_meals}
                  </div>
                  <div className="text-sm text-gray-600">Meals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {currentDaySchedule.timeline.length}
                  </div>
                  <div className="text-sm text-gray-600">Total stops</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Map button */}
        <div className="p-6">
          <Button
            onClick={() => navigate('/map')}
            variant="primary"
            fullWidth
          >
            View route on map
          </Button>
        </div>
      </div>
    </div>
  );
}
