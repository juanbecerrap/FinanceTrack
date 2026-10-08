// Traduce los códigos de error de Firebase a mensajes claros en español.
const MESSAGES = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo electrónico.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de conexión. Revisa tu internet e inténtalo de nuevo.',
  'auth/operation-not-allowed':
    'El inicio de sesión con correo no está habilitado en Firebase Authentication.',
  'auth/invalid-api-key': 'La configuración de Firebase no es válida. Revisa tu archivo .env.',
  'permission-denied': 'No tienes permiso para realizar esta operación.',
  unavailable: 'El servicio no está disponible. Revisa tu conexión e inténtalo de nuevo.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión nuevamente.',
  'not-found': 'No se encontró el registro solicitado.',
  'failed-precondition':
    'Firestore no está listo. Verifica que la base de datos esté creada en tu proyecto.',
};

export function getErrorMessage(error, fallback = 'Ocurrió un error inesperado. Inténtalo de nuevo.') {
  if (!error) return fallback;
  return MESSAGES[error.code] || fallback;
}
