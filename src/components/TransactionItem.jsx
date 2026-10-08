import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { formatCOP, formatDate } from '../utils/format';

// Fila de una transacción. Si recibe onEdit/onDelete muestra las acciones.
export default function TransactionItem({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === 'income';
  return (
    <li className="tx-item">
      <span className={`tx-icon ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </span>
      <div className="tx-main">
        <strong className="tx-title">{transaction.description}</strong>
        <span className="tx-meta">
          {transaction.category} · {formatDate(transaction.date)}
          {transaction.paymentMethod ? ` · ${transaction.paymentMethod}` : ''}
        </span>
        {transaction.note && <span className="tx-note">{transaction.note}</span>}
      </div>
      <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? '+' : '−'}
        {formatCOP(transaction.amount)}
      </span>
      {(onEdit || onDelete) && (
        <div className="tx-actions">
          {onEdit && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(transaction)}
              aria-label={`Editar ${transaction.description}`}
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="icon-btn danger"
              onClick={() => onDelete(transaction)}
              aria-label={`Eliminar ${transaction.description}`}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
