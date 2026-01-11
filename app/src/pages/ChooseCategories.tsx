import { useEffect, useState } from "react";
import CustomMultiSelect from "../components/common/CustomMultiSelect";
import { useRouteCtx } from "../hooks/useRouteCtx";
import Content from "../components/common/Content";
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
    setBackgroundType,
  } = useRouteCtx();

  const [availablePlaceCategories, setAvailablePlaceCategories] = useState<
    string[]
  >([]);
  const [availableCuisineTypes, setAvailableCuisineTypes] = useState<string[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [isPredicting, setIsPredicting] = useState(false);
  const navigate = useNavigate();
  const HOST_IP = import.meta.env.VITE_LAN_HOST_IP as string;

  useEffect(() => {
    setBackgroundType("categories");
    fetch(`https://jkt0vj59-8000.euw.devtunnels.ms/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out unwanted categories
        const filteredCategories = data.categories.filter((cat: string) => {
          return !cat.startsWith("wheelchair") && 
                 !cat.startsWith("no_fee") && 
                 !cat.startsWith("no_access") && 
                 !cat.startsWith("fee") && 
                 !cat.startsWith("access") && 
                 !cat.startsWith("access_limited");
        });
        setAvailablePlaceCategories(filteredCategories);
      });

    fetch(`https://jkt0vj59-8000.euw.devtunnels.ms/api/food-categories`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableCuisineTypes(data.food_categories);
      });
  }, []);

  // Helper function to format category labels
  const formatCategoryLabel = (category: string): string => {
    // Take the last part of the category path and capitalize it
    const parts = category.split(".");
    const lastPart = parts[parts.length - 1];
    return lastPart
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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

  const handleSuggestPreferences = async () => {
    if (!userInput.trim()) {
      setError("Please describe your perfect tour first.");
      return;
    }

    try {
      setIsPredicting(true);
      setError(null);

      const response = await fetch(`http://${HOST_IP}:8000/api/predict-preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI predictions");
      }

      const data = await response.json();

      // Update the selected categories with AI predictions
      setPlaceCategories(data.categories || []);
      setCuisineTypes(data.food_categories || []);
    } catch (err) {
      console.error("Error getting AI predictions:", err);
      setError("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsPredicting(false);
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
        className="rounded-tr-3xl"
      >
        {/* AI Input Section */}
        <div className="mb-6">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe your perfect tour"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
            disabled={isPredicting}
          />
          <button
            onClick={handleSuggestPreferences}
            disabled={isPredicting || !userInput.trim()}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPredicting ? "Analyzing..." : "Suggest Preferences"}
          </button>
        </div>

        <div className="border-t border-gray-300 pt-6 mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Or manually select your preferences:
          </p>
        </div>

        Preferred place categories:
        <CustomMultiSelect
          options={availablePlaceCategories.map((category) => {
            const formattedLabel = formatCategoryLabel(category);
            return {
              label: (InterestsDict[formattedLabel] ?? "") + " " + formattedLabel,
              value: category,
            };
          })}
          value={placeCategories}
          onChange={(newCategories) => setPlaceCategories(newCategories)}
        />
        <br />
        Preferred cuisine types:
        <CustomMultiSelect
          options={availableCuisineTypes.map((category) => {
            const formattedLabel = formatCategoryLabel(category);
            return {
              label: (FoodDict[formattedLabel] ?? "") + " " + formattedLabel,
              value: category,
            };
          })}
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
          <h2 className="text-2xl font-bold mb-2">
            Creating Your Perfect Trip
          </h2>
          <p className="text-gray-600 text-center">
            Our AI is analyzing thousands of attractions and restaurants to
            create the perfect itinerary for you...
          </p>
        </div>
      </Modal>
    </>
  );
}
