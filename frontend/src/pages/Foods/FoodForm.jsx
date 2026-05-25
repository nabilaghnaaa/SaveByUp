import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

import {
  createFood,
  getFoodById,
  updateFood,
} from "../../services/foodService";

import { getAutoStatus } from "../../utils/foodStatus";

import FoodFormFields from "./components/FoodFormFields";
import FoodImageUpload from "./components/FoodImageUpload";
import FoodStatusPreview from "./components/FoodStatusPreview";

import "./styles/foodForm.css";

const initialForm = {
  name: "",
  category: "Snack",
  quantity: 1,
  unit: "pcs",
  expiry_date: "",
  note: "",
  image_url: "",
  status: "aman",
};

export default function FoodForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const autoStatus = useMemo(() => {
    return getAutoStatus(form.expiry_date, form.status);
  }, [form.expiry_date, form.status]);

  useEffect(() => {
    const fetchFood = async () => {
      if (!isEdit) return;

      try {
        setLoading(true);
        setMessage("");

        const data = await getFoodById(id);

        setForm({
          name: data.name || "",
          category: data.category || "Snack",
          quantity: data.quantity || 1,
          unit: data.unit || "pcs",
          expiry_date: data.expiry_date
            ? String(data.expiry_date).slice(0, 10)
            : "",
          note: data.note || "",
          image_url: data.image_url || "",
          status: data.status || "aman",
        });
      } catch (error) {
        console.error("Gagal mengambil detail makanan:", error);
        setMessage(
          error.response?.data?.message || "Gagal mengambil detail makanan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id, isEdit]);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Nama makanan wajib diisi.";
    if (!form.category.trim()) return "Kategori makanan wajib dipilih.";

    if (!form.quantity || Number(form.quantity) <= 0) {
      return "Jumlah stok harus lebih dari 0.";
    }

    if (!form.unit.trim()) return "Satuan wajib dipilih.";
    if (!form.expiry_date) return "Tanggal kedaluwarsa wajib diisi.";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      status: getAutoStatus(form.expiry_date, form.status),
    };

    try {
      setSaving(true);
      setMessage("");

      if (isEdit) {
        await updateFood(id, payload);
        setMessage("Data makanan berhasil diperbarui.");
      } else {
        await createFood(payload);
        setMessage("Data makanan berhasil ditambahkan.");
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error("Gagal menyimpan makanan:", error);
      setMessage(
        error.response?.data?.message || "Gagal menyimpan data makanan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="food-form-wrapper">
        <div className="food-form-orb food-orb-one" />
        <div className="food-form-orb food-orb-two" />

        <PageHeader
          label={isEdit ? "Edit Inventaris" : "Tambah Inventaris"}
          title={isEdit ? "Edit Data Makanan" : "Tambah Data Makanan"}
          description="Catat makanan secara rapi agar stok, tanggal kedaluwarsa, dan prioritas konsumsi bisa dipantau sebelum makanan terbuang."
          action={
            <button
              type="button"
              className="sb-btn food-btn-outline"
              onClick={() => navigate("/dashboard")}
            >
              Kembali
            </button>
          }
        />

        {loading ? (
          <section className="food-form-loading">
            <div className="food-form-loader" />
            <h3>Memuat data makanan...</h3>
            <p>Sedang mengambil detail makanan dari inventaris.</p>
          </section>
        ) : (
          <form className="food-form-page" onSubmit={handleSubmit}>
            <div className="food-form-main">
              <div className="food-form-title">
                <span>Food Inventory Form</span>
                <h2>{isEdit ? "Perbarui informasi makanan" : "Isi data makanan"}</h2>
                <p>
                  Data yang lengkap membantu sistem menentukan makanan mana yang
                  aman, mendekati kedaluwarsa, atau layak ditawarkan ke
                  marketplace.
                </p>
              </div>

              {message && <div className="food-form-message">{message}</div>}

              <FoodFormFields form={form} onChange={handleChange} />

              <div className="food-form-actions">
                <button
                  type="button"
                  className="sb-btn food-btn-outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="sb-btn sb-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : isEdit
                      ? "Simpan Perubahan"
                      : "Tambah Makanan"}
                </button>
              </div>
            </div>

            <aside className="food-form-side">
              <FoodImageUpload form={form} onChange={handleChange} />

              <FoodStatusPreview
                expiryDate={form.expiry_date}
                autoStatus={autoStatus}
                currentStatus={form.status}
              />
            </aside>
          </form>
        )}
      </main>
    </AppShell>
  );
}