import { RouteProvider } from "./context/RouteProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapComponent from "./components/MapComponent";

export default function App() {
  return (
    <RouteProvider>
      <Router>
        {/* <div className="h-screen bg-purple-50 relative overflow-auto">
          <Header />
          <Sidebar /> */}
        <main>
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/home" element={<></>} />
            <Route path="/plan" element={<></>} />
            <Route path="/categories" element={<></>} />
            <Route path="/schedule" element={<></>} />
            <Route path="/map" element={<MapComponent />} />
            <Route path="/details/:id" element={<></>} />
          </Routes>
        </main>
        {/* </div> */}
      </Router>
    </RouteProvider>
  );
}
