import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <EmptyState
          icon={Compass}
          title="Página no encontrada"
          description="La dirección que buscas no existe o fue movida."
          action={
            <Link to="/" className="btn btn-primary">
              Ir al inicio
            </Link>
          }
        />
      </div>
    </div>
  );
}
