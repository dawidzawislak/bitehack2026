import { useNavigate } from "react-router-dom";
import Content from "../components/common/Content";
import PlanDayCard from "../components/PlanDayCard";
import { useRouteCtx } from "../hooks/useRouteCtx";

export default function Plan() {
  const { planDays } = useRouteCtx();
  const navigate = useNavigate();

  return (
    <Content
      header="Tour time"
      sidebar={true}
      buttonNext="Next"
      buttonNextAction={() => navigate("/categories")}
      buttonBack="Back"
      buttonBackAction={() => navigate("/home")}
    >
      <div className="flex flex-col gap-4">
        {planDays.map((plan, index) => (
          <PlanDayCard
            key={index}
            i={index + 1}
            plan={plan}
            onClick={() => navigate(`/new-day/${index}`)}
          />
        ))}
        <button
          className="w-full border border-orange-200 rounded-xl overflow-hidden flex relative text-7xl flex justify-center shadow-md hover:bg-orange-50 hover:shadow-lg"
          onClick={() => navigate("/new-day/new")}
        >
          +
        </button>
      </div>
    </Content>
  );
}
