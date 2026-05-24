import { formatDate } from "../../../utils/formatDate";

import "../styles/notifications.css";

function getNotificationTypeLabel(type) {
  const labels = {
    expiry: "Kedaluwarsa",
    request: "Pengajuan",
    transaction: "Transaksi",
    system: "Sistem",
  };

  return labels[type] || "Sistem";
}

function getNotificationIcon(type) {
  const icons = {
    expiry: "⏰",
    request: "🤝",
    transaction: "🧾",
    system: "🔔",
  };

  return icons[type] || "🔔";
}

export default function NotificationCard({ notification, onRead }) {
  return (
    <article
      className={`notification-card sb-glass ${
        notification.is_read ? "is-read" : "is-unread"
      }`}
    >
      <div className={`notification-icon icon-${notification.type}`}>
        {getNotificationIcon(notification.type)}
      </div>

      <div className="notification-content">
        <div className="notification-card-top">
          <span className={`notification-type type-${notification.type}`}>
            {getNotificationTypeLabel(notification.type)}
          </span>

          {!notification.is_read && (
            <span className="notification-unread-dot">Baru</span>
          )}
        </div>

        <h3>{notification.title}</h3>

        <p>{notification.message}</p>

        <small>{formatDate(notification.created_at)}</small>
      </div>

      <div className="notification-actions">
        {!notification.is_read ? (
          <button type="button" className="sb-btn sb-btn-ghost" onClick={onRead}>
            Tandai Dibaca
          </button>
        ) : (
          <span className="notification-read-label">Sudah dibaca</span>
        )}
      </div>
    </article>
  );
}