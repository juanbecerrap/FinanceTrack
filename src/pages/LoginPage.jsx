import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Field from '../components/Field';
import { Spinner } from '../components/Spinner';
import { loginWithEmail } from '../services/authService';
import { getErrorMessage } from '../utils/firebaseErrors';
import { validateAuth } from '../utils/validators';

export default function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateAuth(values, 'login');
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      // Al iniciar sesión, PublicRoute redirige automáticamente al dashboard.
      await loginWithEmail(values.email, values.password);
    } catch (error) {
      setFormError(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Bienvenido de nuevo</h1>
      <p className="auth-subtitle">Inicia sesión para ver tus finanzas.</p>

      {formError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Correo electrónico" htmlFor="login-email" error={errors.email}>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="tu@correo.com"
          />
        </Field>
        <Field label="Contraseña" htmlFor="login-password" error={errors.password}>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Tu contraseña"
          />
        </Field>
        <div className="auth-links right">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <Spinner size={16} />}
          Iniciar sesión
        </button>
      </form>

      <p className="auth-switch">
        ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </>
  );
}
