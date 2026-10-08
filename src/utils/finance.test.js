import { describe, it, expect } from 'vitest';
import {
  calculateBalance,
  calculateTotals,
  monthlySummary,
  expensesByCategory,
  trendByMonth,
  shiftPeriod,
  budgetProgress,
  filterTransactions,
  paginate,
  sortByDateDesc,
  spentByCategory,
} from './finance';
import { validateTransaction, validateBudget } from './validators';

const data = [
  { id: '1', type: 'income', amount: 3000000, category: 'Salario', date: '2026-10-01', description: 'Nómina' },
  { id: '2', type: 'expense', amount: 800000, category: 'Vivienda', date: '2026-10-03', description: 'Arriendo' },
  { id: '3', type: 'expense', amount: 200000, category: 'Alimentación', date: '2026-10-05', description: 'Mercado' },
  { id: '4', type: 'expense', amount: 50000, category: 'Alimentación', date: '2026-09-28', description: 'Almuerzo' },
  { id: '5', type: 'income', amount: 500000, category: 'Freelance', date: '2026-09-15', description: 'Proyecto web' },
];

describe('cálculos financieros', () => {
  it('calcula el saldo total', () => {
    expect(calculateBalance(data)).toBe(3000000 + 500000 - 800000 - 200000 - 50000);
  });

  it('devuelve 0 si no hay movimientos', () => {
    expect(calculateBalance([])).toBe(0);
    expect(calculateTotals([])).toEqual({ income: 0, expense: 0, difference: 0 });
  });

  it('resume ingresos, gastos y diferencia del mes', () => {
    expect(monthlySummary(data, '2026-10')).toEqual({
      income: 3000000,
      expense: 1000000,
      difference: 2000000,
    });
    expect(monthlySummary(data, '2026-09')).toEqual({
      income: 500000,
      expense: 50000,
      difference: 450000,
    });
  });

  it('agrupa gastos por categoría de mayor a menor', () => {
    expect(expensesByCategory(data, '2026-10')).toEqual([
      { name: 'Vivienda', value: 800000 },
      { name: 'Alimentación', value: 200000 },
    ]);
    expect(spentByCategory(data, '2026-09')).toEqual({ Alimentación: 50000 });
  });

  it('suma meses a un período, incluso cruzando de año', () => {
    expect(shiftPeriod('2026-10', -1)).toBe('2026-09');
    expect(shiftPeriod('2026-01', -1)).toBe('2025-12');
    expect(shiftPeriod('2026-12', 1)).toBe('2027-01');
  });

  it('genera la tendencia mensual en orden cronológico', () => {
    const trend = trendByMonth(data, '2026-10', 3);
    expect(trend.map((t) => t.period)).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(trend[0]).toEqual({ period: '2026-08', income: 0, expense: 0 });
    expect(trend[2].income).toBe(3000000);
    expect(trend[2].expense).toBe(1000000);
  });

  it('ordena por fecha descendente', () => {
    expect(sortByDateDesc(data).map((t) => t.id)).toEqual(['3', '2', '1', '4', '5']);
  });
});

describe('presupuestos', () => {
  it('estado normal', () => {
    const p = budgetProgress(1000000, 300000);
    expect(p.status).toBe('ok');
    expect(p.remaining).toBe(700000);
    expect(p.percent).toBe(30);
  });

  it('advertencia desde el 80 %', () => {
    expect(budgetProgress(1000000, 800000).status).toBe('warning');
  });

  it('límite alcanzado', () => {
    const p = budgetProgress(500000, 500000);
    expect(p.status).toBe('reached');
    expect(p.remaining).toBe(0);
  });

  it('límite superado', () => {
    const p = budgetProgress(500000, 650000);
    expect(p.status).toBe('exceeded');
    expect(p.remaining).toBe(-150000);
  });
});

describe('filtros y paginación', () => {
  it('busca por descripción sin distinguir mayúsculas', () => {
    expect(filterTransactions(data, { search: 'MERCADO' }).map((t) => t.id)).toEqual(['3']);
  });

  it('filtra por tipo, categoría y período', () => {
    expect(filterTransactions(data, { type: 'expense' })).toHaveLength(3);
    expect(filterTransactions(data, { category: 'Alimentación' })).toHaveLength(2);
    expect(filterTransactions(data, { period: '2026-09' })).toHaveLength(2);
    expect(
      filterTransactions(data, { type: 'expense', category: 'Alimentación', period: '2026-10' })
    ).toHaveLength(1);
  });

  it('pagina y limita la página solicitada', () => {
    const list = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }));
    const page3 = paginate(list, 3, 10);
    expect(page3.items).toHaveLength(5);
    expect(page3.totalPages).toBe(3);
    expect(paginate(list, 99, 10).page).toBe(3);
    expect(paginate([], 1, 10).totalPages).toBe(1);
  });
});

describe('validaciones', () => {
  const valid = {
    description: 'Café',
    type: 'expense',
    amount: '5000',
    category: 'Alimentación',
    date: '2026-10-08',
    paymentMethod: '',
    note: '',
  };

  it('acepta una transacción válida', () => {
    expect(validateTransaction(valid)).toEqual({});
  });

  it('rechaza importes negativos, cero, decimales y vacíos', () => {
    expect(validateTransaction({ ...valid, amount: '-5' }).amount).toBeTruthy();
    expect(validateTransaction({ ...valid, amount: '0' }).amount).toBeTruthy();
    expect(validateTransaction({ ...valid, amount: '10.5' }).amount).toBeTruthy();
    expect(validateTransaction({ ...valid, amount: '' }).amount).toBeTruthy();
  });

  it('rechaza categorías que no corresponden al tipo', () => {
    expect(validateTransaction({ ...valid, category: 'Salario' }).category).toBeTruthy();
  });

  it('rechaza fechas inexistentes', () => {
    expect(validateTransaction({ ...valid, date: '2026-02-31' }).date).toBeTruthy();
  });

  it('impide presupuestos duplicados por categoría y período', () => {
    const existing = [{ id: '2026-10_Alimentación', category: 'Alimentación', period: '2026-10' }];
    const errors = validateBudget(
      { category: 'Alimentación', limit: '400000', period: '2026-10' },
      existing
    );
    expect(errors.category).toBeTruthy();
    expect(
      validateBudget({ category: 'Transporte', limit: '400000', period: '2026-10' }, existing)
    ).toEqual({});
  });
});
