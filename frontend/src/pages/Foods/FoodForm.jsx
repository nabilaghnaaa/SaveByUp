import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import { createFood, getFoodById, updateFood } from "../../services/foodService";

import FoodFormFields from "./components/FoodFormFields";
import FoodImageUpload from "./components/FoodImageUpload";
import FoodStatusPreview from "./components/FoodStatusPreview";

import "./styles/foodForm.css";
import "./styles/foodFormFields.css";
import "./styles/foodImageUpload.css";
import "./styles/foodStatusPreview.css";

const initialForm = {
  name: "",
  category: "Snack",
  quantity: 1,
  unit: "pcs",
  expiry_date: "",
  status: "aman",
  note: "",
  image_url: "",
};

export default function FoodForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchFood = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getFoodById(id);

      setForm({
        name: data.name || "",
        category: data.category || "Snack",
        quantity: data.quantity || 1,
        unit: data.unit || "pcs",
        expiry_date: data.expiry_date ? String(data.expiry_date).slice(0, 10) : "",
        status: data.status || "aman",
        note: data.note || data.notes || "",
        image_url: data.image_url || data.image || "",
      });
    } catch (error) {
      console.error("Gagal mengambil data makanan:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengambil data makanan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchFood();
    }
  }, [id]);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Nama makanan wajib diisi.";

    if (!form.quantity || Number(form.quantity) <= 0) {
      return "Jumlah stok harus lebih dari 0.";
    }

    if (!form.unit) return "Satuan wajib dipilih.";

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

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        ...form,
        quantity: Number(form.quantity),
      };

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
      <main className="food-form-page">
        {loading ? (
          <section className="food-form-state">
            <div className="food-form-loader" />
            <h3>Memuat data makanan...</h3>
            <p>Sedang mengambil detail makanan dari inventaris.</p>
          </section>
        ) : (
          <form className="food-form-card" onSubmit={handleSubmit}>
            <div className="food-form-heading">
              <span>Food Inventory Form</span>
              <h1>{isEdit ? "Edit data makanan" : "Isi data makanan"}</h1>
              <p>
                Data yang lengkap membantu sistem menentukan makanan mana yang
                aman, mendekati kedaluwarsa, atau layak ditawarkan ke
                marketplace.
              </p>
            </div>

            {message && <div className="food-form-message">{message}</div>}

            <FoodImageUpload form={form} onChange={handleChange} />

            <FoodFormFields form={form} onChange={handleChange} />

            <div className="food-note-box">
              <label>Keterangan</label>
              <textarea
                rows="5"
                value={form.note}
                placeholder="Contoh: masih tersegel, simpan di kulkas, dibeli kemarin, atau cocok untuk dijual murah..."
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </div>

            <FoodStatusPreview form={form} />

            <div className="food-form-actions">
              <button
                type="button"
                className="sb-btn food-btn-outline"
                onClick={() => navigate("/dashboard")}
                disabled={saving}
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
          </form>
        )}
      </main>
    </AppShell>
  );
}