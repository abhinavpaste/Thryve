import "./RightPanel.css";
import IssueCard from "./IssueCard";

export default function RightPanel({ selectedZone, issues }) {
  return (
    <div className="right-panel">
      <h2 className="panel-title">Active Issues</h2>

      {/* DEFAULT VIEW (no zone selected yet) */}
      {!selectedZone && (
        <p className="empty-text">
          Showing issues in your area (default)
        </p>
      )}

      {/* WHEN ZONE IS SELECTED */}
      {selectedZone && (
        <div className="zone-title">
          Zone {selectedZone}
        </div>
      )}
    </div>
  );
}