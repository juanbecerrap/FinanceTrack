import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { budgetDocId } from '../utils/validators';

const budgetsRef = (uid) => collection(db, 'users', uid, 'budgets');

export function subscribeToBudgets(uid, onData, onError) {
  return onSnapshot(
    budgetsRef(uid),
    (snapshot) => {
      onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
}

// El ID del documento es "<período>_<categoría>", así Firestore garantiza
// un único presupuesto por categoría y mes (las reglas también lo exigen).
export function createBudget(uid, { category, limit, period }) {
  const id = budgetDocId(period, category);
  return setDoc(doc(db, 'users', uid, 'budgets', id), {
    category,
    limit: Number(limit),
    period,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateBudgetLimit(uid, id, limit) {
  return updateDoc(doc(db, 'users', uid, 'budgets', id), {
    limit: Number(limit),
    updatedAt: serverTimestamp(),
  });
}

export function removeBudget(uid, id) {
  return deleteDoc(doc(db, 'users', uid, 'budgets', id));
}
