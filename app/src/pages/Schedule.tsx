import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TimelineItem from "../components/TimelineItem";
import { Heading, Section, Button } from "../components/common";
import { useRouteCtx } from "../hooks/useRouteCtx";
import DaySelector from "../components/DaySelector";
import Content from "../components/common/Content";

export default function Schedule() {
  const { schedule, setBackgroundType } = useRouteCtx();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    setBackgroundType("default");
  }, [setBackgroundType]);

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

  return (
    <Content
      header="Route Schedule"
      sidebar={false}
      buttonNextAction={() => navigate("/map")}
      buttonNext="View map"
      buttonBack="Change plan"
      buttonBackAction={() => navigate("/categories")}
    >
      <DaySelector
        currentDay={selectedDay}
        totalDays={schedule.length}
        date={currentDaySchedule.date}
        onPreviousDay={() => setSelectedDay(selectedDay - 1)}
        onNextDay={() => setSelectedDay(selectedDay + 1)}
      />

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
                {currentDaySchedule.timeline.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {currentDaySchedule.timeline[0].scheduled_time} - Start of
                    route
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
                {currentDaySchedule.timeline.length > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {
                      currentDaySchedule.timeline[
                        currentDaySchedule.timeline.length - 1
                      ].end_time
                    }{" "}
                    - End of route
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
    </Content>
  );
}
