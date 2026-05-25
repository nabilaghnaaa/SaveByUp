import { useState } from "react";

import { createPurchaseRequest } from "../../../services/marketplaceService";
import { formatCurrency } from "../../../utils/formatCurrency";

import "../styles/productDetail.css";

export default function NegotiationModal({ product, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [offerPrice, setOfferPrice] = useState(product.price);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Number(quantity) <= 0) {
      setMessage("Jumlah pembelian harus lebih dari 0.");
      return;
    }

    if (Number(quantity) > Number(product.quantity)) {
      setMessage("Jumlah pembelian melebihi stok tersedia.");
      return;
    }

    if (Number(offerPrice) <= 0) {
      setMessage("Harga penawaran harus lebih dari 0.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await createPurchaseRequest({
        productId: product.id,
        quantity: Number(quantity),
        offerPrice: Number(offerPrice),
        note,
      });

      setMessage("Pengajuan berhasil dikirim ke penjual.");

      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (error) {
      console.error("Gagal mengirim pengajuan:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Gagal mengirim pengajuan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="negotiation-backdrop">
      <form className="negotiation-modal" onSubmit={handleSubmit}>
        <div className="negotiation-header">
          <div>
            <span>Ajukan Pembelian</span>
            <h3>{product.name}</h3>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <p>
          Harga awal produk ini adalah{" "}
          <strong>{formatCurrency(product.price)}</strong>. Kamu dapat
          mengajukan pembelian atau menawar harga sesuai kesepakatan.
        </p>

        {message && <div className="negotiation-message">{message}</div>}

        <label>Jumlah Dibeli</label>
        <input
          type="number"
          min="1"
          max={product.quantity}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />

        <label>Harga Penawaran</label>
        <input
          type="number"
          min="1"
          value={offerPrice}
          onChange={(event) => setOfferPrice(event.target.value)}
        />

        <label>Catatan untuk Penjual</label>
        <textarea
          rows="4"
          value={note}
          placeholder="Contoh: Bisa COD di sekitar kampus UMY?"
          onChange={(event) => setNote(event.target.value)}
        />

        <div className="negotiation-actions">
          <button
            type="button"
            className="sb-btn marketplace-btn-outline"
            onClick={onClose}
          >
            Batal
          </button>

          <button
            type="submit"
            className="sb-btn sb-btn-primary"
            disabled={saving}
          >
            {saving ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </div>
      </form>
    </div>
  );
}