import AppIcon from "../../../components/ui/AppIcon";

import { buildWhatsappUrl } from "../../../services/marketplaceService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

import "../styles/incomingRequests.css";

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  const map = {
    menunggu: "pending",
    pending: "pending",
    disetujui: "accepted",
    accepted: "accepted",
    ditolak: "rejected",
    rejected: "rejected",
    dibatalkan: "cancelled",
    cancelled: "cancelled",
    selesai: "completed",
    completed: "completed",
  };

  return map[value] || "pending";
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status);

  const labels = {
    pending: "Menunggu",
    accepted: "Disetujui",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
    completed: "Selesai",
  };

  return labels[normalized] || "Menunggu";
}

export default function RequestCard({ request, onApprove, onReject }) {
  const normalizedStatus = normalizeStatus(request.status);

  const isPending = normalizedStatus === "pending";
  const isApproved = normalizedStatus === "accepted";

  const whatsappUrl = buildWhatsappUrl({
    phone: request.buyer_whatsapp,
    productName: request.product_name,
    buyerName: request.buyer_name,
    offerPrice: request.offer_price,
  });

  return (
    <article className="request-card">
      <div className="request-main">
        <div className="request-top">
          <span className={`request-status request-${normalizedStatus}`}>
            {getStatusLabel(request.status)}
          </span>

          <small>{formatDate(request.created_at)}</small>
        </div>

        <div className="request-title-row">
          <div className="request-title-icon">
            <AppIcon name="request" />
          </div>

          <div>
            <h3>{request.product_name || "Produk Marketplace"}</h3>
            <p>
              Pengajuan dari{" "}
              <strong>{request.buyer_name || "Calon Pembeli"}</strong>
            </p>
          </div>
        </div>

        <div className="request-grid">
          <div>
            <span>Jumlah</span>
            <strong>{request.quantity}</strong>
          </div>

          <div>
            <span>Harga Penawaran</span>
            <strong>{formatCurrency(request.offer_price)}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{getStatusLabel(request.status)}</strong>
          </div>
        </div>

        {request.note && (
          <div className="request-note">
            <AppIcon name="note" />
            <p>{request.note}</p>
          </div>
        )}

        {isApproved && request.buyer_whatsapp && (
          <a
            className="request-whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <AppIcon name="message" />
            <span>Hubungi via WhatsApp</span>
          </a>
        )}
      </div>

      <div className="request-actions">
        <button
          type="button"
          className="sb-btn sb-btn-primary"
          disabled={!isPending}
          onClick={onApprove}
        >
          <AppIcon name="check" />
          <span>Terima</span>
        </button>

        <button
          type="button"
          className="sb-btn request-btn-outline"
          disabled={!isPending}
          onClick={onReject}
        >
          <AppIcon name="close" />
          <span>Tolak</span>
        </button>
      </div>
    </article>
  );
}