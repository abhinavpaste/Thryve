import "./RightPanel.css";
import IssueCard from "./IssueCard";

export default function RightPanel({ selectedZone, issues }) {
  const zoneIssues = issues.filter(
    (i) => i.zone_id === selectedZone
  );

  return (
    <div className="right-panel">
      <h2 className="panel-title">Active Issues</h2>

      {selectedZone ? (
        <>
          <div className="zone-title">Zone {selectedZone}</div>

          {zoneIssues.length === 0 ? (
            <p className="empty-text">No issues in this zone</p>
          ) : (
            zoneIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </>
      ) : (
        <p className="empty-text">Click a zone or issue</p>
      )}
    </div>
  );
}