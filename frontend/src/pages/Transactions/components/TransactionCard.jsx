import { Link } from "react-router-dom";

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

  const contactUserId = isBuyer
    ? transaction.seller_id
    : transaction.buyer_id;

  const contactRole = isBuyer ? "Penjual" : "Pembeli";
  const reviewTargetLabel = isBuyer ? "Penjual" : "Pembeli";

  const whatsappUrl = buildWhatsappUrl({
    phone: contactPhone,
    productName: transaction.product_name,
    buyerName: transaction.buyer_name,
    offerPrice: transaction.final_price,
  });

  const isWaiting = transaction.status === "menunggu_komunikasi";
  const isCompleted = transaction.status === "selesai";
  const isCancelled = transaction.status === "dibatalkan";

  const canManageLocation = isWaiting;
  const canComplete = isWaiting;
  const canRate = isCompleted && !transaction.current_user_has_reviewed;

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

          {transaction.current_user_has_reviewed && (
            <span className="transaction-rating-badge">
              Ulasanmu {transaction.current_user_review_rating}/5
            </span>
          )}

          {transaction.other_user_has_reviewed && (
            <span className="transaction-rating-badge">
              Lawan transaksi sudah mengulas
            </span>
          )}
        </div>

        <h3>{transaction.product_name || "Produk Marketplace"}</h3>

        <p>
          {contactRole}:{" "}
          {contactUserId ? (
            <Link
              to={`/profile/${contactUserId}`}
              className="transaction-profile-link"
            >
              {contactName || "Pengguna SaveByUp"}
            </Link>
          ) : (
            <strong>{contactName || "Pengguna SaveByUp"}</strong>
          )}
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

        {transaction.current_user_has_reviewed && (
          <p className="transaction-review">
            Ulasanmu untuk {reviewTargetLabel}: “
            {transaction.current_user_review_text ||
              "Kamu tidak menulis ulasan."}
            ”
          </p>
        )}

        {isCompleted && transaction.current_user_has_reviewed && (
          <div className="transaction-completed">
            Kamu sudah memberi ulasan untuk {reviewTargetLabel.toLowerCase()}.
          </div>
        )}

        {isCancelled && (
          <div className="transaction-completed">
            Transaksi dibatalkan dan tidak dapat diproses lagi.
          </div>
        )}
      </div>

      <div className="transaction-actions">
        {contactPhone && !isCancelled && (
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
            Selesaikan & Ulas {reviewTargetLabel}
          </button>
        )}

        {canRate && (
          <button
            type="button"
            className="sb-btn transaction-btn-outline"
            onClick={onRate}
          >
            Ulas {reviewTargetLabel}
          </button>
        )}

        {isCompleted && transaction.current_user_has_reviewed && (
          <button
            type="button"
            className="sb-btn transaction-btn-outline"
            disabled
          >
            Sudah Mengulas
          </button>
        )}
      </div>
    </article>
  );
}