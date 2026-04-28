import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MapView from "./components/Map/MapView";
import RightPanel from "./components/RightPanel/RightPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("map");
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1 }}>
        <MapView onZoneClick={setSelectedZone} />
      </div>

      {activeTab === "issues" && (
        <RightPanel selectedZone={selectedZone} issues={[]} />
      )}

    </div>
  );
}