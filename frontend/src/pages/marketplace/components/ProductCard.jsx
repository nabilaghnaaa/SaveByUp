import { useNavigate } from "react-router-dom";

import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import "../styles/productCard.css";

function getStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dalam_proses: "Dalam Proses",
    selesai: "Selesai",
    tidak_tersedia: "Tidak Tersedia",
  };

  return labels[status] || "Tersedia";
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-card-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-placeholder">🍱</div>
        )}

        <span className={`product-status product-${product.status}`}>
          {getStatusLabel(product.status)}
        </span>
      </div>

      <div className="product-card-body">
        <div className="product-card-head">
          <div>
            <h3>{product.name}</h3>
            <p>{product.category || "Tanpa kategori"}</p>
          </div>

          <strong>{formatCurrency(product.price)}</strong>
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
            <strong>{getDaysLeftLabel(product.expiry_date)}</strong>
          </div>
        </div>

        <div className="product-seller">
          <span>Penjual</span>
          <strong>{product.seller_name || "Penjual SaveByUp"}</strong>
          <small>{product.seller_address || "Area kos UMY"}</small>
        </div>

        <div className="product-expiry">
          Tanggal kedaluwarsa: {formatDate(product.expiry_date)}
        </div>

        <button
          type="button"
          className="sb-btn sb-btn-primary product-detail-btn"
          onClick={() => navigate(`/marketplace/${product.id}`)}
        >
          Lihat Detail
        </button>
      </div>
    </article>
  );
}