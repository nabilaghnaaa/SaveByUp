import { getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getFoodPriority,
  getFoodStatusLabel,
} from "../../../utils/foodStatus";

import "../styles/foodStatusPreview.css";

export default function FoodStatusPreview({
  expiryDate,
  autoStatus,
  currentStatus,
}) {
  const priority = getFoodPriority(expiryDate, autoStatus);

  return (
    <section className={`food-status-preview preview-${priority.tone}`}>
      <div className="status-preview-glow" />

      <span className="preview-label">Status Otomatis</span>

      <h3>{getFoodStatusLabel(autoStatus)}</h3>

      <p>{priority.message}</p>

      <div className="preview-info-grid">
        <div>
          <span>Sisa Waktu</span>
          <strong>{getDaysLeftLabel(expiryDate)}</strong>
        </div>

        <div>
          <span>Prioritas</span>
          <strong>{priority.label}</strong>
        </div>
      </div>

      {currentStatus === "dijual" && (
        <small>Makanan ini sedang ditawarkan di marketplace.</small>
      )}

      {currentStatus === "digunakan" && (
        <small>Makanan ini sudah ditandai sebagai digunakan.</small>
      )}

      {currentStatus === "dibuang" && (
        <small>Makanan ini sudah ditandai sebagai dibuang.</small>
      )}
    </section>
  );
}