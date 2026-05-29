import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";
import AppIcon from "../../components/ui/AppIcon";

import { getFoodById } from "../../services/foodService";
import { createMarketplaceProduct } from "../../services/marketplaceService";
import {
  getMissingProfileFields,
  getProfile,
  isProfileComplete,
} from "../../services/profileService";

import { formatDate, getDaysLeftLabel } from "../../utils/formatDate";
import { canSellFood } from "../../utils/foodStatus";

import "./styles/sellProduct.css";

const FINISHED_STATUS = ["kedaluwarsa", "dibuang", "digunakan", "terjual"];

function getStatusLabel(status) {
  const labels = {
    aman: "Aman",
    mendekati_kedaluwarsa: "Mendekati Kedaluwarsa",
    kedaluwarsa: "Kedaluwarsa",
    dijual: "Sedang Dijual",
    terjual: "Terjual",
    digunakan: "Digunakan",
    dibuang: "Dibuang",
  };

  return labels[status] || "Aman";
}

function getSafeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function SellProduct() {
  const { foodId } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    quantity: 1,
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [profileWarning, setProfileWarning] = useState("");

  const unit = food?.unit || "pcs";

  const totalQuantity = getSafeNumber(food?.quantity, 0);

  const freeQuantity = getSafeNumber(
    food?.free_quantity ?? food?.available_quantity ?? food?.quantity,
    0
  );

  const marketplaceQuantity = getSafeNumber(
    food?.active_marketplace_quantity ?? food?.marketplace_quantity,
    Math.max(totalQuantity - freeQuantity, 0)
  );

  const quantityNumber = getSafeNumber(form.quantity, 0);
  const priceNumber = getSafeNumber(form.price, 0);
  const totalPrice = quantityNumber * priceNumber;

  const profileIsComplete = profile ? isProfileComplete(profile) : false;
  const foodIsFinished = food ? FINISHED_STATUS.includes(food.status) : false;

  const productCanBeSold = Boolean(
    food &&
      profileIsComplete &&
      canSellFood(food) &&
      !foodIsFinished &&
      freeQuantity > 0
  );

  const marketplacePercent = useMemo(() => {
    if (!totalQuantity) return 0;

    return Math.min(
      100,
      Math.round((marketplaceQuantity / totalQuantity) * 100)
    );
  }, [marketplaceQuantity, totalQuantity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");
      setProfileWarning("");

      const [foodData, profileData] = await Promise.all([
        getFoodById(foodId),
        getProfile(),
      ]);

      const initialFreeQuantity = getSafeNumber(
        foodData.free_quantity ??
          foodData.available_quantity ??
          foodData.quantity,
        0
      );

      setFood(foodData);
      setProfile(profileData);

      setForm({
        quantity: initialFreeQuantity > 0 ? 1 : 0,
        price: foodData.price || "",
        description: foodData.note || foodData.notes || "",
      });

      if (!isProfileComplete(profileData)) {
        const missingFields = getMissingProfileFields(profileData);

        setProfileWarning(
          `Lengkapi profil terlebih dahulu sebelum menjual produk. Data yang belum lengkap: ${missingFields.join(
            ", "
          )}.`
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data jual makanan:", error);

      setMessage(
        error.response?.data?.message ||
          "Gagal mengambil data makanan atau profil pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [foodId]);

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!food) {
      return "Data makanan tidak ditemukan.";
    }

    if (!profile || !isProfileComplete(profile)) {
      const missingFields = getMissingProfileFields(profile || {});

      setProfileWarning(
        `Lengkapi profil terlebih dahulu sebelum menjual produk. Data yang belum lengkap: ${missingFields.join(
          ", "
        )}.`
      );

      return "";
    }

    if (!canSellFood(food) || foodIsFinished) {
      return "Makanan ini tidak memenuhi kriteria untuk ditawarkan ke marketplace.";
    }

    if (freeQuantity <= 0) {
      return "Tidak ada stok bebas yang bisa ditawarkan. Semua stok sudah digunakan, habis, atau sedang aktif di marketplace.";
    }

    if (!form.quantity || quantityNumber <= 0) {
      return "Jumlah yang dijual wajib diisi dan harus lebih dari 0.";
    }

    if (quantityNumber > freeQuantity) {
      return `Jumlah yang dijual tidak boleh melebihi stok bebas. Stok bebas saat ini: ${freeQuantity} ${unit}.`;
    }

    if (!form.price || priceNumber <= 0) {
      return "Harga jual wajib diisi dan harus lebih dari 0.";
    }

    if (priceNumber < 500) {
      return "Harga jual terlalu kecil. Minimal isi harga Rp500 agar data harga tetap masuk akal.";
    }

    if (String(form.description || "").length > 500) {
      return "Deskripsi produk maksimal 500 karakter.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setProfileWarning("");

      const response = await createMarketplaceProduct(food.id, {
        quantity: quantityNumber,
        price: priceNumber,
        description: String(form.description || "").trim(),
      });

      const responseData = response.data || {};

      const successMessage =
        responseData.remaining_available_to_sell !== undefined
          ? `${
              response.message || "Produk berhasil ditambahkan ke marketplace."
            } Sisa stok yang masih bisa ditawarkan: ${
              responseData.remaining_available_to_sell
            } ${unit}.`
          : response.message || "Produk berhasil ditambahkan ke marketplace.";

      setMessage(successMessage);

      setTimeout(() => {
        navigate("/marketplace");
      }, 900);
    } catch (error) {
      console.error("Gagal menambahkan produk marketplace:", error);

      const errorCode = error.response?.data?.code;
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan produk ke marketplace.";

      if (errorCode === "PROFILE_INCOMPLETE") {
        setProfileWarning(errorMessage);
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="sell-product-wrapper">
        <div className="sell-product-orb sell-orb-one" />
        <div className="sell-product-orb sell-orb-two" />

        <PageHeader
          label="Jual Makanan"
          title="Tawarkan Makanan ke Marketplace"
          description="Atur stok bebas, harga jual, dan deskripsi produk agar makanan layak konsumsi bisa dimanfaatkan kembali."
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={() => navigate("/dashboard")}
            >
              Kembali
            </button>
          }
        />

        {loading ? (
          <section className="sell-product-state">
            <div className="sell-loader-icon">
              <AppIcon name="market" />
            </div>

            <h3>Memuat data jual makanan...</h3>
            <p>Sedang mengambil data makanan dan kelengkapan profil pengguna.</p>
          </section>
        ) : message && !food ? (
          <section className="sell-product-state">
            <div className="sell-loader-icon sell-loader-danger">
              <AppIcon name="warning" />
            </div>

            <h3>Data makanan tidak dapat ditampilkan</h3>
            <p>{message}</p>

            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Kembali ke Dashboard
            </button>
          </section>
        ) : (
          food && (
            <section className="sell-product-page">
              <aside className="sell-product-left">
                <article className="sell-preview-card">
                  <div className="sell-preview-image">
                    {food.image_url || food.image ? (
                      <img
                        src={food.image_url || food.image}
                        alt={food.name || "Foto makanan"}
                      />
                    ) : (
                      <div className="sell-preview-placeholder">
                        <AppIcon name="food" />
                      </div>
                    )}

                    <div className="sell-preview-overlay" />

                    <span className="sell-pill sell-pill-status">
                      {getStatusLabel(food.status)}
                    </span>

                    <span className="sell-pill sell-pill-expiry">
                      {getDaysLeftLabel(food.expiry_date)}
                    </span>
                  </div>

                  <div className="sell-preview-body">
                    <span className="sell-eyebrow">
                      {food.category || "Tanpa Kategori"}
                    </span>

                    <h2>{food.name || "Tanpa nama"}</h2>

                    <p>
                      {food.note ||
                        food.notes ||
                        "Belum ada catatan kondisi makanan."}
                    </p>

                    <div className="sell-market-progress">
                      <div className="sell-market-progress-head">
                        <span>Stok aktif marketplace</span>
                        <strong>{marketplacePercent}%</strong>
                      </div>

                      <div className="sell-market-progress-bar">
                        <span style={{ width: `${marketplacePercent}%` }} />
                      </div>
                    </div>
                  </div>
                </article>

                <article className="sell-profile-mini">
                  <div className="sell-profile-mini-icon">
                    <AppIcon name="user" />
                  </div>

                  <div>
                    <span>Profil Penjual</span>
                    <strong>{profile?.name || "Pengguna SaveByUp"}</strong>
                    <p>
                      {profileIsComplete
                        ? "Profil sudah lengkap dan siap transaksi."
                        : "Profil belum lengkap untuk mulai menjual."}
                    </p>
                  </div>
                </article>
              </aside>

              <section className="sell-product-right">
                <div className="sell-hero-box">
                  <div>
                    <span>Marketplace Setup</span>
                    <h3>Jual stok bebas tanpa merusak data inventaris.</h3>
                    <p>
                      Produk yang ditawarkan tidak langsung mengurangi stok
                      inventaris. Stok baru berkurang setelah transaksi selesai.
                    </p>
                  </div>

                  <div className="sell-hero-badge">
                    <AppIcon name="check" />
                    <span>Validasi aktif</span>
                  </div>
                </div>

                <div className="sell-stat-grid">
                  <div>
                    <AppIcon name="total" />
                    <span>Total Stok</span>
                    <strong>
                      {totalQuantity} {unit}
                    </strong>
                  </div>

                  <div>
                    <AppIcon name="stock" />
                    <span>Stok Bebas</span>
                    <strong>
                      {freeQuantity} {unit}
                    </strong>
                  </div>

                  <div>
                    <AppIcon name="market" />
                    <span>Aktif Dijual</span>
                    <strong>
                      {marketplaceQuantity} {unit}
                    </strong>
                  </div>

                  <div>
                    <AppIcon name="calendar" />
                    <span>Kedaluwarsa</span>
                    <strong>{formatDate(food.expiry_date)}</strong>
                  </div>
                </div>

                {profileWarning && (
                  <div className="sell-alert sell-alert-warning">
                    <AppIcon name="warning" />

                    <div>
                      <strong>Profil belum lengkap</strong>
                      <p>{profileWarning}</p>

                      <button
                        type="button"
                        className="sb-btn marketplace-btn-outline"
                        onClick={() => navigate("/profile")}
                      >
                        Lengkapi Profil
                      </button>
                    </div>
                  </div>
                )}

                {!productCanBeSold && !profileWarning && (
                  <div className="sell-alert sell-alert-warning">
                    <AppIcon name="warning" />

                    <div>
                      <strong>Produk belum bisa dijual</strong>
                      <p>
                        Pastikan makanan belum kedaluwarsa, belum berstatus
                        selesai, dan masih memiliki stok bebas.
                      </p>
                    </div>
                  </div>
                )}

                {message && <div className="sell-message">{message}</div>}

                <form className="sell-product-form" onSubmit={handleSubmit}>
                  <div className="sell-form-grid">
                    <div className="sell-form-group">
                      <label>Jumlah yang Dijual</label>

                      <div className="sell-input-with-icon">
                        <span className="sell-input-icon">
                          <AppIcon name="stock" />
                        </span>

                        <input
                          type="number"
                          min="1"
                          max={freeQuantity}
                          value={form.quantity}
                          placeholder="Contoh: 2"
                          disabled={
                            !profileIsComplete ||
                            saving ||
                            !canSellFood(food) ||
                            freeQuantity <= 0
                          }
                          onChange={(event) =>
                            updateForm("quantity", event.target.value)
                          }
                        />
                      </div>

                      <small>
                        Maksimal stok bebas yang bisa ditawarkan: {freeQuantity}{" "}
                        {unit}.
                      </small>
                    </div>

                    <div className="sell-form-group">
                      <label>Harga Jual per {unit}</label>

                      <div className="sell-input-with-icon">
                        <span className="sell-input-icon">
                          <AppIcon name="market" />
                        </span>

                        <input
                          type="number"
                          min="500"
                          value={form.price}
                          placeholder="Contoh: 8000"
                          disabled={
                            !profileIsComplete ||
                            saving ||
                            !canSellFood(food) ||
                            freeQuantity <= 0
                          }
                          onChange={(event) =>
                            updateForm("price", event.target.value)
                          }
                        />
                      </div>

                      <small>
                        Estimasi total: Rp
                        {totalPrice.toLocaleString("id-ID")}
                      </small>
                    </div>

                    <div className="sell-form-group sell-form-full">
                      <label>Deskripsi Produk</label>

                      <textarea
                        rows="5"
                        value={form.description}
                        maxLength="500"
                        disabled={
                          !profileIsComplete ||
                          saving ||
                          !canSellFood(food) ||
                          freeQuantity <= 0
                        }
                        placeholder="Contoh: Masih tersegel, disimpan di rak atas, COD sekitar kampus UMY."
                        onChange={(event) =>
                          updateForm("description", event.target.value)
                        }
                      />

                      <small>
                        {String(form.description || "").length}/500 karakter.
                        Tulis kondisi makanan secara jujur.
                      </small>
                    </div>
                  </div>

                  <div className="sell-rules-panel">
                    <div>
                      <AppIcon name="check" />
                      <span>Profil penjual wajib lengkap.</span>
                    </div>

                    <div>
                      <AppIcon name="check" />
                      <span>Jumlah jual hanya mengambil stok bebas.</span>
                    </div>

                    <div>
                      <AppIcon name="check" />
                      <span>Produk yang sama akan ditambahkan stoknya.</span>
                    </div>

                    <div>
                      <AppIcon name="check" />
                      <span>
                        Stok inventaris berkurang setelah transaksi selesai.
                      </span>
                    </div>
                  </div>

                  <div className="sell-submit-row">
                    <button
                      type="button"
                      className="sb-btn marketplace-btn-outline"
                      disabled={saving}
                      onClick={() => navigate("/dashboard")}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="sb-btn sb-btn-primary sell-submit-button"
                      disabled={saving || !productCanBeSold}
                    >
                      {saving ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <AppIcon name="market" />
                          Tawarkan ke Marketplace
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </section>
          )
        )}
      </main>
    </AppShell>
  );
}