import { useNavigate } from "react-router-dom";

import AppIcon from "../../../components/ui/AppIcon";

import { getProductPrice } from "../../../services/marketplaceService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getDistanceLabel,
  getDistanceTone,
} from "../utils/marketplaceDetailUtils";

import "../styles/productCard.css";

function getStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dalam_proses: "Dalam Proses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    tidak_tersedia: "Tidak Tersedia",
  };

  return labels[status] || "Tersedia";
}

export default function ProductCard({ product, currentUserId }) {
  const navigate = useNavigate();

  const isMine = Number(product.seller_id) === Number(currentUserId);
  const price = getProductPrice(product);
  const distanceTone = getDistanceTone(product.distance_km);

  return (
    <article className={`product-card ${isMine ? "product-card-own" : ""}`}>
      <div className="product-card-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <AppIcon name="food" size={64} />
          </div>
        )}

        <div className="product-card-overlay" />

        <span className={`product-status product-${product.status}`}>
          {getStatusLabel(product.status)}
        </span>

        <span className="product-expiry-badge">
          {getDaysLeftLabel(product.expiry_date)}
        </span>

        {isMine && <span className="product-own-badge">Produk Kamu</span>}
      </div>

      <div className="product-card-body">
        <div className="product-card-head">
          <div>
            <span>{product.category || "Tanpa kategori"}</span>
            <h3>{product.name}</h3>
          </div>

          <strong>{formatCurrency(price)}</strong>
        </div>

        <div className="product-info-grid">
          <div>
            <span>Stok</span>
            <strong>
              {product.quantity} {product.unit}
            </strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{formatDate(product.expiry_date)}</strong>
          </div>
        </div>

        {!isMine && (
          <div className={`product-distance distance-${distanceTone}`}>
            <span>
              <AppIcon name="location" size={20} />
            </span>

            <div>
              <strong>{getDistanceLabel(product.distance_km)}</strong>
              <small>
                Titik lokasi detail disembunyikan sampai transaksi disetujui.
              </small>
            </div>
          </div>
        )}

        <div className="product-seller">
          <div className="seller-mini-avatar">
            <AppIcon name="user" size={21} />
          </div>

          <div>
            <span>Penjual</span>
            <strong>
              {product.seller_name || "Penjual SaveByUp"}
              {isMine ? " (Kamu)" : ""}
            </strong>
            <small>
              {product.seller_location_label ||
                product.seller_address ||
                "Area COD belum diisi"}
            </small>
          </div>
        </div>

        <button
          type="button"
          className="sb-btn sb-btn-primary product-detail-btn"
          onClick={() => navigate(`/marketplace/${product.id}`)}
        >
          {isMine ? "Kelola Produk" : "Lihat Detail"}
        </button>
      </div>
    </article>
  );
}