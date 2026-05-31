import AppIcon from "../../../components/ui/AppIcon";

import { formatDate } from "../../../utils/formatDate";

import "../styles/transactionLocationPanel.css";

const getStatusLabel = (status) => {
  const labels = {
    waiting_buyer_confirmation: "Menunggu Konfirmasi Lokasi",
    waiting_cod: "Menunggu COD",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status] || "Transaksi";
};

const getMapsUrl = (location = {}) => {
  if (location.maps_url) return location.maps_url;

  if (location.latitude && location.longitude) {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  return "";
};

function ExactLocationCard({ title, location }) {
  const mapsUrl = getMapsUrl(location);

  return (
    <div className="transaction-location-exact-card">
      <div className="transaction-location-card-head">
        <span>{title}</span>
        <strong>{location.name || "Pengguna SaveByUp"}</strong>
      </div>

      <p>{location.location_label || location.address || "Lokasi belum tersedia."}</p>

      <div className="transaction-location-mini-grid">
        <div>
          <span>WhatsApp</span>
          <strong>{location.whatsapp || "-"}</strong>
        </div>

        <div>
          <span>Koordinat</span>
          <strong>
            {location.latitude && location.longitude
              ? `${location.latitude}, ${location.longitude}`
              : "-"}
          </strong>
        </div>
      </div>

      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer">
          <AppIcon name="location" />
          <span>Buka Maps</span>
        </a>
      )}
    </div>
  );
}

export default function TransactionLocationPanel({
  transaction,
  onConfirmLocation,
}) {
  const locationOpened = Boolean(transaction.exact_location_available);
  const isWaitingBuyerConfirmation =
    transaction.status === "waiting_buyer_confirmation";
  const isWaitingCod = transaction.status === "waiting_cod";

  return (
    <section
      className={`transaction-location-panel ${
        locationOpened ? "location-opened" : ""
      }`}
    >
      <div className="transaction-location-head">
        <div className="transaction-location-icon">
          <AppIcon name="location" />
        </div>

        <div>
          <span>Lokasi COD Privat</span>
          <h3>{getStatusLabel(transaction.status)}</h3>
          <p>
            Lokasi detail pembeli dan penjual hanya dibuka setelah pembeli
            mengonfirmasi bahwa transaksi akan dilanjutkan ke tahap COD.
          </p>
        </div>
      </div>

      <div className="transaction-location-status">
        <div>
          <span>Status Lokasi</span>
          <strong>
            {locationOpened ? "Lokasi detail sudah dibuka" : "Masih disembunyikan"}
          </strong>
        </div>

        <div>
          <span>Konfirmasi Lokasi</span>
          <strong>
            {transaction.location_confirmed_at
              ? formatDate(transaction.location_confirmed_at)
              : "-"}
          </strong>
        </div>
      </div>

      {!locationOpened && (
        <div className="transaction-location-privacy">
          <strong>Lokasi masih aman</strong>
          <p>
            Sebelum dikonfirmasi, sistem tidak menampilkan latitude, longitude,
            atau link maps detail dari kedua pihak.
          </p>

          {isWaitingBuyerConfirmation && (
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={onConfirmLocation}
            >
              Konfirmasi & Buka Lokasi COD
            </button>
          )}
        </div>
      )}

      {locationOpened && (
        <div className="transaction-location-exact-grid">
          <ExactLocationCard
            title="Lokasi Pembeli"
            location={transaction.buyer_location}
          />

          <ExactLocationCard
            title="Lokasi Penjual"
            location={transaction.seller_location}
          />
        </div>
      )}

      {isWaitingCod && locationOpened && (
        <div className="transaction-location-next-step">
          <strong>Langkah berikutnya</strong>
          <p>
            Silakan hubungi pihak terkait melalui WhatsApp, pilih titik temu
            yang paling nyaman, lalu tandai transaksi selesai setelah COD
            berhasil.
          </p>
        </div>
      )}
    </section>
  );
}