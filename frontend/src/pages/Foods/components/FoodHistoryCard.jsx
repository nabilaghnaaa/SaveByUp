import AppIcon from "../../../components/ui/AppIcon";

import { formatDate } from "../../../utils/formatDate";
import { getFoodStatusLabel } from "../../../utils/foodStatus";

import "../styles/foodHistoryCard.css";

const formatRupiah = (value) => {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
};

const getHistoryActionLabel = (action) => {
  const labels = {
    digunakan: "Digunakan",
    dibuang: "Dibuang",
    terjual: "Terjual",
    kedaluwarsa: "Kedaluwarsa",
  };

  return labels[action] || "Riwayat";
};

const getHistoryTone = (action) => {
  if (action === "dibuang" || action === "kedaluwarsa") return "danger";
  if (action === "terjual") return "market";
  if (action === "digunakan") return "done";

  return "neutral";
};

export default function FoodHistoryCard({ item }) {
  const imageSource = item.image_url || item.image;
  const actionLabel = getHistoryActionLabel(item.action || item.status);
  const tone = getHistoryTone(item.action || item.status);

  return (
    <article className={`food-history-card food-history-${tone}`}>
      <div className="food-history-media">
        {imageSource ? (
          <img src={imageSource} alt={item.name || "Foto makanan"} />
        ) : (
          <div className="food-history-placeholder">
            <AppIcon name="waste" />
          </div>
        )}

        <div className="food-history-overlay" />

        <span className="food-history-action-badge">{actionLabel}</span>
      </div>

      <div className="food-history-content">
        <div className="food-history-main">
          <div>
            <span className="food-history-category">
              {item.category || "Riwayat"}
            </span>

            <h3>{item.name || "Makanan"}</h3>
          </div>

          <strong className="food-history-price">
            {formatRupiah(item.price)}
          </strong>
        </div>

        <p className="food-history-note">
          {item.note ||
            `Makanan ini tercatat sebagai ${actionLabel.toLowerCase()}.`}
        </p>

        <div className="food-history-meta-grid">
          <div>
            <span>Jumlah</span>
            <strong>
              {Number(item.quantity || 0)} {item.unit || "pcs"}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{getFoodStatusLabel(item.status || item.action)}</strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{formatDate(item.expiry_date)}</strong>
          </div>

          <div>
            <span>Tercatat</span>
            <strong>{formatDate(item.created_at)}</strong>
          </div>
        </div>

        <div className="food-history-footer">
          <span>
            {item.source === "stock_log"
              ? "Riwayat stok makanan"
              : "Makanan melewati kedaluwarsa"}
          </span>

          <b>{actionLabel}</b>
        </div>
      </div>
    </article>
  );
}