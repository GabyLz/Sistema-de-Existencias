export function StatCard({ title, value, hint, tone = 'primary' }) {
  return (
    <div className={`card border-0 shadow-sm kpi-card tone-${tone}`}>
      <div className="card-body">
        <p className="text-uppercase small mb-1 fw-semibold text-secondary">{title}</p>
        <h3 className="mb-1">{value}</h3>
        <p className="text-secondary small mb-0">{hint}</p>
      </div>
    </div>
  );
}
