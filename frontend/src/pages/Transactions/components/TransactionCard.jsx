import { buildWhatsappUrl } from "../../../services/marketplaceService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/formatDate";

import "../styles/transactions.css";

function getTransactionStatusLabel(status) {
  const labels = {
    menunggu_komunikasi: "Menunggu Komunikasi",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };

  return labels[status] || "Menunggu Komunikasi";
}

function getStatusIcon(status) {
  const icons = {
    menunggu_komunikasi: "💬",
    selesai: "✅",
    dibatalkan: "✕",
  };

  return icons[status] || "💬";
}

export default function TransactionCard({
  transaction,
  onShareLocation,
  onViewLocation,
  onComplete,
  onRate,
}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id || user.id_user || user.user_id;

  const isBuyer = String(transaction.buyer_id) === String(userId);
  const isSeller = String(transaction.seller_id) === String(userId);

  const contactName = isBuyer
    ? transaction.seller_name
    : transaction.buyer_name;

  const contactPhone = isBuyer
    ? transaction.seller_whatsapp
    : transaction.buyer_whatsapp;

  const whatsappUrl = buildWhatsappUrl({
    phone: contactPhone,
    productName: transaction.product_name,
    buyerName: transaction.buyer_name,
    offerPrice: transaction.final_price,
  });

  const canManageLocation =
    transaction.status !== "selesai" && transaction.status !== "dibatalkan";

  const canComplete = transaction.status !== "selesai";
  const canRate =
    transaction.status === "selesai" && isBuyer && !transaction.rating;

  const currentUserHasShared = Boolean(
    transaction.current_user_has_shared_location
  );

  const shareButtonLabel = currentUserHasShared
    ? "Lokasi Sudah Dibagikan"
    : "Bagikan Lokasi COD";

  return (
    <article className={`transaction-card transaction-${transaction.status}`}>
      <div className="transaction-image">
        {transaction.product_image ? (
          <img src={transaction.product_image} alt={transaction.product_name} />
        ) : (
          <span>🍱</span>
        )}

        <div className="transaction-image-overlay" />

        <span className={`transaction-status status-${transaction.status}`}>
          {getStatusIcon(transaction.status)}{" "}
          {getTransactionStatusLabel(transaction.status)}
        </span>
      </div>

      <div className="transaction-content">
        <div className="transaction-topline">
          <span className="transaction-role">
            {isBuyer
              ? "Sebagai Pembeli"
              : isSeller
                ? "Sebagai Penjual"
                : "Transaksi"}
          </span>

          {transaction.rating && (
            <span className="transaction-rating-badge">
              Rating {transaction.rating}/5
            </span>
          )}
        </div>

        <h3>{transaction.product_name || "Produk Marketplace"}</h3>

        <p>
          {isBuyer ? "Penjual" : "Pembeli"}:{" "}
          <strong>{contactName || "Pengguna SaveByUp"}</strong>
        </p>

        <div className="transaction-grid">
          <div>
            <span>Jumlah</span>
            <strong>{transaction.quantity}</strong>
          </div>

          <div>
            <span>Total Harga</span>
            <strong>{formatCurrency(transaction.final_price)}</strong>
          </div>

          <div>
            <span>Tanggal</span>
            <strong>{formatDate(transaction.created_at)}</strong>
          </div>
        </div>

        {transaction.completed_at && (
          <div className="transaction-completed">
            Selesai pada {formatDate(transaction.completed_at)}
          </div>
        )}

        {transaction.review && (
          <p className="transaction-review">“{transaction.review}”</p>
        )}
      </div>

      <div className="transaction-actions">
        {contactPhone && (
          <a
            className="sb-btn sb-btn-primary"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        )}

        {canManageLocation && (
          <>
            <button
              type="button"
              className="sb-btn transaction-btn-outline"
              disabled={currentUserHasShared}
              onClick={onShareLocation}
            >
              {shareButtonLabel}
            </button>

            <button
              type="button"
              className="sb-btn transaction-btn-outline"
              onClick={onViewLocation}
            >
              Lihat Lokasi Penjual / Pembeli
            </button>
          </>
        )}

        {canComplete && (
          <button
            type="button"
            className="sb-btn transaction-btn-outline"
            onClick={onComplete}
          >
            Tandai Selesai
          </button>
        )}

        {canRate && (
          <button
            type="button"
            className="sb-btn transaction-btn-outline"
            onClick={onRate}
          >
            Beri Rating
          </button>
        )}
      </div>
    </article>
  );
}