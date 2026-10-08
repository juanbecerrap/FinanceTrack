import Modal from './Modal';
import { Spinner } from './Spinner';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Eliminar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={loading ? () => {} : onCancel} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading && <Spinner size={16} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
