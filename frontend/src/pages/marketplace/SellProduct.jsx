import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

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

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");
      setProfileWarning("");

      const [foodData, profileData] = await Promise.all([
        getFoodById(foodId),
        getProfile(),
      ]);

      setFood(foodData);
      setProfile(profileData);

      setForm({
        quantity: 1,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!food) return;

    if (!profile || !isProfileComplete(profile)) {
      const missingFields = getMissingProfileFields(profile || {});

      setProfileWarning(
        `Lengkapi profil terlebih dahulu sebelum menjual produk. Data yang belum lengkap: ${missingFields.join(
          ", "
        )}.`
      );
      return;
    }

    if (!canSellFood(food)) {
      setMessage(
        "Makanan ini tidak memenuhi kriteria untuk ditawarkan ke marketplace."
      );
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setMessage("Jumlah yang dijual wajib diisi dan harus lebih dari 0.");
      return;
    }

    if (Number(form.quantity) > Number(food.quantity)) {
      setMessage("Jumlah yang dijual tidak boleh melebihi stok inventaris.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setMessage("Harga awal wajib diisi dan harus lebih dari 0.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setProfileWarning("");

      const response = await createMarketplaceProduct(food.id, {
        quantity: Number(form.quantity),
        price: Number(form.price),
        description: form.description,
      });

      const responseData = response.data || {};

      const successMessage =
        responseData.remaining_available_to_sell !== undefined
          ? `${response.message} Sisa stok yang masih bisa ditawarkan: ${responseData.remaining_available_to_sell} ${
              food.unit || "pcs"
            }.`
          : response.message || "Produk berhasil ditambahkan ke marketplace.";

      setMessage(successMessage);

      setTimeout(() => {
        navigate("/marketplace");
      }, 1000);
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

  const profileIsComplete = profile ? isProfileComplete(profile) : false;

  return (
    <AppShell>
      <main className="sell-product-wrapper">
        <div className="sell-product-orb sell-orb-one" />
        <div className="sell-product-orb sell-orb-two" />

        <PageHeader
          label="Jual Makanan"
          title="Tawarkan Makanan ke Marketplace"
          description="Pastikan makanan masih layak konsumsi, belum melewati kedaluwarsa, dan informasi produk ditulis jelas sebelum ditawarkan."
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
          <div className="sell-product-state">
            <div className="marketplace-loader" />
            <h3>Memuat makanan...</h3>
            <p>Sedang mengambil data makanan dan profil pengguna.</p>
          </div>
        ) : message && !food ? (
          <div className="sell-product-state">
            <h3>Data makanan tidak dapat ditampilkan</h3>
            <p>{message}</p>
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          food && (
            <section className="sell-product-page">
              <div className="sell-product-preview">
                <div className="sell-product-image">
                  {food.image_url ? (
                    <img src={food.image_url} alt={food.name} />
                  ) : (
                    <span>🍱</span>
                  )}

                  <div className="sell-product-image-overlay" />
                </div>

                <div className="sell-product-info">
                  <span>{food.category || "Tanpa Kategori"}</span>
                  <h2>{food.name}</h2>

                  <p>
                    Stok inventaris: {food.quantity} {food.unit}
                  </p>

                  <p>
                    Harga inventaris: Rp
                    {Number(food.price || 0).toLocaleString("id-ID")}
                  </p>

                  <p>Kedaluwarsa: {formatDate(food.expiry_date)}</p>

                  <strong>{getDaysLeftLabel(food.expiry_date)}</strong>

                  {!canSellFood(food) && (
                    <div className="sell-warning">
                      Makanan ini tidak dapat dijual karena status atau tanggal
                      kedaluwarsanya tidak memenuhi syarat.
                    </div>
                  )}

                  {profileWarning && (
                    <div className="sell-warning">
                      {profileWarning}
                      <br />
                      <button
                        type="button"
                        className="sb-btn marketplace-btn-outline"
                        onClick={() => navigate("/profile")}
                      >
                        Lengkapi Profil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <form className="sell-product-form" onSubmit={handleSubmit}>
                <div className="sell-form-heading">
                  <span>Marketplace Form</span>
                  <h3>Atur jumlah, harga, dan deskripsi</h3>
                  <p>
                    Kalau produk yang sama sudah ada di marketplace, jumlah yang
                    kamu input akan ditambahkan ke stok marketplace, bukan
                    membuat data baru.
                  </p>
                </div>

                {message && <div className="sell-message">{message}</div>}

                <label>Jumlah yang Dijual</label>
                <input
                  type="number"
                  min="1"
                  max={food.quantity}
                  value={form.quantity}
                  placeholder="Contoh: 2"
                  disabled={!profileIsComplete || saving}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                />

                <small>
                  Stok inventaris: {food.quantity} {food.unit}. Kalau sebagian
                  sudah ada di marketplace, backend otomatis menghitung sisa stok
                  yang masih boleh ditawarkan.
                </small>

                <label>Harga Jual per {food.unit || "pcs"}</label>
                <input
                  type="number"
                  min="1"
                  value={form.price}
                  placeholder="Contoh: 8000"
                  disabled={!profileIsComplete || saving}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                />

                <label>Deskripsi Produk</label>
                <textarea
                  rows="5"
                  value={form.description}
                  disabled={!profileIsComplete || saving}
                  placeholder="Jelaskan kondisi makanan, masih tersegel/tidak, lokasi COD, dan informasi penting lainnya."
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />

                <div className="sell-rules">
                  <strong>Kriteria marketplace:</strong>
                  <ul>
                    <li>Profil penjual wajib lengkap.</li>
                    <li>Makanan belum melewati tanggal kedaluwarsa.</li>
                    <li>Makanan masih layak konsumsi.</li>
                    <li>Data makanan berasal dari inventaris pengguna.</li>
                    <li>Jumlah yang dijual tidak boleh melebihi stok inventaris.</li>
                    <li>
                      Kalau makanan yang sama sudah tersedia di marketplace,
                      stok marketplace akan ditambahkan.
                    </li>
                    <li>
                      Stok inventaris baru berkurang ketika transaksi selesai,
                      bukan saat produk ditawarkan.
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="sb-btn sb-btn-primary"
                  disabled={saving || !canSellFood(food) || !profileIsComplete}
                >
                  {saving ? "Menyimpan..." : "Tawarkan ke Marketplace"}
                </button>
              </form>
            </section>
          )
        )}
      </main>
    </AppShell>
  );
}