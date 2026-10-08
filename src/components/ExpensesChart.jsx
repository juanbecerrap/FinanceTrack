import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../utils/categories';
import { formatCOP } from '../utils/format';

// Gráfico de dona con la lista de categorías al lado (leyenda con importes).
export default function ExpensesChart({ data }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="expenses-chart">
      <div className="donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCOP(value)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <span>Total</span>
          <strong>{formatCOP(total)}</strong>
        </div>
      </div>

      <ul className="legend-list">
        {data.map((entry, index) => (
          <li key={entry.name}>
            <span
              className="legend-dot"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="legend-name">{entry.name}</span>
            <span className="legend-value">
              {formatCOP(entry.value)}
              <small>{total > 0 ? Math.round((entry.value / total) * 100) : 0}%</small>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
