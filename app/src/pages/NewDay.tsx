import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Content from "../components/common/Content";
import { useRouteCtx } from "../hooks/useRouteCtx";
import type { PlanDay } from "../types/models";

export default function NewDay() {
  const { setPlanDays, planDays } = useRouteCtx();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Compute initial form data based on id parameter
  const initialFormData = useMemo(() => {
    if (id && id !== "new") {
      const dayIndex = parseInt(id);
      if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex < planDays.length) {
        return planDays[dayIndex];
      }
    }
    return {
      date: "",
      startHour: "",
      endHour: "",
      meals: {
        breakfast: false,
        lunch: false,
        dinner: false,
        supper: false,
      },
    };
  }, [id, planDays]);

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const saveDay = () => {
    if (id === "new" || !id) {
      // Add new day
      setPlanDays([...planDays, formData as PlanDay]);
    } else {
      // Edit existing day
      const dayIndex = parseInt(id);
      if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex < planDays.length) {
        const updatedPlanDays = [...planDays];
        updatedPlanDays[dayIndex] = formData as PlanDay;
        setPlanDays(updatedPlanDays);
      }
    }
    navigate("/plan");
  };

  const isEditing = id && id !== "new";

  return (
    <Content
      header={isEditing ? "Edit day plan" : "New day plan"}
      sidebar={true}
      buttonNext={isEditing ? "Save" : "Add"}
      buttonNextAction={saveDay}
      buttonBack="Back"
      buttonBackAction={() => navigate("/plan")}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-xl" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block mb-1 text-xl" htmlFor="startHour">
            Start Time
          </label>
          <input
            type="time"
            id="startHour"
            value={formData.startHour}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                startHour: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <label className="block mb-1 text-xl" htmlFor="endHour">
            End Time
          </label>
          <input
            type="time"
            id="endHour"
            value={formData.endHour}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endHour: e.target.value }))
            }
          />
        </div>
        <div>
          <span className="block mb-1 text-xl">Meals</span>
          {["breakfast", "lunch", "dinner", "supper"].map((meal) => (
            <label key={meal} className="block text-lg">
              <input
                type="checkbox"
                checked={formData.meals[meal as keyof typeof formData.meals]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meals: {
                      ...prev.meals,
                      [meal]: e.target.checked,
                    },
                  }))
                }
              />
              <span className="ml-2">
                {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </form>
    </Content>
  );
}
