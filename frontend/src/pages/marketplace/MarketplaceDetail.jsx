import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

import { getMarketplaceProductById } from "../../services/marketplaceService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, getDaysLeftLabel } from "../../utils/formatDate";

import NegotiationModal from "./components/NegotiationModal";

import "./styles/productDetail.css";

function getProductStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dalam_proses: "Dalam Proses",
    selesai: "Selesai",
    tidak_tersedia: "Tidak Tersedia",
  };

  return labels[status] || "Tersedia";
}

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showNegotiation, setShowNegotiation] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getMarketplaceProductById(id);
      setProduct(data);
    } catch (error) {
      console.error("Gagal mengambil detail produk:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengambil detail produk."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return (
    <AppShell>
      <main className="product-detail-wrapper">
        <div className="product-detail-orb detail-orb-one" />
        <div className="product-detail-orb detail-orb-two" />

        <PageHeader
          label="Detail Produk"
          title={product?.name || "Detail Produk Marketplace"}
          description="Periksa kondisi, stok, tanggal kedaluwarsa, harga, dan profil penjual sebelum mengajukan pembelian."
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={() => navigate("/marketplace")}
            >
              Kembali
            </button>
          }
        />

        {loading ? (
          <div className="product-detail-loading">
            <div className="marketplace-loader" />
            <h3>Memuat detail produk...</h3>
            <p>Sedang mengambil informasi produk marketplace.</p>
          </div>
        ) : message ? (
          <div className="product-detail-loading">
            <h3>Produk tidak dapat ditampilkan</h3>
            <p>{message}</p>
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => navigate("/marketplace")}
            >
              Kembali ke Marketplace
            </button>
          </div>
        ) : (
          product && (
            <>
              <section className="product-detail-page">
                <div className="product-detail-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-detail-placeholder">🍱</div>
                  )}

                  <div className="product-detail-image-overlay" />

                  <span className={`product-detail-status status-${product.status}`}>
                    {getProductStatusLabel(product.status)}
                  </span>
                </div>

                <div className="product-detail-content">
                  <div className="product-detail-topline">
                    <span className="product-detail-category">
                      {product.category || "Tanpa Kategori"}
                    </span>

                    <span className="product-detail-expiry">
                      {getDaysLeftLabel(product.expiry_date)}
                    </span>
                  </div>

                  <h2>{product.name}</h2>

                  <strong className="product-detail-price">
                    {formatCurrency(product.price)}
                  </strong>

                  <p className="product-detail-description">
                    {product.description ||
                      "Produk belum memiliki deskripsi tambahan dari penjual."}
                  </p>

                  <div className="product-detail-grid">
                    <div>
                      <span>Stok Tersedia</span>
                      <strong>
                        {product.quantity} {product.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Sisa Waktu</span>
                      <strong>{getDaysLeftLabel(product.expiry_date)}</strong>
                    </div>

                    <div>
                      <span>Tanggal Kedaluwarsa</span>
                      <strong>{formatDate(product.expiry_date)}</strong>
                    </div>

                    <div>
                      <span>Status Produk</span>
                      <strong>{getProductStatusLabel(product.status)}</strong>
                    </div>
                  </div>

                  <div className="seller-panel">
                    <div className="seller-avatar">
                      {product.seller_name?.charAt(0)?.toUpperCase() || "S"}
                    </div>

                    <div>
                      <span>Penjual</span>
                      <strong>{product.seller_name || "Penjual SaveByUp"}</strong>
                      <small>
                        Rating {product.seller_rating || 0}/5 •{" "}
                        {product.seller_address || "Area kos UMY"}
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sb-btn sb-btn-primary product-request-button"
                    disabled={product.status !== "tersedia"}
                    onClick={() => setShowNegotiation(true)}
                  >
                    Ajukan Pembelian / Negosiasi
                  </button>

                  {product.status !== "tersedia" && (
                    <small className="product-detail-note">
                      Produk ini sedang tidak tersedia untuk pengajuan baru.
                    </small>
                  )}
                </div>
              </section>

              {showNegotiation && (
                <NegotiationModal
                  product={product}
                  onClose={() => setShowNegotiation(false)}
                  onSuccess={fetchProduct}
                />
              )}
            </>
          )
        )}
      </main>
    </AppShell>
  );
}