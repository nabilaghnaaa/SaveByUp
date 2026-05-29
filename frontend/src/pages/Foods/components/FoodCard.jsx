import AppIcon from "../../../components/ui/AppIcon";

import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getFoodPriority,
  getFoodStatusLabel,
} from "../../../utils/foodStatus";

import "../styles/foodCard.css";

export default function FoodCard({ food, onAction }) {
  const priority = getFoodPriority(food.expiry_date, food.status);
  const imageSource = food.image_url || food.image;

  const totalQuantity = Number(food.quantity || 0);
  const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);
  const marketplaceQuantity = Number(food.active_marketplace_quantity || 0);

  return (
    <article className={`food-card food-card-${priority.tone}`}>
      <div className="food-card-image">
        {imageSource ? (
          <img src={imageSource} alt={food.name || "Foto makanan"} />
        ) : (
          <div className="food-card-placeholder">
            <AppIcon name="food" />
          </div>
        )}

        <div className="food-card-overlay" />

        <span className={`food-card-status status-${priority.tone}`}>
          {getFoodStatusLabel(food.status)}
        </span>

        <span className={`food-card-priority priority-${priority.tone}`}>
          {priority.label}
        </span>
      </div>

      <div className="food-card-body">
        <div className="food-card-head">
          <div>
            <span>{food.category || "Tanpa kategori"}</span>
            <h3>{food.name || "Tanpa nama"}</h3>
          </div>
        </div>

        <div className="food-meta-grid">
          <div>
            <span>Total Stok</span>
            <strong>
              {totalQuantity} {food.unit || "pcs"}
            </strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{getDaysLeftLabel(food.expiry_date)}</strong>
          </div>

          <div>
            <span>Stok Bebas</span>
            <strong>
              {freeQuantity} {food.unit || "pcs"}
            </strong>
          </div>

          <div>
            <span>Di Marketplace</span>
            <strong>
              {marketplaceQuantity} {food.unit || "pcs"}
            </strong>
          </div>
        </div>

        <div className="food-expiry-line">
          <AppIcon name="calendar" />
          <span>Tanggal: {formatDate(food.expiry_date)}</span>
        </div>

        {food.note && <p className="food-note">{food.note}</p>}

        <button
          type="button"
          className="food-action-main"
          onClick={() => {
            if (typeof onAction === "function") {
              onAction(food);
            }
          }}
        >
          <AppIcon name="sparkle" />
          <span>Aksi Makanan</span>
        </button>
      </div>
    </article>
  );
}