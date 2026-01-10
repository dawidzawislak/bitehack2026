import { useState } from "react";
import { Button, Heading, Section } from "../components/common";
import Sidebar from "../components/Sidebar";

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
    <div className="flex h-full">
      <Section className="flex-grow">
        <Heading level={1}>New day plan</Heading>
        <hr className="my-4" />
        <div className="flex flex-col gap-4">
          <form className="flex-grow">
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
                    checked={
                      formData.meals[meal as keyof typeof formData.meals]
                    }
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
          <Button fullWidth>Add</Button>
        </div>
      </Section>
      <Sidebar />
    </div>
  );
}
