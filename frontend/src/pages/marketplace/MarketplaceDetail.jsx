import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import AppIcon from "../../components/ui/AppIcon";

import {
  canBuyProduct,
  cancelMarketplaceProduct,
  getMarketplaceProductById,
  getProductPrice,
  isOwnProduct,
  updateMarketplaceProduct,
} from "../../services/marketplaceService";
import { getProfile } from "../../services/profileService";

import NegotiationModal from "./components/NegotiationModal";
import MarketplaceProductAside from "./components/MarketplaceProductAside";
import MarketplaceProductSummary from "./components/MarketplaceProductSummary";
import MarketplaceOwnerPanel from "./components/MarketplaceOwnerPanel";
import MarketplaceBuyerPanel from "./components/MarketplaceBuyerPanel";
import MarketplaceEditProductForm from "./components/MarketplaceEditProductForm";

import {
  getStatusProgress,
  toNumber,
} from "./utils/marketplaceDetailUtils";

import "./styles/productDetail.css";

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

      const price = getProductPrice(productData);

      setProduct(productData);
      setProfile(profileData);

      setEditForm({
        quantity: productData.quantity || 1,
        price: price || "",
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
  const productPrice = product ? getProductPrice(product) : 0;
  const editQuantity = toNumber(editForm.quantity);
  const editPrice = toNumber(editForm.price);
  const editTotal = editQuantity * editPrice;

  const statusProgress = useMemo(() => {
    return getStatusProgress(product?.status);
  }, [product?.status]);

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

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelSell = async () => {
    const confirmCancel = window.confirm(
      "Yakin ingin membatalkan produk ini dari marketplace?"
    );

    if (!confirmCancel || !product) return;

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
              : "Periksa kondisi, stok, tanggal kedaluwarsa, jarak penjual, dan profil penjual sebelum mengajukan pembelian."
          }
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
                <MarketplaceProductAside
                  product={product}
                  productIsMine={productIsMine}
                />

                <section className="product-detail-content">
                  <MarketplaceProductSummary
                    product={product}
                    productIsMine={productIsMine}
                    productPrice={productPrice}
                    statusProgress={statusProgress}
                  />

                  {message && (
                    <div className="product-detail-message">{message}</div>
                  )}

                  {productIsMine ? (
                    <MarketplaceOwnerPanel
                      product={product}
                      editMode={editMode}
                      onToggleEdit={() => setEditMode((prev) => !prev)}
                      onCancelSell={handleCancelSell}
                    />
                  ) : (
                    <MarketplaceBuyerPanel
                      product={product}
                      productQuantity={productQuantity}
                      productCanBeBought={productCanBeBought}
                      disabledReason={disabledReason}
                      onOpenNegotiation={() => setShowNegotiation(true)}
                    />
                  )}

                  {productIsMine && editMode && (
                    <MarketplaceEditProductForm
                      product={product}
                      editForm={editForm}
                      editTotal={editTotal}
                      savingEdit={savingEdit}
                      onChange={handleEditChange}
                      onClose={() => setEditMode(false)}
                      onSubmit={handleSaveEdit}
                    />
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