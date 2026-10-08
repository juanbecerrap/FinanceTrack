import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCOP, formatPeriodLabel, formatShortMonth } from '../utils/format';

function compactCOP(value) {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(value / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;
  if (abs >= 1000) return `${Math.round(value / 1000)} mil`;
  return String(value);
}

const SERIES_NAMES = { income: 'Ingresos', expense: 'Gastos' };

// Ingresos vs. gastos por mes.
export default function TrendChart({ data }) {
  const chartData = data.map((item) => ({ ...item, label: formatShortMonth(item.period) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={compactCOP}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(11, 36, 71, 0.05)' }}
          formatter={(value, name) => [formatCOP(value), SERIES_NAMES[name] || name]}
          labelFormatter={(_, payload) =>
            payload && payload[0] ? formatPeriodLabel(payload[0].payload.period) : ''
          }
        />
        <Legend formatter={(value) => SERIES_NAMES[value] || value} iconType="circle" />
        <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill="#0b2447" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
