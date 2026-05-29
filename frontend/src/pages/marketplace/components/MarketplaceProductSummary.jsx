import AppIcon from "../../../components/ui/AppIcon";

import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate, getDaysLeftLabel } from "../../../utils/formatDate";

import {
  getDistanceLabel,
  getDistanceTone,
  getProductStatusLabel,
} from "../utils/marketplaceDetailUtils";

export default function MarketplaceProductSummary({
  product,
  productIsMine,
  productPrice,
  statusProgress,
}) {
  const distanceTone = getDistanceTone(product.distance_km);

  return (
    <>
      <div className="product-detail-hero">
        <div>
          <span>{productIsMine ? "Product Management" : "Marketplace Item"}</span>

          <h2>{product.name || "Produk Marketplace"}</h2>

          <p>
            {product.description ||
              "Produk belum memiliki deskripsi tambahan dari penjual."}
          </p>
        </div>

        <strong>{formatCurrency(productPrice)}</strong>
      </div>

      <div className="product-status-strip">
        <div className="product-status-strip-head">
          <span>Status Produk</span>
          <strong>{getProductStatusLabel(product.status)}</strong>
        </div>

        <div className="product-status-progress">
          <span style={{ width: `${statusProgress}%` }} />
        </div>
      </div>

      <div className="product-detail-grid">
        <div>
          <AppIcon name="stock" />
          <span>Stok Tersedia</span>
          <strong>
            {product.quantity} {product.unit}
          </strong>
        </div>

        <div>
          <AppIcon name="clock" />
          <span>Sisa Waktu</span>
          <strong>{getDaysLeftLabel(product.expiry_date)}</strong>
        </div>

        <div>
          <AppIcon name="calendar" />
          <span>Tanggal Kedaluwarsa</span>
          <strong>{formatDate(product.expiry_date)}</strong>
        </div>

        <div>
          <AppIcon name="price" />
          <span>Harga Satuan</span>
          <strong>{formatCurrency(productPrice)}</strong>
        </div>

        {!productIsMine && (
          <div className={`product-distance-summary distance-${distanceTone}`}>
            <AppIcon name="location" />
            <span>Jarak Penjual</span>
            <strong>{getDistanceLabel(product.distance_km)}</strong>
            <small>GPS detail disembunyikan sampai transaksi disetujui.</small>
          </div>
        )}
      </div>
    </>
  );
}