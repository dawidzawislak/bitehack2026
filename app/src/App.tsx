import { RouteProvider } from "./context/RouteProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import MapComponent from "./components/MapComponent";
import Plan from "./pages/Plan";
import NewDay from "./pages/NewDay";
import Header from "./components/Header";

export default function App() {
  return (
    <RouteProvider>
      <Router>
        <div className="h-screen flex flex-col">
          <Header />
          <main className="flex-grow overflow-hidden">
            <Routes>
              <Route path="/" element={<></>} />
              <Route path="/home" element={<></>} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/new-day/:id" element={<NewDay />} />
              <Route path="/categories" element={<></>} />
              <Route path="/schedule" element={<></>} />
              {/* <Route path="/map" element={<MapComponent />} /> */}
              <Route path="/details/:id" element={<></>} />
            </Routes>
          </main>
        </div>
      </Router>
    </RouteProvider>
  );
}
