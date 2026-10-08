import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useFinance';
import { PageLoader } from './Spinner';

// Solo deja pasar a usuarios autenticados. Mientras Firebase restaura la sesión
// muestra un indicador de carga (así recargar una página protegida no falla).
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verificando sesión…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Para login / registro: si ya hay sesión, redirige al dashboard.
export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Verificando sesión…" />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
