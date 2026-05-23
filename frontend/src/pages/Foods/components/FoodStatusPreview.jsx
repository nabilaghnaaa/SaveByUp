import { getDaysLeftLabel } from "../../../utils/formatDate";
import { getFoodPriority, getFoodStatusLabel } from "../../../utils/foodStatus";

import "../styles/foodStatusPreview.css";

export default function FoodStatusPreview({ expiryDate, status, currentStatus }) {
  const priority = getFoodPriority(expiryDate, status);

  return (
    <section className={`food-status-preview preview-${priority.tone} sb-glass`}>
      <span className="preview-label">Status Otomatis</span>

      <h3>{getFoodStatusLabel(status)}</h3>

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
        <small>
          Makanan ini sedang ditawarkan di marketplace.
        </small>
      )}
    </section>
  );
}