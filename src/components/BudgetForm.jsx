import { useState } from 'react';
import Field from './Field';
import { Spinner } from './Spinner';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { formatPeriodLabel } from '../utils/format';
import { validateBudget } from '../utils/validators';

// Crea un presupuesto nuevo, o edita el límite de uno existente (categoría y mes fijos).
export default function BudgetForm({ budget, period, existingBudgets, onSubmit, onCancel }) {
  const editing = Boolean(budget);
  const [values, setValues] = useState({
    category: budget?.category || '',
    limit: budget ? String(budget.limit) : '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const usedCategories = existingBudgets.filter((b) => b.period === period).map((b) => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !usedCategories.includes(c));

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateBudget(
      { category: values.category, limit: values.limit, period },
      existingBudgets,
      budget?.id ?? null
    );
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ category: values.category, limit: Number(values.limit), period });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p className="form-hint">
        Período: <strong>{formatPeriodLabel(period)}</strong>
      </p>

      <Field label="Categoría de gasto" htmlFor="bd-category" error={errors.category}>
        {editing ? (
          <input id="bd-category" type="text" value={values.category} disabled readOnly />
        ) : (
          <select
            id="bd-category"
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
          >
            <option value="">Selecciona…</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Límite mensual (COP)" htmlFor="bd-limit" error={errors.limit}>
        <input
          id="bd-limit"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={values.limit}
          onChange={(e) => setField('limit', e.target.value)}
          placeholder="0"
        />
      </Field>

      {errors.period && (
        <p className="field-error" role="alert">
          {errors.period}
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <Spinner size={16} />}
          {editing ? 'Guardar límite' : 'Crear presupuesto'}
        </button>
      </div>
    </form>
  );
}
