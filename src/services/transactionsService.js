import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const transactionsRef = (uid) => collection(db, 'users', uid, 'transactions');

// Escucha los movimientos del usuario en tiempo real (más recientes primero).
export function subscribeToTransactions(uid, onData, onError) {
  const q = query(transactionsRef(uid), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : 0,
        };
      });
      onData(list);
    },
    onError
  );
}

export function createTransaction(uid, data) {
  return addDoc(transactionsRef(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateTransaction(uid, id, data) {
  // Los campos opcionales vacíos se eliminan del documento.
  const payload = {
    ...data,
    paymentMethod: data.paymentMethod ?? deleteField(),
    note: data.note ?? deleteField(),
    updatedAt: serverTimestamp(),
  };
  return updateDoc(doc(db, 'users', uid, 'transactions', id), payload);
}

export function removeTransaction(uid, id) {
  return deleteDoc(doc(db, 'users', uid, 'transactions', id));
}
