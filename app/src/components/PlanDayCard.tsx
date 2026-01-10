import type { PlanDay } from "../types/models";
import { Heading } from "./common";
import { TrashIcon } from "./icons";

interface PlanDayCardProps {
  i: number;
  plan: PlanDay;
  onClick?: () => void | Promise<void>;
}

export default function PlanDayCard({ i, plan, onClick }: PlanDayCardProps) {
  return (
    <div
      className="border border-gray-300 rounded-xl overflow-hidden flex relative shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-red-400 text-white p-4 flex items-center">
        <TrashIcon />
      </div>
      <div className="p-2">
        <Heading level={2}>Day {i}</Heading>
        <div className="text-lg">{plan.date}</div>
        <div className="text-md">
          {plan.startHour} - {plan.endHour}
        </div>
      </div>
      <div className="absolute right-4 p-2">ikonki żarcia</div>
    </div>
  );
}
