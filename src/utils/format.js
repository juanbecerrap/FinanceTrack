// Formato de moneda (COP) y fechas. Las fechas se guardan como "AAAA-MM-DD".

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export const CURRENCY_CODE = 'COP';

export function formatCOP(value) {
  const number = Number(value);
  return copFormatter.format(Number.isFinite(number) ? number : 0);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Convierte "AAAA-MM-DD" en un Date local (evita desfases de zona horaria).
export function parseISODate(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function currentPeriod() {
  return todayISO().slice(0, 7);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseISODate(dateStr));
}

// "2026-10" -> "Octubre de 2026"
export function formatPeriodLabel(period) {
  if (!period || period === 'all') return 'Todo el historial';
  const date = parseISODate(`${period}-01`);
  return capitalize(
    new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date)
  );
}

// "2026-10" -> "Oct"
export function formatShortMonth(period) {
  const date = parseISODate(`${period}-01`);
  const label = new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(date);
  return capitalize(label.replace('.', ''));
}

// Lista de los últimos `count` meses (el más reciente primero).
export function periodOptions(count = 12, fromPeriod = currentPeriod()) {
  const [year, month] = fromPeriod.split('-').map(Number);
  const options = [];
  for (let i = 0; i < count; i += 1) {
    const date = new Date(year, month - 1 - i, 1);
    const value = toISODate(date).slice(0, 7);
    options.push({ value, label: formatPeriodLabel(value) });
  }
  return options;
}
