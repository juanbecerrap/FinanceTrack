// Cálculos financieros puros (sin dependencias de React ni Firebase).
// Cada transacción tiene al menos: { type: 'income' | 'expense', amount, category, date: 'AAAA-MM-DD' }.

function sum(list) {
  return list.reduce((total, item) => total + Number(item.amount || 0), 0);
}

export function getPeriod(dateStr) {
  return String(dateStr).slice(0, 7);
}

// Suma `delta` meses a un período "AAAA-MM".
export function shiftPeriod(period, delta) {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function sortByDateDesc(transactions) {
  return [...transactions].sort((a, b) => {
    const byDate = String(b.date).localeCompare(String(a.date));
    if (byDate !== 0) return byDate;
    return (b.createdAtMs || 0) - (a.createdAtMs || 0);
  });
}

export function calculateTotals(transactions) {
  const income = sum(transactions.filter((t) => t.type === 'income'));
  const expense = sum(transactions.filter((t) => t.type === 'expense'));
  return { income, expense, difference: income - expense };
}

// Saldo acumulado de todos los movimientos.
export function calculateBalance(transactions) {
  return calculateTotals(transactions).difference;
}

export function filterByPeriod(transactions, period) {
  if (!period || period === 'all') return transactions;
  return transactions.filter((t) => getPeriod(t.date) === period);
}

// Ingresos, gastos y diferencia de un mes.
export function monthlySummary(transactions, period) {
  return calculateTotals(filterByPeriod(transactions, period));
}

// Gastos del período agrupados por categoría, de mayor a menor.
export function expensesByCategory(transactions, period) {
  const totals = {};
  filterByPeriod(transactions, period)
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount || 0);
    });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Ingresos y gastos por mes para los últimos `months` meses hasta `endPeriod`.
export function trendByMonth(transactions, endPeriod, months = 6) {
  const result = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const period = shiftPeriod(endPeriod, -i);
    const { income, expense } = monthlySummary(transactions, period);
    result.push({ period, income, expense });
  }
  return result;
}

// Gasto acumulado por categoría en un período: { Alimentación: 120000, ... }
export function spentByCategory(transactions, period) {
  const map = {};
  expensesByCategory(transactions, period).forEach(({ name, value }) => {
    map[name] = value;
  });
  return map;
}

// Consumo de un presupuesto.
// status: 'ok' | 'warning' (>= 80 %) | 'reached' (== 100 %) | 'exceeded' (> 100 %)
export function budgetProgress(limit, spent) {
  const safeLimit = Number(limit) || 0;
  const safeSpent = Number(spent) || 0;
  const percent = safeLimit > 0 ? (safeSpent / safeLimit) * 100 : 0;
  let status = 'ok';
  if (safeSpent > safeLimit) status = 'exceeded';
  else if (safeLimit > 0 && safeSpent === safeLimit) status = 'reached';
  else if (percent >= 80) status = 'warning';
  return {
    spent: safeSpent,
    remaining: safeLimit - safeSpent,
    percent,
    status,
  };
}

// Filtros de la pantalla de transacciones. Valores "all" desactivan el filtro.
export function filterTransactions(
  transactions,
  { search = '', type = 'all', category = 'all', period = 'all' } = {}
) {
  const query = search.trim().toLowerCase();
  return transactions.filter((t) => {
    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (period !== 'all' && getPeriod(t.date) !== period) return false;
    if (query && !String(t.description).toLowerCase().includes(query)) return false;
    return true;
  });
}

export function paginate(list, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: list.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: list.length,
  };
}
