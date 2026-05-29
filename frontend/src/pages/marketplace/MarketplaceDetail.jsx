import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import AppIcon from "../../components/ui/AppIcon";

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

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

  const productQuantity = toNumber(product?.quantity);
  const productPrice = toNumber(product?.price);
  const editQuantity = toNumber(editForm.quantity);
  const editPrice = toNumber(editForm.price);
  const editTotal = editQuantity * editPrice;

  const statusProgress = useMemo(() => {
    if (!product) return 0;

    if (product.status === "tersedia") return 100;
    if (product.status === "dalam_proses") return 62;
    if (product.status === "selesai") return 100;
    if (product.status === "dibatalkan") return 100;

    return 35;
  }, [product]);

  const getDisabledReason = () => {
    if (!product) return "";

    if (productIsMine) {
      return "Produk ini adalah produk yang kamu jual sendiri, jadi kamu tidak bisa mengajukan pembelian.";
    }

    if (product.status !== "tersedia") {
      return "Produk ini sedang tidak tersedia untuk pengajuan baru.";
    }

    if (productQuantity <= 0) {
      return "Stok produk sudah habis.";
    }

    return "";
  };

  const validateEditForm = () => {
    if (!productIsMine) {
      return "Kamu tidak bisa mengedit produk milik orang lain.";
    }

    if (product?.status !== "tersedia") {
      return "Produk hanya bisa diedit ketika statusnya masih tersedia.";
    }

    if (!editForm.quantity || editQuantity <= 0) {
      return "Jumlah produk harus lebih dari 0.";
    }

    if (!editForm.price || editPrice <= 0) {
      return "Harga produk harus lebih dari 0.";
    }

    if (String(editForm.description || "").length > 500) {
      return "Deskripsi produk maksimal 500 karakter.";
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

    const validationMessage = validateEditForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setSavingEdit(true);
      setMessage("");

      await updateMarketplaceProduct(product.id, {
        quantity: editQuantity,
        price: editPrice,
        description: String(editForm.description || "").trim(),
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
          label={productIsMine ? "Kelola Produk" : "Detail Produk"}
          title={product?.name || "Detail Produk Marketplace"}
          description={
            productIsMine
              ? "Kelola produk yang kamu tawarkan, ubah jumlah jual, perbarui harga, atau batalkan dari marketplace."
              : "Periksa kondisi, stok, tanggal kedaluwarsa, harga, dan profil penjual sebelum mengajukan pembelian."
          }
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={() => navigate("/marketplace")}
            >
              <AppIcon name="back" />
              Kembali
            </button>
          }
        />

        {loading ? (
          <section className="product-detail-loading">
            <div className="product-loader-icon">
              <AppIcon name="marketplace" size={31} />
            </div>

            <h3>Memuat detail produk...</h3>
            <p>Sedang mengambil informasi produk marketplace.</p>
          </section>
        ) : message && !product ? (
          <section className="product-detail-loading">
            <div className="product-loader-icon product-loader-danger">
              <AppIcon name="warning" size={31} />
            </div>

            <h3>Produk tidak dapat ditampilkan</h3>
            <p>{message}</p>

            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => navigate("/marketplace")}
            >
              Kembali ke Marketplace
            </button>
          </section>
        ) : (
          product && (
            <>
              <section className="product-detail-page">
                <aside className="product-detail-left">
                  <article className="product-image-card">
                    <div className="product-detail-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="product-detail-placeholder">
                          <AppIcon name="food" size={72} />
                        </div>
                      )}

                      <div className="product-detail-image-overlay" />

                      <span className={`product-detail-status status-${product.status}`}>
                        {getProductStatusLabel(product.status)}
                      </span>

                      {productIsMine && (
                        <span className="product-owner-badge">
                          Produk Kamu
                        </span>
                      )}
                    </div>

                    <div className="product-image-info">
                      <div>
                        <span>{product.category || "Tanpa Kategori"}</span>
                        <strong>{getDaysLeftLabel(product.expiry_date)}</strong>
                      </div>

                      <p>
                        Kedaluwarsa pada {formatDate(product.expiry_date)}.
                      </p>
                    </div>
                  </article>

                  <article className="seller-panel">
                    <div className="seller-avatar">
                      <AppIcon name="user" size={26} />
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
                  </article>
                </aside>

                <section className="product-detail-content">
                  <div className="product-detail-hero">
                    <div>
                      <span>
                        {productIsMine
                          ? "Product Management"
                          : "Marketplace Item"}
                      </span>

                      <h2>{product.name}</h2>

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
                  </div>

                  {message && <div className="product-detail-message">{message}</div>}

                  {productIsMine ? (
                    <section className="product-owner-panel">
                      <div className="product-owner-panel-head">
                        <div>
                          <span>Kelola Produk Kamu</span>
                          <h3>Atur penjualan tanpa pindah halaman.</h3>
                        </div>

                        <div className="product-owner-panel-icon">
                          <AppIcon name="shield" size={26} />
                        </div>
                      </div>

                      <div className="product-owner-actions">
                        <button
                          type="button"
                          className="product-action-card primary"
                          disabled={product.status !== "tersedia"}
                          onClick={() => setEditMode((prev) => !prev)}
                        >
                          <span>
                            <AppIcon name="edit" />
                          </span>

                          <div>
                            <strong>
                              {editMode ? "Tutup Edit Produk" : "Edit Produk Jual"}
                            </strong>
                            <small>Ubah jumlah, harga, dan deskripsi produk.</small>
                          </div>
                        </button>

                        <button
                          type="button"
                          className="product-action-card danger"
                          disabled={product.status !== "tersedia"}
                          onClick={handleCancelSell}
                        >
                          <span>
                            <AppIcon name="delete" />
                          </span>

                          <div>
                            <strong>Batal Jual</strong>
                            <small>Hapus produk dari daftar marketplace aktif.</small>
                          </div>
                        </button>
                      </div>

                      {product.status !== "tersedia" && (
                        <small className="product-detail-note">
                          Produk tidak bisa diedit atau dibatalkan karena statusnya
                          bukan tersedia.
                        </small>
                      )}
                    </section>
                  ) : (
                    <section className="buyer-panel">
                      <div>
                        <span>Ajukan Pembelian</span>
                        <h3>Minat dengan produk ini?</h3>
                        <p>
                          Kamu bisa mengajukan pembelian atau menawar harga sesuai
                          kesepakatan dengan penjual.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="sb-btn sb-btn-primary product-request-button"
                        disabled={!productCanBeBought}
                        onClick={() => setShowNegotiation(true)}
                      >
                        <AppIcon name="request" />
                        {product.status !== "tersedia"
                          ? "Produk Tidak Tersedia"
                          : productQuantity <= 0
                            ? "Stok Habis"
                            : "Ajukan Pembelian / Negosiasi"}
                      </button>

                      {disabledReason && (
                        <small className="product-detail-note">
                          {disabledReason}
                        </small>
                      )}
                    </section>
                  )}

                  {productIsMine && editMode && (
                    <form className="product-edit-panel" onSubmit={handleSaveEdit}>
                      <div className="product-edit-header">
                        <div>
                          <span>Edit Produk Jual</span>
                          <h3>{product.name}</h3>
                        </div>

                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => setEditMode(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="product-edit-grid">
                        <div className="product-edit-group">
                          <label>Jumlah Dijual</label>

                          <div className="product-input-with-icon">
                            <span>
                              <AppIcon name="stock" />
                            </span>

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
                          </div>
                        </div>

                        <div className="product-edit-group">
                          <label>Harga Jual</label>

                          <div className="product-input-with-icon">
                            <span>
                              <AppIcon name="price" />
                            </span>

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
                          </div>

                          <small>
                            Estimasi total: Rp{editTotal.toLocaleString("id-ID")}
                          </small>
                        </div>

                        <div className="product-edit-group product-edit-full">
                          <label>Deskripsi Produk</label>

                          <textarea
                            rows="5"
                            maxLength="500"
                            value={editForm.description}
                            disabled={savingEdit}
                            placeholder="Contoh: Masih tersegel, disimpan di rak atas, COD sekitar kampus UMY."
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                          />

                          <small>
                            {String(editForm.description || "").length}/500 karakter
                          </small>
                        </div>
                      </div>

                      <div className="product-edit-actions">
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
                </section>
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