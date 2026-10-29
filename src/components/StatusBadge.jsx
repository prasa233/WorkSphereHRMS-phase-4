const colors = {
  Completed: "green",
  Active: "green",
  Pending: "orange",
  "In Progress": "blue",
  Approved: "green",
  Rejected: "red",
  "Under Review": "purple",
  "Not Started": "gray",
  Connected: "green",
  Disconnected: "red",
  Open: "blue",
};

export default function StatusBadge({ status = "Pending" }) {
  const color = colors[status] || "gray";

  return (
    <span className={`status-badge status-${color}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}