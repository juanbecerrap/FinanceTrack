import { TriangleAlert } from 'lucide-react';
import Logo from './Logo';
import { missingConfigKeys } from '../services/firebase';

const ENV_NAMES = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

// Se muestra cuando falta el archivo .env, en lugar de dejar la pantalla en blanco.
export default function ConfigMissing() {
  return (
    <div className="auth-shell">
      <div className="card auth-card config-missing">
        <Logo />
        <span className="empty-icon warn">
          <TriangleAlert size={28} />
        </span>
        <h1>Falta configurar Firebase</h1>
        <p>
          Crea un archivo <code>.env</code> en la raíz del proyecto (puedes copiar{' '}
          <code>.env.example</code>) con los valores de tu propio proyecto Firebase y reinicia{' '}
          <code>npm run dev</code>.
        </p>
        <p>Variables que faltan:</p>
        <ul>
          {missingConfigKeys.map((key) => (
            <li key={key}>
              <code>{ENV_NAMES[key]}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
