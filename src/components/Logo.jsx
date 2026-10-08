import { TrendingUp } from 'lucide-react';

export default function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? 'logo-light' : ''}`}>
      <span className="logo-mark">
        <TrendingUp size={20} strokeWidth={2.5} />
      </span>
      <span className="logo-text">
        Finance<strong>Track</strong>
      </span>
    </div>
  );
}
