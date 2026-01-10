import { useState } from "react";
import Content from "../components/common/Content";

export default function NewDay() {
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

  return (
    <Content
      header="New day plan"
      sidebar={true}
      button1="Add"
      button1action={() => {}}
      button2="Add2" // opcjonalne
      button2action={() => {}} // opcjonalne
    >
      <form className="flex flex-col gap-4">
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
