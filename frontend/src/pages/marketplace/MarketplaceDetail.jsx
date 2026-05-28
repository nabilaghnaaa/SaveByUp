import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

import {
  canBuyProduct,
  cancelMarketplaceProduct,
  getMarketplaceProductById,
  isOwnProduct,
  updateMarketplaceProduct,
} from "../../services/marketplaceService";
import { getProfile } from "../../services/profileService";

import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, getDaysLeftLabel } from "../../utils/formatDate";

import NegotiationModal from "./components/NegotiationModal";

import "./styles/productDetail.css";

function getProductStatusLabel(status) {
  const labels = {
    tersedia: "Tersedia",
    dalam_proses: "Dalam Proses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    tidak_tersedia: "Tidak Tersedia",
  };

  return labels[status] || "Tersedia";
}

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [message, setMessage] = useState("");
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState({
    quantity: 1,
    price: "",
    description: "",
  });

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [productData, profileData] = await Promise.all([
        getMarketplaceProductById(id),
        getProfile(),
      ]);

      setProduct(productData);
      setProfile(profileData);

      setEditForm({
        quantity: productData.quantity || 1,
        price: productData.price || "",
        description: productData.description || "",
      });
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

  const currentUserId = profile?.id;
  const productIsMine = product ? isOwnProduct(product, currentUserId) : false;
  const productCanBeBought = product ? canBuyProduct(product, currentUserId) : false;

  const getDisabledReason = () => {
    if (!product) return "";

    if (productIsMine) {
      return "Produk ini adalah produk yang kamu jual sendiri, jadi kamu tidak bisa mengajukan pembelian.";
    }

    if (product.status !== "tersedia") {
      return "Produk ini sedang tidak tersedia untuk pengajuan baru.";
    }

    if (Number(product.quantity || 0) <= 0) {
      return "Stok produk sudah habis.";
    }

    return "";
  };

  const handleCancelSell = async () => {
    const confirmCancel = window.confirm(
      "Yakin ingin membatalkan produk ini dari marketplace?"
    );

    if (!confirmCancel) return;

    try {
      setMessage("");
      await cancelMarketplaceProduct(product.id);
      setMessage("Produk berhasil dibatalkan dari marketplace.");

      setTimeout(() => {
        navigate("/marketplace");
      }, 900);
    } catch (error) {
      console.error("Gagal membatalkan produk:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal membatalkan produk dari marketplace."
      );
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!productIsMine) {
      setMessage("Kamu tidak bisa mengedit produk milik orang lain.");
      return;
    }

    if (!editForm.quantity || Number(editForm.quantity) <= 0) {
      setMessage("Jumlah produk harus lebih dari 0.");
      return;
    }

    if (!editForm.price || Number(editForm.price) <= 0) {
      setMessage("Harga produk harus lebih dari 0.");
      return;
    }

    try {
      setSavingEdit(true);
      setMessage("");

      await updateMarketplaceProduct(product.id, {
        quantity: Number(editForm.quantity),
        price: Number(editForm.price),
        description: editForm.description,
      });

      setMessage("Produk marketplace berhasil diperbarui.");
      setEditMode(false);

      await fetchProduct();
    } catch (error) {
      console.error("Gagal update produk marketplace:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal memperbarui produk marketplace."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const disabledReason = getDisabledReason();

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
        ) : message && !product ? (
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

                  {productIsMine && (
                    <span className="product-detail-expiry">Produk Kamu</span>
                  )}
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
                      <strong>
                        {product.seller_name || "Penjual SaveByUp"}
                        {productIsMine ? " (Kamu)" : ""}
                      </strong>
                      <small>
                        Rating {product.seller_rating || 0}/5 •{" "}
                        {product.seller_address || "Area kos UMY"}
                      </small>
                    </div>
                  </div>

                  {message && <div className="product-detail-note">{message}</div>}

                  {productIsMine ? (
                    <div className="product-owner-actions">
                      <button
                        type="button"
                        className="sb-btn sb-btn-primary product-request-button"
                        disabled={product.status !== "tersedia"}
                        onClick={() => setEditMode((prev) => !prev)}
                      >
                        {editMode ? "Tutup Edit" : "Edit Produk Jual"}
                      </button>

                      <button
                        type="button"
                        className="sb-btn marketplace-btn-outline product-request-button"
                        disabled={product.status !== "tersedia"}
                        onClick={handleCancelSell}
                      >
                        Batal Jual
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="sb-btn sb-btn-primary product-request-button"
                        disabled={!productCanBeBought}
                        onClick={() => setShowNegotiation(true)}
                      >
                        {product.status !== "tersedia"
                          ? "Produk Tidak Tersedia"
                          : Number(product.quantity || 0) <= 0
                            ? "Stok Habis"
                            : "Ajukan Pembelian / Negosiasi"}
                      </button>

                      {disabledReason && (
                        <small className="product-detail-note">
                          {disabledReason}
                        </small>
                      )}
                    </>
                  )}

                  {productIsMine && editMode && (
                    <form className="negotiation-modal" onSubmit={handleSaveEdit}>
                      <div className="negotiation-header">
                        <div>
                          <span>Edit Produk Jual</span>
                          <h3>{product.name}</h3>
                        </div>
                      </div>

                      <label>Jumlah Dijual</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.quantity}
                        disabled={savingEdit}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            quantity: event.target.value,
                          }))
                        }
                      />

                      <label>Harga Jual</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.price}
                        disabled={savingEdit}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            price: event.target.value,
                          }))
                        }
                      />

                      <label>Deskripsi Produk</label>
                      <textarea
                        rows="4"
                        value={editForm.description}
                        disabled={savingEdit}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />

                      <div className="negotiation-actions">
                        <button
                          type="button"
                          className="sb-btn marketplace-btn-outline"
                          disabled={savingEdit}
                          onClick={() => setEditMode(false)}
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          className="sb-btn sb-btn-primary"
                          disabled={savingEdit}
                        >
                          {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              {showNegotiation && (
                <NegotiationModal
                  product={product}
                  currentUserId={currentUserId}
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