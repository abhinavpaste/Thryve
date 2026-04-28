export default function IssueCard({ issue }) {
  const timeAgo = Math.floor(
    (Date.now() - new Date(issue.createdAt)) / 60000
  );

  return (
    <div className="issue-card">
      <div className="issue-title">{issue.title}</div>

      <div className="issue-meta">
        <span>↑ {issue.upvotes}</span>
        <span>{timeAgo} mins ago</span>
      </div>

      <div className="issue-verification">
        ✔ {issue.verification?.verified_count || 0}
        &nbsp; | &nbsp;
        ✖ {issue.verification?.disputed_count || 0}
      </div>
    </div>
  );
}