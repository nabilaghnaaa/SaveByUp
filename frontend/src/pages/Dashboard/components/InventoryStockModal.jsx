import AppIcon from "../../../components/ui/AppIcon";

export default function InventoryStockModal({
  modal,
  onClose,
  onQuantityChange,
  onSubmit,
}) {
  if (!modal.open || !modal.food) return null;

  const { food, status, quantity, title, description, buttonLabel } = modal;

  const imageSource = food.image_url || food.image;
  const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);
  const actionLabel = status === "digunakan" ? "digunakan" : "dibuang";

  const decreaseQuantity = () => {
    const nextValue = Math.max(Number(quantity || 0) - 1, 1);
    onQuantityChange(nextValue);
  };

  const increaseQuantity = () => {
    const nextValue = Math.min(Number(quantity || 0) + 1, freeQuantity || 1);
    onQuantityChange(nextValue);
  };

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <form
        className="inventory-action-modal"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="inventory-modal-header">
          <div>
            <span>Kelola Stok</span>
            <h3>{title}</h3>
          </div>

          <button
            type="button"
            className="inventory-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="inventory-modal-description">{description}</p>

        <div className="inventory-modal-food">
          <div className="inventory-modal-food-icon">
            {imageSource ? (
              <img src={imageSource} alt={food.name || "Foto makanan"} />
            ) : (
              <AppIcon name="food" />
            )}
          </div>

          <div>
            <strong>{food.name || "Tanpa nama"}</strong>
            <small>
              Stok bebas: {freeQuantity} {food.unit || "pcs"} dari total{" "}
              {food.quantity} {food.unit || "pcs"}
            </small>
          </div>
        </div>

        <label>Jumlah yang {actionLabel}</label>

        <div className="inventory-quantity-control">
          <button type="button" onClick={decreaseQuantity}>
            −
          </button>

          <input
            type="number"
            min="1"
            max={freeQuantity}
            value={quantity}
            placeholder={`Maks. ${freeQuantity}`}
            onChange={(event) => onQuantityChange(event.target.value)}
            autoFocus
          />

          <button type="button" onClick={increaseQuantity}>
            +
          </button>
        </div>

        <small className="inventory-modal-note">
          Stok yang sedang dijual di marketplace tidak ikut digunakan atau
          dibuang. Yang dikurangi hanya stok bebas.
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
            {buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}