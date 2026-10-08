import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, LogOut, PiggyBank, Receipt, UserRound } from 'lucide-react';
import Logo from '../components/Logo';
import { FinanceProvider } from '../context/FinanceContext';
import { useAuth, useToast } from '../hooks/useFinance';
import { logout } from '../services/authService';

const NAV_ITEMS = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/transacciones', label: 'Movimientos', icon: Receipt },
  { to: '/presupuestos', label: 'Presupuestos', icon: PiggyBank },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
];

export default function AppLayout() {
  const { user } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  };

  return (
    <FinanceProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <Logo light />
          <nav className="sidebar-nav" aria-label="Navegación principal">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <span className="avatar">{(user?.email || '?').charAt(0).toUpperCase()}</span>
              <span className="sidebar-email" title={user?.email}>
                {user?.email}
              </span>
            </div>
            <button type="button" className="nav-link logout" onClick={handleLogout}>
              <LogOut size={19} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <header className="mobile-header">
          <Logo />
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        <nav className="bottom-nav" aria-label="Navegación móvil">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `bottom-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </FinanceProvider>
  );
}
