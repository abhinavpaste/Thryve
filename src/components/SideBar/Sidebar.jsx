import "./Sidebar.css";

function Item({ label, active, onClick }) {
  return (
    <div
      className={`sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="dot" />
      <span className="label">{label}</span>
    </div>
  );
}

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="sidebar">

      <div className="sidebar-section">
        <div className="section-title">MAIN</div>

        <Item
          label="Map"
          active={activeTab === "map"}
          onClick={() => setActiveTab("map")}
        />

        <Item
            label="Issues"
            active={activeTab === "issues"}
            onClick={() => setActiveTab("issues")}
        />

        <Item
          label="Events"
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        />

        <Item
          label="Scoreboard"
          active={activeTab === "scoreboard"}
          onClick={() => setActiveTab("scoreboard")}
        />
      </div>

    </div>
  );
}