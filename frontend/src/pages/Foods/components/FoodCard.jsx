import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getFoodPriority,
  getFoodStatusLabel,
} from "../../../utils/foodStatus";

import "../styles/foodCard.css";

export default function FoodCard({ food, onAction }) {
  const priority = getFoodPriority(food.expiry_date, food.status);
  const imageSource = food.image_url;

  const totalStock = Number(food.quantity || 0);
  const soldStock = Number(food.active_marketplace_quantity || 0);
  const freeStock = Number(food.free_quantity ?? totalStock - soldStock);

  return (
    <article className={`food-card food-card-${priority.tone}`}>
      <div className="food-card-image">
        {imageSource ? (
          <img src={imageSource} alt={food.name} />
        ) : (
          <div className="food-card-placeholder">
            <span>🍱</span>
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
              {totalStock} {food.unit}
            </strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{getDaysLeftLabel(food.expiry_date)}</strong>
          </div>

          <div>
            <span>Stok Bebas</span>
            <strong>
              {freeStock} {food.unit}
            </strong>
          </div>

          <div>
            <span>Aktif Dijual</span>
            <strong>
              {soldStock} {food.unit}
            </strong>
          </div>
        </div>

        <div className="food-expiry-line">
          <span>Tanggal: {formatDate(food.expiry_date)}</span>
        </div>

        {food.note && <p className="food-note">{food.note}</p>}

        <div className="food-actions">
          <button type="button" className="food-action-main" onClick={onOpenActions}>
            Aksi Makanan
          </button>
        </div>
      </div>
    </article>
  );
}