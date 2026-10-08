import { Link } from 'react-router-dom';
import { Banknote, LayoutDashboard, LogOut, Mail, PiggyBank, Receipt } from 'lucide-react';
import { useAuth, useToast } from '../hooks/useFinance';
import { logout } from '../services/authService';
import { CURRENCY_CODE } from '../utils/format';

const SHORTCUTS = [
  { to: '/', label: 'Resumen financiero', icon: LayoutDashboard },
  { to: '/transacciones', label: 'Movimientos', icon: Receipt },
  { to: '/presupuestos', label: 'Presupuestos', icon: PiggyBank },
];

export default function ProfilePage() {
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
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Perfil y configuración</h1>
          <p className="page-subtitle">Datos de tu cuenta.</p>
        </div>
      </header>

      <section className="card profile-card">
        <div className="profile-row">
          <span className="profile-icon">
            <Mail size={18} />
          </span>
          <div>
            <span className="profile-label">Correo electrónico</span>
            <strong>{user?.email}</strong>
          </div>
        </div>
        <div className="profile-row">
          <span className="profile-icon">
            <Banknote size={18} />
          </span>
          <div>
            <span className="profile-label">Moneda</span>
            <strong>Peso colombiano ({CURRENCY_CODE})</strong>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Accesos rápidos</h2>
        <div className="shortcut-list">
          {SHORTCUTS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="shortcut">
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Sesión</h2>
        <button type="button" className="btn btn-danger-outline" onClick={handleLogout}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
