import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Plus, Scale, TrendingUp, Wallet } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ExpensesChart from '../components/ExpensesChart';
import { PageLoader } from '../components/Spinner';
import StatCard from '../components/StatCard';
import TransactionItem from '../components/TransactionItem';
import TrendChart from '../components/TrendChart';
import { useFinance } from '../hooks/useFinance';
import {
  calculateBalance,
  expensesByCategory,
  monthlySummary,
  sortByDateDesc,
  trendByMonth,
} from '../utils/finance';
import { currentPeriod, formatPeriodLabel, periodOptions } from '../utils/format';

const RECENT_LIMIT = 6;

export default function DashboardPage() {
  const { transactions, loading, error } = useFinance();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(currentPeriod);

  const options = useMemo(() => periodOptions(12), []);
  const balance = useMemo(() => calculateBalance(transactions), [transactions]);
  const summary = useMemo(() => monthlySummary(transactions, period), [transactions, period]);
  const categoryData = useMemo(() => expensesByCategory(transactions, period), [transactions, period]);
  const trendData = useMemo(() => trendByMonth(transactions, period, 6), [transactions, period]);
  const recent = useMemo(
    () => sortByDateDesc(transactions).slice(0, RECENT_LIMIT),
    [transactions]
  );

  const openNewTransaction = () => navigate('/transacciones', { state: { openForm: true } });

  if (loading) return <PageLoader label="Cargando tus finanzas…" />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Resumen financiero</h1>
          <p className="page-subtitle">{formatPeriodLabel(period)}</p>
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
          <button type="button" className="btn btn-primary" onClick={openNewTransaction}>
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
            icon={Wallet}
            title="Aún no tienes movimientos"
            description="Registra tu primer ingreso o gasto y aquí verás tu saldo, tus gráficos y tu actividad reciente."
            action={
              <button type="button" className="btn btn-primary" onClick={openNewTransaction}>
                <Plus size={18} />
                Registrar primer movimiento
              </button>
            }
          />
        </section>
      ) : (
        <>
          <section className="stats-grid" aria-label="Indicadores">
            <StatCard
              label="Saldo total"
              value={balance}
              icon={Wallet}
              tone="primary"
              hint="Ingresos menos gastos de todo el historial"
            />
            <StatCard
              label="Ingresos del mes"
              value={summary.income}
              icon={ArrowDownLeft}
              tone="positive"
            />
            <StatCard
              label="Gastos del mes"
              value={summary.expense}
              icon={ArrowUpRight}
              tone="negative"
            />
            <StatCard
              label="Diferencia del mes"
              value={summary.difference}
              icon={Scale}
              tone={summary.difference >= 0 ? 'positive' : 'negative'}
              hint={summary.difference >= 0 ? 'Ahorraste este mes' : 'Gastaste más de lo que ingresó'}
            />
          </section>

          <section className="charts-grid">
            <article className="card">
              <h2 className="card-title">Gastos por categoría</h2>
              {categoryData.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="Sin gastos en este mes"
                  description="Cuando registres gastos en este período verás aquí su distribución."
                />
              ) : (
                <ExpensesChart data={categoryData} />
              )}
            </article>
            <article className="card">
              <h2 className="card-title">Ingresos y gastos (6 meses)</h2>
              <div className="chart-box">
                <TrendChart data={trendData} />
              </div>
            </article>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Transacciones recientes</h2>
              <Link to="/transacciones" className="link-more">
                Ver todas
              </Link>
            </div>
            <ul className="tx-list">
              {recent.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
