import AppIcon from "../../../components/ui/AppIcon";

export default function InventoryStockModal({
  modal,
  onClose,
  onQuantityChange,
  onSubmit,
}) {
  const food = modal.food;

  if (!food) return null;

  const unit = food.unit || "pcs";
  const imageSource = food.image_url || food.image || "";
  const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);

  const actionText = modal.status === "digunakan" ? "digunakan" : "dibuang";

  const decreaseQuantity = () => {
    const current = Number(modal.quantity || 0);
    onQuantityChange(Math.max(current - 1, 1));
  };

  const increaseQuantity = () => {
    const current = Number(modal.quantity || 0);
    onQuantityChange(Math.min(current + 1, freeQuantity || 1));
  };

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <form
        className="inventory-action-modal"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="inventory-modal-close"
          onClick={onClose}
          aria-label="Tutup popup"
        >
          ×
        </button>

        <div className="inventory-action-heading">
          <span>Kelola Stok</span>
          <h3>{modal.title}</h3>
          <p>{modal.description}</p>
        </div>

        <div className="inventory-action-food-card">
          <div className="inventory-action-food-image">
            {imageSource ? (
              <img src={imageSource} alt={food.name || "Foto makanan"} />
            ) : (
              <AppIcon name="food" size={28} />
            )}
          </div>

          <div className="inventory-action-food-content">
            <strong>{food.name || "Tanpa nama"}</strong>
            <small>
              Stok bebas: {freeQuantity} {unit} dari total {food.quantity}{" "}
              {unit}
            </small>
          </div>
        </div>

        <label className="inventory-stock-label">
          Jumlah yang {actionText}
        </label>

        <div className="inventory-quantity-control">
          <button type="button" onClick={decreaseQuantity}>
            −
          </button>

          <input
            type="number"
            min="1"
            max={freeQuantity}
            value={modal.quantity}
            placeholder={`Maks. ${freeQuantity}`}
            onChange={(event) => onQuantityChange(event.target.value)}
            autoFocus
          />

          <button type="button" onClick={increaseQuantity}>
            +
          </button>
        </div>

        <small className="inventory-modal-note">
          Sistem hanya mengurangi stok bebas. Stok yang sedang aktif di
          marketplace tidak ikut berubah dari aksi ini.
        </small>

        <div className="inventory-modal-actions">
          <button
            type="button"
            className="sb-btn dashboard-btn-outline"
            onClick={onClose}
          >
            Batal
          </button>

          <button type="submit" className="sb-btn sb-btn-primary">
            {modal.buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}