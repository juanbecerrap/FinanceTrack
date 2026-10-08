import { Outlet } from 'react-router-dom';
import { ShieldCheck, PieChart, Target } from 'lucide-react';
import Logo from '../components/Logo';

export default function AuthLayout() {
  return (
    <div className="auth-shell split">
      <aside className="auth-hero">
        <Logo light />
        <div className="auth-hero-body">
          <h2>Tus finanzas, claras y bajo control.</h2>
          <p>Registra ingresos y gastos, define presupuestos y entiende a dónde va tu dinero.</p>
          <ul>
            <li>
              <PieChart size={18} /> Gráficos por categoría y por mes
            </li>
            <li>
              <Target size={18} /> Presupuestos con alertas de consumo
            </li>
            <li>
              <ShieldCheck size={18} /> Tus datos son solo tuyos
            </li>
          </ul>
        </div>
        <small>Valores en pesos colombianos (COP)</small>
      </aside>
      <main className="auth-main">
        <div className="auth-card card">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
