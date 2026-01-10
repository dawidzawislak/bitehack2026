import { useState } from "react";
import Content from "../components/common/Content";
import { useRouteCtx } from "../hooks/useRouteCtx";

export default function NewDay() {
  const { setPlanDays } = useRouteCtx();

  const [formData, setFormData] = useState({
    date: "",
    startHour: "",
    endHour: "",
    meals: {
      breakfast: false,
      lunch: false,
      dinner: false,
      supper: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const addDay = () => {
    // Logic to add the new day plan
  };

  return (
    <Content
      header="New day plan"
      sidebar={true}
      button1="Add"
      button1action={addDay}
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
