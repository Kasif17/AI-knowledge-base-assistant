import { FiAlertTriangle } from "react-icons/fi";

const ConfirmModal = ({ open, title, description, confirmLabel = "Confirm", danger, onConfirm, onCancel, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="relative card p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-2">
          {danger && (
            <div className="w-9 h-9 rounded-full bg-clay-soft text-clay flex items-center justify-center shrink-0">
              <FiAlertTriangle size={18} />
            </div>
          )}
          <div>
            <p className="font-display font-semibold text-lg">{title}</p>
            {description && <p className="text-sm text-ink/55 mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary text-sm" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger text-sm" : "btn-primary text-sm"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
