import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import NewDay from "./pages/NewDay";
import Schedule from "./pages/Schedule";
import Header from "./components/Header";
import ChooseCategories from "./pages/ChooseCategories";
import { useRouteCtx } from "./hooks/useRouteCtx";
import { useMemo } from "react";
import backgroundImgDefault from "./assets/bg-default.png";
import backgroundImgLocation from "./assets/bg-location.png";
import backgroundImgCategories from "./assets/bg-categories.png";
import backgroundImgPlan from "./assets/bg-plan.png";
import Map from "./pages/Map";

export default function App() {
  const { backgroundType } = useRouteCtx();

  const backgroundImage = useMemo(() => {
    switch (backgroundType) {
      case "default":
        return `url('${backgroundImgDefault}')`;
      case "location":
        return `url('${backgroundImgLocation}')`;
      case "categories":
        return `url('${backgroundImgCategories}')`;
      case "plan":
        return `url('${backgroundImgPlan}')`;
      default:
        return `url('${backgroundImgDefault}')`;
    }
  }, [backgroundType]);

  return (
    <Router>
      <div
        className="h-screen flex flex-col main-container transition-all transition-duration-1000"
        style={{ backgroundImage }}
      >
        <Header />
        <main className="flex-grow overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/new-day/:id" element={<NewDay />} />
            <Route path="/categories" element={<ChooseCategories />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/map" element={<Map />} />
            <Route path="/details/:id" element={<></>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
