import { formatCOP } from '../utils/format';

// tone: 'neutral' | 'positive' | 'negative' | 'primary'
export default function StatCard({ label, value, icon: Icon, tone = 'neutral', hint }) {
  return (
    <article className={`card stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <span className="stat-icon">
            <Icon size={18} />
          </span>
        )}
      </div>
      <strong className="stat-value">{formatCOP(value)}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </article>
  );
}
