import AppIcon from "../../../components/ui/AppIcon";

import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getDistanceLabel,
  getDistanceTone,
  getProductStatusLabel,
} from "../utils/marketplaceDetailUtils";

export default function MarketplaceProductAside({ product, productIsMine }) {
  const imageSource = product.image_url || product.image || "";
  const distanceTone = getDistanceTone(product.distance_km);

  return (
    <aside className="product-detail-left">
      <article className="product-image-card">
        <div className="product-detail-image">
          {imageSource ? (
            <img src={imageSource} alt={product.name || "Produk marketplace"} />
          ) : (
            <div className="product-detail-placeholder">
              <AppIcon name="food" size={78} />
            </div>
          )}

          <div className="product-detail-image-overlay" />

          <span className={`product-detail-status status-${product.status}`}>
            {getProductStatusLabel(product.status)}
          </span>

          {productIsMine && (
            <span className="product-owner-badge">Produk Kamu</span>
          )}
        </div>

        <div className="product-image-info">
          <div>
            <span>{product.category || "Tanpa Kategori"}</span>
            <strong>{getDaysLeftLabel(product.expiry_date)}</strong>
          </div>

          <p>Kedaluwarsa pada {formatDate(product.expiry_date)}.</p>
        </div>
      </article>

      <article className="seller-panel">
        <div className="seller-avatar">
          <AppIcon name="user" size={25} />
        </div>

        <div>
          <span>Penjual</span>
          <strong>
            {product.seller_name || "Penjual SaveByUp"}
            {productIsMine ? " (Kamu)" : ""}
          </strong>

          <small>
            Rating {product.seller_rating || 0}/5 •{" "}
            {product.seller_location_label ||
              product.seller_address ||
              "Area COD belum diisi"}
          </small>
        </div>
      </article>

      {!productIsMine && (
        <article
          className={`seller-panel product-location-safe-card distance-${distanceTone}`}
        >
          <div className="seller-avatar">
            <AppIcon name="location" size={24} />
          </div>

          <div>
            <span>Jarak Perkiraan</span>
            <strong>{getDistanceLabel(product.distance_km)}</strong>
            <small>
              Titik GPS detail baru dibuka setelah pengajuan disetujui dan
              transaksi dikonfirmasi.
            </small>
          </div>
        </article>
      )}
    </aside>
  );
}