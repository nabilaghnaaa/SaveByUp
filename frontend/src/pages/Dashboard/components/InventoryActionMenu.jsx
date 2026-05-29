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

  const imageSource = food.image_url || food.image || "";
  const unit = food.unit || "pcs";

  const totalQuantity = Number(food.quantity || 0);
  const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);
  const marketplaceQuantity = Number(food.active_marketplace_quantity || 0);

  const finishedStatuses = ["kedaluwarsa", "dibuang", "terjual", "digunakan"];
  const isFinishedStatus = finishedStatuses.includes(food.status);

  const canSell = !isFinishedStatus && freeQuantity > 0;
  const canReduceStock = freeQuantity > 0;

  const handleEdit = () => {
    onClose();
    navigate(`/foods/edit/${food.id}`);
  };

  const handleSell = () => {
    if (!canSell) return;

    onClose();
    navigate(`/marketplace/sell/${food.id}`);
  };

  const handleUsed = () => {
    if (!canReduceStock) return;
    onOpenStockAction(food, "digunakan");
  };

  const handleDiscard = () => {
    if (!canReduceStock) return;
    onOpenStockAction(food, "dibuang");
  };

  const handleDelete = () => {
    onDelete(food);
  };

  const actions = [
    {
      title: "Edit Data",
      desc: "Ubah nama, kategori, jumlah stok, harga, tanggal, dan catatan.",
      icon: "edit",
      disabled: false,
      danger: false,
      onClick: handleEdit,
    },
    {
      title: "Jual",
      desc: "Tawarkan stok bebas ke marketplace tanpa mengganggu stok lain.",
      icon: "marketplace",
      disabled: !canSell,
      danger: false,
      onClick: handleSell,
    },
    {
      title: "Digunakan",
      desc: "Kurangi stok bebas yang sudah kamu pakai atau masak.",
      icon: "used",
      disabled: !canReduceStock,
      danger: false,
      onClick: handleUsed,
    },
    {
      title: "Dibuang",
      desc: "Kurangi stok bebas yang sudah rusak atau tidak layak.",
      icon: "discard",
      disabled: !canReduceStock,
      danger: false,
      onClick: handleDiscard,
    },
    {
      title: "Hapus",
      desc: "Hapus data makanan dari inventaris kamu.",
      icon: "delete",
      disabled: false,
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <div className="inventory-modal-backdrop" onClick={onClose}>
      <section
        className="inventory-action-menu"
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
          <span>Aksi Makanan</span>
          <h3>{food.name || "Tanpa nama"}</h3>
          <p>
            Pilih aksi yang ingin dilakukan. Stok bebas dan stok marketplace
            dipisahkan supaya data inventaris tetap aman.
          </p>
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
            <small>{food.category || "Tanpa kategori"}</small>

            <div className="inventory-action-status-pill">
              {getFoodStatusLabel(food.status)}
            </div>
          </div>
        </div>

        <div className="inventory-stock-strip">
          <div>
            <span>Total</span>
            <strong>
              {totalQuantity} {unit}
            </strong>
          </div>

          <div>
            <span>Bebas</span>
            <strong>
              {freeQuantity} {unit}
            </strong>
          </div>

          <div>
            <span>Dijual</span>
            <strong>
              {marketplaceQuantity} {unit}
            </strong>
          </div>
        </div>

        {!canSell && !isFinishedStatus && (
          <div className="inventory-action-alert">
            Stok bebas sedang kosong, jadi makanan belum bisa dijual,
            digunakan, atau dibuang.
          </div>
        )}

        {isFinishedStatus && (
          <div className="inventory-action-alert">
            Status makanan ini sudah selesai/tidak aktif. Aksi jual, digunakan,
            dan dibuang otomatis dinonaktifkan.
          </div>
        )}

        <div className="inventory-menu-grid">
          {actions.map((action) => (
            <button
              type="button"
              key={action.title}
              className={action.danger ? "danger" : ""}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              <span>
                <AppIcon name={action.icon} size={20} />
              </span>

              <div>
                <strong>{action.title}</strong>
                <small>{action.desc}</small>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}