import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

import { getFoodById } from "../../services/foodService";
import { createMarketplaceProduct } from "../../services/marketplaceService";

import { formatDate, getDaysLeftLabel } from "../../utils/formatDate";
import { canSellFood } from "../../utils/foodStatus";

import "./styles/sellProduct.css";

export default function SellProduct() {
  const { foodId } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);
  const [form, setForm] = useState({
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchFood = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getFoodById(foodId);

      setFood(data);
      setForm({
        price: "",
        description: data.note || "",
      });
    } catch (error) {
      console.error("Gagal mengambil makanan:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal mengambil data makanan dari inventaris."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [foodId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!food) return;

    if (!canSellFood(food)) {
      setMessage(
        "Makanan ini tidak memenuhi kriteria untuk ditawarkan ke marketplace."
      );
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setMessage("Harga awal wajib diisi dan harus lebih dari 0.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await createMarketplaceProduct(food.id, {
        price: Number(form.price),
        description: form.description,
      });

      setMessage("Produk berhasil ditambahkan ke marketplace.");

      setTimeout(() => {
        navigate("/marketplace");
      }, 800);
    } catch (error) {
      console.error("Gagal menambahkan produk marketplace:", error);
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan produk ke marketplace."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        label="Jual Makanan"
        title="Tawarkan Makanan ke Marketplace"
        description="Pastikan makanan masih layak konsumsi, belum melewati kedaluwarsa, dan informasi produk ditulis jelas."
        action={
          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={() => navigate("/dashboard")}
          >
            Kembali
          </button>
        }
      />

      {loading ? (
        <div className="sell-product-state sb-glass">
          <h3>Memuat makanan...</h3>
          <p>Sedang mengambil data makanan dari inventaris.</p>
        </div>
      ) : message && !food ? (
        <div className="sell-product-state sb-glass">
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
            <div className="sell-product-preview sb-glass">
              <div className="sell-product-image">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name} />
                ) : (
                  <span>🍱</span>
                )}
              </div>

              <div className="sell-product-info">
                <span>{food.category || "Tanpa Kategori"}</span>
                <h2>{food.name}</h2>

                <p>
                  Stok: {food.quantity} {food.unit}
                </p>

                <p>Kedaluwarsa: {formatDate(food.expiry_date)}</p>

                <strong>{getDaysLeftLabel(food.expiry_date)}</strong>

                {!canSellFood(food) && (
                  <div className="sell-warning">
                    Makanan ini tidak dapat dijual karena status atau tanggal
                    kedaluwarsanya tidak memenuhi syarat.
                  </div>
                )}
              </div>
            </div>

            <form className="sell-product-form sb-glass" onSubmit={handleSubmit}>
              {message && <div className="sell-message">{message}</div>}

              <label>Harga Awal</label>
              <input
                type="number"
                min="1"
                value={form.price}
                placeholder="Contoh: 8000"
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
                  <li>Makanan belum melewati tanggal kedaluwarsa.</li>
                  <li>Makanan masih layak konsumsi.</li>
                  <li>Data makanan berasal dari inventaris pengguna.</li>
                  <li>Penjual bertanggung jawab atas kondisi makanan.</li>
                  <li>Komunikasi lanjutan dilakukan setelah pengajuan disetujui.</li>
                </ul>
              </div>

              <button
                type="submit"
                className="sb-btn sb-btn-primary"
                disabled={saving || !canSellFood(food)}
              >
                {saving ? "Menyimpan..." : "Tawarkan ke Marketplace"}
              </button>
            </form>
          </section>
        )
      )}
    </AppShell>
  );
}