import { useEffect, useState } from "react";
import CustomMultiSelect from "../components/common/CustomMultiSelect";
import { useRouteCtx } from "../hooks/useRouteCtx";
import Content from "../components/common/Content";
import { snakeCaseToTitleCase } from "@/utils/stringUtils";
import { useNavigate } from "react-router-dom";

export default function ChooseCategories() {
  const { placeCategories, setPlaceCategories, cuisineTypes, setCuisineTypes } =
    useRouteCtx();
  const [availablePlaceCategories, setAvailablePlaceCategories] = useState<
    string[]
  >([]);
  const [availableCuisineTypes, setAvailableCuisineTypes] = useState<string[]>(
    []
  );
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
          data.food_categories
            .map((cat: string) => cat.split("."))
            .filter((cat) => cat.length > 1)
            .map((cat) => cat[cat.length - 1])
        );
      });
  }, []);

  return (
    <Content
      header="Choose Categories"
      sidebar={true}
      buttonNext="Plan Tour"
      buttonNextAction={() => {}}
      buttonBack="Back"
      buttonBackAction={() => navigate("/plan")}
    >
      Preferred place categories:
      <CustomMultiSelect
        options={availablePlaceCategories.map((category) => ({
          label: category[0].toUpperCase() + category.slice(1),
          value: category,
        }))}
        value={placeCategories}
        onChange={(newCategories) => setPlaceCategories(newCategories)}
      />
      <br />
      Preferred cuisine types:
      <CustomMultiSelect
        options={availableCuisineTypes.map((category) => ({
          label: snakeCaseToTitleCase(category),
          value: category,
        }))}
        value={cuisineTypes}
        onChange={(newCategories) => setCuisineTypes(newCategories)}
      />
    </Content>
  );
}
