import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Field from '../components/Field';
import { Spinner } from '../components/Spinner';
import { registerWithEmail } from '../services/authService';
import { getErrorMessage } from '../utils/firebaseErrors';
import { validateAuth } from '../utils/validators';

export default function RegisterPage() {
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '' });
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
    const found = validateAuth(values, 'register');
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      // Firebase inicia sesión automáticamente tras el registro.
      await registerWithEmail(values.email, values.password);
    } catch (error) {
      setFormError(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Crea tu cuenta</h1>
      <p className="auth-subtitle">Empieza a registrar tus ingresos y gastos.</p>

      {formError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Correo electrónico" htmlFor="reg-email" error={errors.email}>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="tu@correo.com"
          />
        </Field>
        <Field label="Contraseña" htmlFor="reg-password" error={errors.password}>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="reg-confirm" error={errors.confirmPassword}>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            placeholder="Repite la contraseña"
          />
        </Field>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <Spinner size={16} />}
          Crear cuenta
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </>
  );
}
