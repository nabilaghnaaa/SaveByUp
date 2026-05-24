import "./styles/ui.css";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <section className="confirm-modal">
        <div className={`confirm-icon confirm-${tone}`}>!</div>

        <h3>{title}</h3>

        {description && <p>{description}</p>}

        <div className="confirm-actions">
          <button type="button" className="sb-btn sb-btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            type="button"
            className={`sb-btn ${
              tone === "danger" ? "sb-btn-danger" : "sb-btn-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}