import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  canSellFood,
  getFoodPriority,
  getFoodStatusLabel,
} from "../../../utils/foodStatus";

import "../styles/foodCard.css";

export default function FoodCard({
  food,
  onEdit,
  onDelete,
  onUsed,
  onDiscard,
  onSell,
}) {
  const priority = getFoodPriority(food.expiry_date, food.status);
  const isSellable = canSellFood(food);
  const imageSource = food.image_url;

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

        <span className={`food-card-status status-${priority.tone}`}>
          {getFoodStatusLabel(food.status)}
        </span>
      </div>

      <div className="food-card-body">
        <div className="food-card-head">
          <div>
            <h3>{food.name || "Tanpa nama"}</h3>
            <p>{food.category || "Tanpa kategori"}</p>
          </div>

          <span className={`food-priority priority-${priority.tone}`}>
            {priority.label}
          </span>
        </div>

        <div className="food-meta-grid">
          <div>
            <span>Jumlah Stok</span>
            <strong>
              {food.quantity} {food.unit}
            </strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{getDaysLeftLabel(food.expiry_date)}</strong>
          </div>
        </div>

        <div className="food-expiry-line">
          <span>Tanggal: {formatDate(food.expiry_date)}</span>
        </div>

        {food.note && <p className="food-note">{food.note}</p>}

        <div className="food-actions">
          <button type="button" onClick={onEdit}>
            Edit
          </button>

          <button type="button" disabled={!isSellable} onClick={onSell}>
            Jual
          </button>

          <button type="button" onClick={onUsed}>
            Digunakan
          </button>

          <button type="button" onClick={onDiscard}>
            Dibuang
          </button>

          <button type="button" className="danger" onClick={onDelete}>
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}