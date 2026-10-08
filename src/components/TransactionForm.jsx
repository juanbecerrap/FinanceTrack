import { useState } from 'react';
import Field from './Field';
import { Spinner } from './Spinner';
import { PAYMENT_METHODS, getCategories } from '../utils/categories';
import { todayISO } from '../utils/format';
import { toTransactionData, validateTransaction } from '../utils/validators';

function buildInitialValues(transaction) {
  if (transaction) {
    return {
      description: transaction.description || '',
      type: transaction.type,
      amount: String(transaction.amount ?? ''),
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod || '',
      note: transaction.note || '',
    };
  }
  return {
    description: '',
    type: 'expense',
    amount: '',
    category: '',
    date: todayISO(),
    paymentMethod: '',
    note: '',
  };
}

// Formulario de creación y edición. `onSubmit` recibe los datos ya validados.
export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => buildInitialValues(transaction));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categories = getCategories(values.type);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const changeType = (type) => {
    setValues((current) => ({ ...current, type, category: '' }));
    setErrors((current) => ({ ...current, type: undefined, category: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateTransaction(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(toTransactionData(values));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="segmented" role="group" aria-label="Tipo de movimiento">
        <button
          type="button"
          className={values.type === 'expense' ? 'active expense' : ''}
          onClick={() => changeType('expense')}
        >
          Gasto
        </button>
        <button
          type="button"
          className={values.type === 'income' ? 'active income' : ''}
          onClick={() => changeType('income')}
        >
          Ingreso
        </button>
      </div>

      <Field label="Descripción" htmlFor="tx-description" error={errors.description}>
        <input
          id="tx-description"
          type="text"
          maxLength={100}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Ej: Mercado de la semana"
        />
      </Field>

      <div className="form-row">
        <Field label="Importe (COP)" htmlFor="tx-amount" error={errors.amount}>
          <input
            id="tx-amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.amount}
            onChange={(e) => setField('amount', e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Fecha" htmlFor="tx-date" error={errors.date}>
          <input
            id="tx-date"
            type="date"
            value={values.date}
            onChange={(e) => setField('date', e.target.value)}
          />
        </Field>
      </div>

      <div className="form-row">
        <Field label="Categoría" htmlFor="tx-category" error={errors.category}>
          <select
            id="tx-category"
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Método de pago" htmlFor="tx-payment" optional error={errors.paymentMethod}>
          <select
            id="tx-payment"
            value={values.paymentMethod}
            onChange={(e) => setField('paymentMethod', e.target.value)}
          >
            <option value="">Sin especificar</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Nota" htmlFor="tx-note" optional error={errors.note}>
        <textarea
          id="tx-note"
          rows={3}
          maxLength={300}
          value={values.note}
          onChange={(e) => setField('note', e.target.value)}
          placeholder="Detalles adicionales"
        />
      </Field>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <Spinner size={16} />}
          {transaction ? 'Guardar cambios' : 'Registrar movimiento'}
        </button>
      </div>
    </form>
  );
}
