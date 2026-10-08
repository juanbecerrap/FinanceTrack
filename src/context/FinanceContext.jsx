import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToTransactions } from '../services/transactionsService';
import { subscribeToBudgets } from '../services/budgetsService';
import { getErrorMessage } from '../utils/firebaseErrors';

const FinanceContext = createContext(null);

// Mantiene suscripciones en tiempo real a los movimientos y presupuestos del
// usuario. Cualquier cambio actualiza automáticamente todos los indicadores.
export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [error, setError] = useState('');

  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return undefined;
    setLoadingTransactions(true);
    setLoadingBudgets(true);
    setError('');

    const handleError = (err) => {
      setError(getErrorMessage(err, 'No se pudieron cargar tus datos.'));
      setLoadingTransactions(false);
      setLoadingBudgets(false);
    };

    const unsubTransactions = subscribeToTransactions(
      uid,
      (list) => {
        setTransactions(list);
        setLoadingTransactions(false);
      },
      handleError
    );
    const unsubBudgets = subscribeToBudgets(
      uid,
      (list) => {
        setBudgets(list);
        setLoadingBudgets(false);
      },
      handleError
    );

    return () => {
      unsubTransactions();
      unsubBudgets();
    };
  }, [uid]);

  const value = useMemo(
    () => ({
      uid,
      transactions,
      budgets,
      loading: loadingTransactions || loadingBudgets,
      error,
    }),
    [uid, transactions, budgets, loadingTransactions, loadingBudgets, error]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance debe usarse dentro de FinanceProvider');
  return context;
}
