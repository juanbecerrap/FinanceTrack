// status: 'ok' | 'warning' | 'reached' | 'exceeded'
export default function ProgressBar({ percent, status = 'ok' }) {
  const width = Math.min(Math.max(percent, 0), 100);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <div className={`progress-fill progress-${status}`} style={{ width: `${width}%` }} />
    </div>
  );
}
