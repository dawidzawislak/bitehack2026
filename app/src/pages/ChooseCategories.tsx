import { useEffect, useState } from "react";
import CustomMultiSelect from "../components/common/CustomMultiSelect";
import { useRouteCtx } from "../hooks/useRouteCtx";
import Content from "../components/common/Content";
import { snakeCaseToTitleCase } from "../utils/stringUtils";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/api";
import { Modal } from "../components/common";
import { buildRecommendRequest } from "../utils/requestBuilder";
import { InterestsDict, FoodDict } from "../utils/InterestPageDict";

export default function ChooseCategories() {
  const { 
    placeCategories, 
    setPlaceCategories, 
    cuisineTypes, 
    setCuisineTypes,
    homeLocation,
    planDays,
    setSchedule,
  } = useRouteCtx();
  const [availablePlaceCategories, setAvailablePlaceCategories] = useState<
    string[]
  >([]);
  const [availableCuisineTypes, setAvailableCuisineTypes] = useState<string[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setAvailablePlaceCategories(data.categories);
      });

    fetch("http://localhost:8000/api/food-categories")
      .then((res) => res.json())
      .then((data) => {
        setAvailableCuisineTypes(
          Array.from(
            new Set(
              data.food_categories
                .map((cat: string) => cat.split("."))
                .filter((cat : string[]) => cat.length > 1)
                .map((cat : string[]) => cat[cat.length - 1])
            )
          )
        );
      });
  }, []);

  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Build the request using utility function
      const request = buildRecommendRequest(
        homeLocation,
        planDays,
        placeCategories,
        cuisineTypes
      );

      // Call the API
      const response = await API.recommend.create(request);
      
      // Update the schedule in context
      setSchedule(response.schedule);
      
      // Navigate to schedule page
      navigate("/schedule");
    } catch (err) {
      console.error("Error generating schedule:", err);
      setError("Failed to generate schedule. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Content
        header="Choose Categories"
        sidebar={true}
        buttonNext="Plan Tour"
        buttonNextAction={handleGenerateSchedule}
        buttonBack="Back"
        buttonBackAction={() => navigate("/plan")}
      >
        Preferred place categories:
        <CustomMultiSelect
          options={availablePlaceCategories.map((category) => ({
            label: (InterestsDict[category[0].toUpperCase() + category.slice(1)] ?? "") + " " + category[0].toUpperCase() + category.slice(1),
            value: category,
          }))}
          value={placeCategories}
          onChange={(newCategories) => setPlaceCategories(newCategories)}
        />
        <br />
        Preferred cuisine types:
        <CustomMultiSelect
          options={availableCuisineTypes.map((category) => ({
            label: (FoodDict[snakeCaseToTitleCase(category)] ?? "") + " " + snakeCaseToTitleCase(category),
            value: category,
          }))}
          value={cuisineTypes}
          onChange={(newCategories) => setCuisineTypes(newCategories)}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Content>
      
      {/* Loading Modal */}
      <Modal isOpen={isGenerating} onClose={() => {}}>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Perfect Trip</h2>
          <p className="text-gray-600 text-center">
            Our AI is analyzing thousands of attractions and restaurants to create
            the perfect itinerary for you...
          </p>
        </div>
      </Modal>
    </>
  );
}
