import { buildWhatsappUrl } from "../../../services/marketplaceService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

import "../styles/incomingRequests.css";

function getStatusLabel(status) {
  const labels = {
    menunggu: "Menunggu",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
  };

  return labels[status] || "Menunggu";
}

export default function RequestCard({ request, onApprove, onReject }) {
  const isPending = request.status === "menunggu";
  const isApproved = request.status === "disetujui";

  const whatsappUrl = buildWhatsappUrl({
    phone: request.buyer_whatsapp,
    productName: request.product_name,
    buyerName: request.buyer_name,
    offerPrice: request.offer_price,
  });

  return (
    <article className="request-card">
      <div className="request-main">
        <span className={`request-status request-${request.status}`}>
          {getStatusLabel(request.status)}
        </span>

        <h3>{request.product_name}</h3>

        <p>
          Pengajuan dari <strong>{request.buyer_name}</strong>
        </p>

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
            <span>Tanggal Pengajuan</span>
            <strong>{formatDate(request.created_at)}</strong>
          </div>
        </div>

        {request.note && <p className="request-note">{request.note}</p>}

        {isApproved && request.buyer_whatsapp && (
          <a
            className="request-whatsapp"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Hubungi pembeli via WhatsApp
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
          Terima
        </button>

        <button
          type="button"
          className="sb-btn marketplace-btn-outline"
          disabled={!isPending}
          onClick={onReject}
        >
          Tolak
        </button>
      </div>
    </article>
  );
}