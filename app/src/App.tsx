import { RouteProvider } from "./context/RouteProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import NewDay from "./pages/NewDay";
import Schedule from "./pages/Schedule";
import Header from "./components/Header";
import ChooseCategories from "./pages/ChooseCategories";

export default function App() {
  return (
    <RouteProvider>
      <Router>
        <div className="h-screen flex flex-col">
          <Header />
          <main className="flex-grow overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/new-day/:id" element={<NewDay />} />
              <Route path="/categories" element={<ChooseCategories />} />
              <Route path="/schedule" element={<Schedule />} />
              {/* <Route path="/map" element={<MapComponent />} /> */}
              <Route path="/details/:id" element={<></>} />
            </Routes>
          </main>
        </div>
      </Router>
    </RouteProvider>
  );
}
