export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="stat-card">
      <div>
        <p className="muted">{title}</p>
        <h2>{value ?? "—"}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>

      {Icon && (
        <div className="stat-icon">
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}