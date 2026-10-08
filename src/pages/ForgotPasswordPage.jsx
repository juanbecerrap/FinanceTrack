import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Field from '../components/Field';
import { Spinner } from '../components/Spinner';
import { sendResetEmail } from '../services/authService';
import { getErrorMessage } from '../utils/firebaseErrors';
import { validateAuth } from '../utils/validators';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateAuth({ email, password: '' }, 'reset');
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setLoading(true);
    setFormError('');
    try {
      await sendResetEmail(email);
      setSent(true);
    } catch (error) {
      // Por seguridad no revelamos si el correo existe o no.
      if (error.code === 'auth/user-not-found') setSent(true);
      else setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Recuperar contraseña</h1>
      <p className="auth-subtitle">
        Te enviaremos un enlace para que elijas una contraseña nueva.
      </p>

      {sent && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>
            Si existe una cuenta con ese correo, recibirás un mensaje con las instrucciones. Revisa
            también la carpeta de spam.
          </span>
        </div>
      )}
      {formError && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Correo electrónico" htmlFor="reset-email" error={errors.email}>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({});
              setFormError('');
            }}
            placeholder="tu@correo.com"
          />
        </Field>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <Spinner size={16} />}
          {sent ? 'Reenviar enlace' : 'Enviar enlace'}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </>
  );
}
