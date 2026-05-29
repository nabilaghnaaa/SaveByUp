import { useNavigate } from "react-router-dom";

import AppIcon from "../../../components/ui/AppIcon";
import { getFoodStatusLabel } from "../../../utils/foodStatus";

export default function InventoryActionMenu({
  food,
  onClose,
  onDelete,
  onOpenStockAction,
}) {
  const navigate = useNavigate();

  if (!food) return null;

  const imageSource = food.image_url || food.image;
  const totalQuantity = Number(food.quantity || 0);
  const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);
  const marketplaceQuantity = Number(food.active_marketplace_quantity || 0);

  const isFinishedStatus = [
    "kedaluwarsa",
    "dibuang",
    "terjual",
    "digunakan",
  ].includes(food.status);

  const canSell = !isFinishedStatus && freeQuantity > 0;
  const canReduceStock = freeQuantity > 0;

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <div
        className="inventory-action-menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="inventory-modal-header">
          <div>
            <span>Aksi Makanan</span>
            <h3>{food.name || "Tanpa nama"}</h3>
          </div>

          <button
            type="button"
            className="inventory-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

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
              Status: {getFoodStatusLabel(food.status)} • Total:{" "}
              {totalQuantity} {food.unit || "pcs"} • Bebas: {freeQuantity}{" "}
              {food.unit || "pcs"} • Dijual: {marketplaceQuantity}{" "}
              {food.unit || "pcs"}
            </small>
          </div>
        </div>

        <div className="inventory-menu-grid">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/foods/edit/${food.id}`);
            }}
          >
            <span>
              <AppIcon name="edit" />
            </span>
            <strong>Edit Data</strong>
            <small>Ubah nama, stok, harga, tanggal, atau catatan.</small>
          </button>

          <button
            type="button"
            disabled={!canSell}
            onClick={() => {
              onClose();
              navigate(`/marketplace/sell/${food.id}`);
            }}
          >
            <span>
              <AppIcon name="marketplace" />
            </span>
            <strong>Jual</strong>
            <small>Tawarkan stok bebas ke marketplace.</small>
          </button>

          <button
            type="button"
            disabled={!canReduceStock}
            onClick={() => onOpenStockAction(food, "digunakan")}
          >
            <span>
              <AppIcon name="used" />
            </span>
            <strong>Digunakan</strong>
            <small>Kurangi stok bebas yang sudah kamu pakai.</small>
          </button>

          <button
            type="button"
            disabled={!canReduceStock}
            onClick={() => onOpenStockAction(food, "dibuang")}
          >
            <span>
              <AppIcon name="discard" />
            </span>
            <strong>Dibuang</strong>
            <small>Kurangi stok bebas yang sudah terbuang.</small>
          </button>

          <button
            type="button"
            className="danger"
            onClick={() => onDelete(food)}
          >
            <span>
              <AppIcon name="delete" />
            </span>
            <strong>Hapus</strong>
            <small>Hapus data makanan dari inventaris.</small>
          </button>
        </div>
      </div>
    </div>
  );
}