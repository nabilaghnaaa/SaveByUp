import { useState } from "react";

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
  const [showActions, setShowActions] = useState(false);

  const priority = getFoodPriority(food.expiry_date, food.status);
  const isSellable = canSellFood(food);
  const imageSource = food.image_url || food.image;

  const closeActions = () => {
    setShowActions(false);
  };

  const handleAction = (callback) => {
    closeActions();

    if (typeof callback === "function") {
      callback();
    }
  };

  return (
    <>
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
              <span>Jumlah Stok</span>
              <strong>
                {food.quantity} {food.unit || "pcs"}
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

          <button
            type="button"
            className="food-action-main"
            onClick={() => setShowActions(true)}
          >
            Aksi Makanan
          </button>
        </div>
      </article>

      {showActions && (
        <div className="food-action-backdrop" onClick={closeActions}>
          <section
            className="food-action-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="food-action-panel-header">
              <div>
                <span>Aksi Makanan</span>
                <h3>{food.name || "Tanpa nama"}</h3>
                <p>
                  Total stok: {food.quantity} {food.unit || "pcs"}
                </p>
              </div>

              <button
                type="button"
                className="food-action-close"
                onClick={closeActions}
              >
                ×
              </button>
            </div>

            <div className="food-action-food-preview">
              <div className="food-action-food-image">
                {imageSource ? (
                  <img src={imageSource} alt={food.name} />
                ) : (
                  <span>🍱</span>
                )}
              </div>

              <div>
                <strong>{food.name || "Tanpa nama"}</strong>
                <small>
                  Status: {getFoodStatusLabel(food.status)} • Stok:{" "}
                  {food.quantity} {food.unit || "pcs"}
                </small>
              </div>
            </div>

            <div className="food-action-list">
              <button type="button" onClick={() => handleAction(onEdit)}>
                <span>✏️</span>
                <div>
                  <strong>Edit Data</strong>
                  <small>Ubah nama, stok, harga, tanggal, atau catatan.</small>
                </div>
              </button>

              <button
                type="button"
                disabled={!isSellable}
                onClick={() => handleAction(onSell)}
              >
                <span>🛒</span>
                <div>
                  <strong>Jual</strong>
                  <small>Tawarkan stok makanan ke marketplace.</small>
                </div>
              </button>

              <button type="button" onClick={() => handleAction(onUsed)}>
                <span>✅</span>
                <div>
                  <strong>Digunakan</strong>
                  <small>Kurangi stok yang sudah kamu pakai.</small>
                </div>
              </button>

              <button type="button" onClick={() => handleAction(onDiscard)}>
                <span>🗑️</span>
                <div>
                  <strong>Dibuang</strong>
                  <small>Kurangi stok yang sudah terbuang.</small>
                </div>
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => handleAction(onDelete)}
              >
                <span>⛔</span>
                <div>
                  <strong>Hapus</strong>
                  <small>Hapus makanan dari inventaris.</small>
                </div>
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}