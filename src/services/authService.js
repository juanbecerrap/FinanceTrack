import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logout() {
  return signOut(auth);
}

export function sendResetEmail(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

// Devuelve la función para cancelar la suscripción. Firebase mantiene la sesión
// (persistencia local por defecto), por eso al recargar el usuario sigue autenticado.
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
