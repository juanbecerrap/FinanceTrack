import { useMemo, useState } from 'react';
import { AlertTriangle, CircleCheck, PiggyBank, Pencil, Plus, Trash2 } from 'lucide-react';
import BudgetForm from '../components/BudgetForm';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { PageLoader } from '../components/Spinner';
import { useFinance, useToast } from '../hooks/useFinance';
import { createBudget, removeBudget, updateBudgetLimit } from '../services/budgetsService';
import { budgetProgress, spentByCategory } from '../utils/finance';
import { currentPeriod, formatCOP, periodOptions } from '../utils/format';
import { getErrorMessage } from '../utils/firebaseErrors';
import { EXPENSE_CATEGORIES } from '../utils/categories';

const STATUS_TEXT = {
  ok: null,
  warning: 'Estás cerca del límite',
  reached: 'Alcanzaste el límite',
  exceeded: 'Superaste el límite',
};

export default function BudgetsPage() {
  const { uid, transactions, budgets, loading, error } = useFinance();
  const toast = useToast();

  const [period, setPeriod] = useState(currentPeriod);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const options = useMemo(() => periodOptions(12), []);
  const spent = useMemo(() => spentByCategory(transactions, period), [transactions, period]);

  const periodBudgets = useMemo(
    () =>
      budgets
        .filter((b) => b.period === period)
        .map((b) => ({ ...b, ...budgetProgress(b.limit, spent[b.category] || 0) }))
        .sort((a, b) => a.category.localeCompare(b.category, 'es')),
    [budgets, period, spent]
  );

  const allCovered = periodBudgets.length >= EXPENSE_CATEGORIES.length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateBudgetLimit(uid, editing.id, data.limit);
        toast.success('Presupuesto actualizado.');
      } else {
        await createBudget(uid, data);
        toast.success('Presupuesto creado.');
      }
      closeForm();
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo guardar el presupuesto.'));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeBudget(uid, toDelete.id);
      toast.success('Presupuesto eliminado.');
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar el presupuesto.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader label="Cargando presupuestos…" />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Presupuestos</h1>
          <p className="page-subtitle">Define un límite mensual por categoría de gasto.</p>
        </div>
        <div className="page-actions">
          <label className="select-inline">
            <span className="sr-only">Período</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-primary" onClick={openCreate} disabled={allCovered}>
            <Plus size={18} />
            Nuevo presupuesto
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {periodBudgets.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={PiggyBank}
            title="Sin presupuestos en este mes"
            description="Crea un presupuesto para una categoría y sigue cuánto llevas gastado."
            action={
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Plus size={18} />
                Crear presupuesto
              </button>
            }
          />
        </section>
      ) : (
        <section className="budget-grid">
          {periodBudgets.map((budget) => (
            <article key={budget.id} className={`card budget-card budget-${budget.status}`}>
              <header className="budget-head">
                <h2>{budget.category}</h2>
                <div className="tx-actions always">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => openEdit(budget)}
                    aria-label={`Editar presupuesto de ${budget.category}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => setToDelete(budget)}
                    aria-label={`Eliminar presupuesto de ${budget.category}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </header>

              <div className="budget-amounts">
                <strong>{formatCOP(budget.spent)}</strong>
                <span>de {formatCOP(budget.limit)}</span>
              </div>

              <ProgressBar percent={budget.percent} status={budget.status} />

              <footer className="budget-foot">
                <span>{Math.round(budget.percent)}% usado</span>
                <span className={budget.remaining < 0 ? 'negative' : ''}>
                  {budget.remaining >= 0
                    ? `Disponible: ${formatCOP(budget.remaining)}`
                    : `Excedido por ${formatCOP(Math.abs(budget.remaining))}`}
                </span>
              </footer>

              {STATUS_TEXT[budget.status] && (
                <div className={`budget-alert ${budget.status}`} role="alert">
                  <AlertTriangle size={16} />
                  {STATUS_TEXT[budget.status]}
                </div>
              )}
              {budget.status === 'ok' && (
                <div className="budget-alert good">
                  <CircleCheck size={16} />
                  Vas bien con este presupuesto
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {formOpen && (
        <Modal title={editing ? 'Editar presupuesto' : 'Nuevo presupuesto'} onClose={closeForm}>
          <BudgetForm
            budget={editing}
            period={period}
            existingBudgets={budgets}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar presupuesto"
          message={`¿Eliminar el presupuesto de ${toDelete.category}? Tus movimientos no se modificarán.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
