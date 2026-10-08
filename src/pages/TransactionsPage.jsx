import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Receipt, Search, SearchX } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Spinner';
import TransactionForm from '../components/TransactionForm';
import TransactionItem from '../components/TransactionItem';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFinance, useToast } from '../hooks/useFinance';
import {
  createTransaction,
  removeTransaction,
  updateTransaction,
} from '../services/transactionsService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { filterTransactions, getPeriod, paginate, sortByDateDesc } from '../utils/finance';
import { formatPeriodLabel } from '../utils/format';
import { getErrorMessage } from '../utils/firebaseErrors';

const PAGE_SIZE = 10;
const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

export default function TransactionsPage() {
  const { uid, transactions, loading, error } = useFinance();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  // Permite abrir el formulario desde el dashboard ("Nuevo movimiento").
  useEffect(() => {
    if (location.state?.openForm) {
      setEditing(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type, category, period]);

  const periods = useMemo(() => {
    const unique = [...new Set(transactions.map((t) => getPeriod(t.date)))];
    return unique.sort().reverse();
  }, [transactions]);

  const filtered = useMemo(
    () =>
      sortByDateDesc(
        filterTransactions(transactions, { search: debouncedSearch, type, category, period })
      ),
    [transactions, debouncedSearch, type, category, period]
  );

  const pageData = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const hasFilters = search || type !== 'all' || category !== 'all' || period !== 'all';

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setPeriod('all');
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateTransaction(uid, editing.id, data);
        toast.success('Movimiento actualizado.');
      } else {
        await createTransaction(uid, data);
        toast.success('Movimiento registrado.');
      }
      closeForm();
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo guardar el movimiento.'));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeTransaction(uid, toDelete.id);
      toast.success('Movimiento eliminado.');
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar el movimiento.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader label="Cargando movimientos…" />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Movimientos</h1>
          <p className="page-subtitle">Registra, busca y edita tus ingresos y gastos.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} />
            Nuevo movimiento
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={Receipt}
            title="No hay movimientos registrados"
            description="Empieza registrando tu primer ingreso o gasto."
            action={
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Plus size={18} />
                Registrar movimiento
              </button>
            }
          />
        </section>
      ) : (
        <section className="card">
          <div className="filters">
            <label className="search-box">
              <Search size={18} />
              <span className="sr-only">Buscar por descripción</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descripción…"
              />
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Categoría"
            >
              <option value="all">Todas las categorías</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Período">
              <option value="all">Todo el historial</option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriodLabel(p)}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Sin resultados"
              description="Ningún movimiento coincide con los filtros seleccionados."
              action={
                hasFilters && (
                  <button type="button" className="btn btn-ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                )
              }
            />
          ) : (
            <>
              <ul className="tx-list">
                {pageData.items.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={openEdit}
                    onDelete={setToDelete}
                  />
                ))}
              </ul>

              <div className="pagination">
                <span>
                  {pageData.total} {pageData.total === 1 ? 'movimiento' : 'movimientos'}
                </span>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setPage(pageData.page - 1)}
                    disabled={pageData.page <= 1}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>
                    Página {pageData.page} de {pageData.totalPages}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setPage(pageData.page + 1)}
                    disabled={pageData.page >= pageData.totalPages}
                    aria-label="Página siguiente"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {formOpen && (
        <Modal title={editing ? 'Editar movimiento' : 'Nuevo movimiento'} onClose={closeForm}>
          <TransactionForm transaction={editing} onSubmit={handleSubmit} onCancel={closeForm} />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar movimiento"
          message={`¿Seguro que quieres eliminar "${toDelete.description}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
