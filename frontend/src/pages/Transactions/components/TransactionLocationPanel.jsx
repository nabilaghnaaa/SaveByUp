import AppIcon from "../../../components/ui/AppIcon";

import "../styles/transactionLocationPanel.css";

const getMapsUrl = (location = {}) => {
  if (location.maps_url) return location.maps_url;

  if (location.latitude && location.longitude) {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  return "";
};

function ExactLocationCard({ title, location = {} }) {
  const mapsUrl = getMapsUrl(location);

  return (
    <article className="cod-location-card">
      <div className="cod-location-card-icon">
        <AppIcon name="location" />
      </div>

      <div className="cod-location-card-content">
        <span>{title}</span>
        <h4>{location.name || "Pengguna SaveByUp"}</h4>

        <p>
          {location.location_label ||
            location.address ||
            "Lokasi belum tersedia."}
        </p>

        <div className="cod-location-info-grid">
          <div>
            <small>WhatsApp</small>
            <strong>{location.whatsapp || "-"}</strong>
          </div>

          <div>
            <small>Koordinat</small>
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
            <span>Buka Google Maps</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function TransactionLocationPanel({ transaction, onClose }) {
  const bothShared = Boolean(transaction.both_location_shared);
  const waitingParty = transaction.waiting_location_party || "pihak lain";

  return (
    <div className="cod-location-backdrop" onClick={onClose}>
      <section
        className="cod-location-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="cod-location-close" onClick={onClose}>
          ×
        </button>

        <div className="cod-location-modal-head">
          <span>Detail Lokasi COD</span>

          <h3>
            {bothShared
              ? "Lokasi Pembeli & Penjual"
              : "Lokasi Belum Lengkap"}
          </h3>

          <p>
            {bothShared
              ? "Kedua pihak sudah membagikan lokasi COD. Silakan pilih titik temu yang paling nyaman."
              : `Lokasi belum dibagikan oleh ${waitingParty}. Hubungi pihak tersebut lewat WhatsApp agar lokasi COD bisa dibuka bersama.`}
          </p>
        </div>

        {bothShared ? (
          <div className="cod-location-grid">
            <ExactLocationCard
              title="Lokasi Pembeli"
              location={transaction.buyer_location}
            />

            <ExactLocationCard
              title="Lokasi Penjual"
              location={transaction.seller_location}
            />
          </div>
        ) : (
          <div className="cod-location-empty">
            <div className="cod-location-empty-icon">
              <AppIcon name="location" />
            </div>

            <h4>Lokasi belum dibagikan oleh {waitingParty}.</h4>

            <p>
              Lokasi detail baru akan muncul setelah pembeli dan penjual
              sama-sama menekan tombol <strong>Bagikan Lokasi COD</strong>.
            </p>

            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={onClose}
            >
              Mengerti
            </button>
          </div>
        )}
      </section>
    </div>
  );
}