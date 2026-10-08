// Categorías iniciales. Deben coincidir con las listas de firestore.rules.
export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Compras',
  'Otros',
];

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Ventas', 'Inversiones', 'Otros'];

export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta débito',
  'Tarjeta crédito',
  'Transferencia',
  'Nequi / Daviplata',
  'Otro',
];

export const TYPE_LABELS = {
  income: 'Ingreso',
  expense: 'Gasto',
};

export function getCategories(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function isValidCategory(type, category) {
  return getCategories(type).includes(category);
}

// Colores para los gráficos (azules y verdes coherentes con la marca).
export const CHART_COLORS = [
  '#0b2447',
  '#16a34a',
  '#2f6fb3',
  '#4ade80',
  '#19376d',
  '#0f766e',
  '#7aa7d9',
  '#86efac',
  '#94a3b8',
];
