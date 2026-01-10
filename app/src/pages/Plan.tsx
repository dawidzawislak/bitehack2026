import { Heading, Section } from "../components/common";
import PlanDayCard from "../components/PlanDayCard";

export default function Plan() {
  return (
    <Section>
      <Heading level={1}>Tour Time</Heading>
      <hr className="my-4" />
      <div className="flex flex-col gap-4">
        <PlanDayCard
          i={1}
          plan={{
            date: "2024-06-01",
            startHour: "09:00",
            endHour: "17:00",
            meals: {
              breakfast: true,
              lunch: false,
              dinner: false,
              supper: true,
            },
          }}
        />
        <PlanDayCard
          i={2}
          plan={{
            date: "2024-06-02",
            startHour: "10:00",
            endHour: "16:00",
            meals: {
              breakfast: false,
              lunch: true,
              dinner: true,
              supper: false,
            },
          }}
        />
        <button className="border border-orange-200 rounded-xl overflow-hidden flex relative text-7xl flex justify-center shadow-md hover:bg-orange-50 hover:shadow-lg">
          +
        </button>
      </div>
    </Section>
  );
}
