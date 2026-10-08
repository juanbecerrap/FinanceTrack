import { isValidCategory } from './categories';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_AMOUNT = 100000000000;

function isRealDate(value) {
  if (!DATE_REGEX.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function validateAmount(raw, label) {
  const text = String(raw ?? '').trim();
  if (!text) return `${label} es obligatorio.`;
  const number = Number(text);
  if (!Number.isFinite(number)) return `${label} debe ser un número válido.`;
  if (number <= 0) return `${label} debe ser mayor que cero.`;
  if (!Number.isInteger(number)) return `${label} debe ser un valor entero en pesos.`;
  if (number > MAX_AMOUNT) return `${label} es demasiado alto.`;
  return '';
}

// ---------- Autenticación ----------
export function validateAuth({ email, password, confirmPassword }, mode) {
  const errors = {};
  if (!email.trim()) errors.email = 'Ingresa tu correo electrónico.';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El correo electrónico no es válido.';

  if (mode !== 'reset') {
    if (!password) errors.password = 'Ingresa tu contraseña.';
    else if (mode === 'register' && password.length < 6)
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
  }

  if (mode === 'register') {
    if (!confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.';
    else if (confirmPassword !== password) errors.confirmPassword = 'Las contraseñas no coinciden.';
  }
  return errors;
}

// ---------- Transacciones ----------
export function validateTransaction(values) {
  const errors = {};
  const description = values.description.trim();
  if (!description) errors.description = 'La descripción es obligatoria.';
  else if (description.length > 100) errors.description = 'Máximo 100 caracteres.';

  if (values.type !== 'income' && values.type !== 'expense')
    errors.type = 'Selecciona el tipo de movimiento.';

  const amountError = validateAmount(values.amount, 'El importe');
  if (amountError) errors.amount = amountError;

  if (!values.category) errors.category = 'Selecciona una categoría.';
  else if (!isValidCategory(values.type, values.category))
    errors.category = 'La categoría no corresponde al tipo de movimiento.';

  if (!values.date) errors.date = 'La fecha es obligatoria.';
  else if (!isRealDate(values.date)) errors.date = 'La fecha no es válida.';

  if (values.paymentMethod && values.paymentMethod.length > 50)
    errors.paymentMethod = 'Máximo 50 caracteres.';
  if (values.note && values.note.length > 300) errors.note = 'Máximo 300 caracteres.';
  return errors;
}

// Convierte los valores del formulario en el documento que se guarda.
export function toTransactionData(values) {
  const data = {
    description: values.description.trim(),
    type: values.type,
    amount: Number(values.amount),
    category: values.category,
    date: values.date,
  };
  if (values.paymentMethod) data.paymentMethod = values.paymentMethod.trim();
  if (values.note && values.note.trim()) data.note = values.note.trim();
  return data;
}

// ---------- Presupuestos ----------
export function validateBudget({ category, limit, period }, existingBudgets = [], editingId = null) {
  const errors = {};
  if (!category) errors.category = 'Selecciona una categoría de gasto.';
  else if (!isValidCategory('expense', category))
    errors.category = 'La categoría no es válida para un presupuesto.';

  const limitError = validateAmount(limit, 'El límite');
  if (limitError) errors.limit = limitError;

  if (!PERIOD_REGEX.test(period || '')) errors.period = 'El período no es válido.';

  if (!errors.category && !errors.period) {
    const duplicate = existingBudgets.some(
      (b) => b.category === category && b.period === period && b.id !== editingId
    );
    if (duplicate) errors.category = 'Ya existe un presupuesto para esa categoría en este mes.';
  }
  return errors;
}

export function budgetDocId(period, category) {
  return `${period}_${category}`;
}
