import { useState } from "react";

import "../styles/transactions.css";

export default function RatingModal({ transaction, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");

  const isCompleteMode = transaction?.mode === "complete";
  const isBuyer = transaction?.current_user_role === "buyer";
  const targetLabel = isBuyer ? "penjual" : "pembeli";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      setMessage("Rating harus bernilai 1 sampai 5.");
      return;
    }

    onSubmit({
      rating: Number(rating),
      review: String(review || "").trim(),
    });
  };

  return (
    <div className="rating-backdrop">
      <form className="rating-modal" onSubmit={handleSubmit}>
        <div className="rating-header">
          <div>
            <span>
              {isCompleteMode
                ? "Selesaikan Transaksi"
                : "Rating Transaksi"}
            </span>

            <h3>{transaction.product_name || "Produk Marketplace"}</h3>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <p>
          {isCompleteMode
            ? `Berikan rating dan ulasan untuk ${targetLabel}. Setelah dikirim, transaksi akan otomatis ditandai selesai.`
            : `Berikan rating dan ulasan untuk ${targetLabel} agar reputasi pengguna di SaveByUp lebih jelas.`}
        </p>

        {message && <div className="rating-message">{message}</div>}

        <label>Rating</label>
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          <option value="5">5 - Sangat Baik</option>
          <option value="4">4 - Baik</option>
          <option value="3">3 - Cukup</option>
          <option value="2">2 - Kurang</option>
          <option value="1">1 - Buruk</option>
        </select>

        <label>Ulasan</label>
        <textarea
          rows="4"
          value={review}
          placeholder={`Tulis ulasan untuk ${targetLabel}...`}
          onChange={(event) => setReview(event.target.value)}
        />

        <div className="rating-actions">
          <button
            type="button"
            className="sb-btn transaction-btn-outline"
            onClick={onClose}
          >
            Batal
          </button>

          <button type="submit" className="sb-btn sb-btn-primary">
            {isCompleteMode
              ? "Kirim Ulasan & Selesaikan"
              : "Kirim Ulasan"}
          </button>
        </div>
      </form>
    </div>
  );
}