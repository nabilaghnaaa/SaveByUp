import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../../components/ui/EmptyState";
import FoodCard from "../../Foods/components/FoodCard";
import {
  deleteFood,
  getFoods,
  updateFoodStatus,
} from "../../../services/foodService";

export default function DashboardInventory({ refreshKey, onInventoryChange }) {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [priorityFilter, setPriorityFilter] = useState("semua");

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await getFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data makanan:", error);
      setMessage("Gagal mengambil data inventaris makanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [refreshKey]);

  const refreshAll = async () => {
    await fetchFoods();

    if (onInventoryChange) {
      onInventoryChange();
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleDelete = async (food) => {
    const ok = window.confirm(`Hapus data makanan "${food.name}"?`);
    if (!ok) return;

    try {
      await deleteFood(food.id);
      showMessage("Data makanan berhasil dihapus.");
      await refreshAll();
    } catch (error) {
      console.error("Gagal menghapus makanan:", error);
      showMessage(error.response?.data?.message || "Gagal menghapus makanan.");
    }
  };

  const handleUpdateStatus = async (food, status, successMessage) => {
    try {
      await updateFoodStatus(food, status);
      showMessage(successMessage);
      await refreshAll();
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      showMessage(error.response?.data?.message || "Gagal mengubah status makanan.");
    }
  };

  const filteredFoods = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return foods.filter((food) => {
      const matchSearch =
        !keyword ||
        food.name?.toLowerCase().includes(keyword) ||
        food.category?.toLowerCase().includes(keyword) ||
        food.unit?.toLowerCase().includes(keyword);

      const matchStatus = statusFilter === "semua" || food.status === statusFilter;
      const matchPriority =
        priorityFilter === "semua" || food.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [foods, search, statusFilter, priorityFilter]);

  return (
    <section className="inventory-section" id="dashboard-inventory">
      <div className="inventory-header">
        <div className="section-heading">
          <span>Inventaris Makanan</span>
          <h2>Daftar stok makanan kamu</h2>
          <p>
            Pantau jumlah stok, tanggal kedaluwarsa, status makanan, dan pilih
            makanan yang layak untuk ditawarkan ke marketplace.
          </p>
        </div>

        <div className="inventory-actions">
          <button className="sb-btn sb-btn-ghost" onClick={fetchFoods}>
            Refresh
          </button>

          <button
            className="sb-btn sb-btn-primary"
            onClick={() => navigate("/foods/add")}
          >
            Tambah Makanan
          </button>
        </div>
      </div>

      <div className="inventory-toolbar sb-glass">
        <input
          type="text"
          value={search}
          placeholder="Cari makanan, kategori, atau satuan..."
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="semua">Semua Status</option>
          <option value="aman">Aman</option>
          <option value="mendekati_kedaluwarsa">Mendekati Kedaluwarsa</option>
          <option value="kedaluwarsa">Kedaluwarsa</option>
          <option value="dijual">Dijual</option>
          <option value="terjual">Terjual</option>
          <option value="digunakan">Digunakan</option>
          <option value="dibuang">Dibuang</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="semua">Semua Prioritas</option>
          <option value="tinggi">Prioritas Tinggi</option>
          <option value="sedang">Prioritas Sedang</option>
          <option value="rendah">Prioritas Rendah</option>
          <option value="tidak_layak">Tidak Layak</option>
        </select>
      </div>

      {message && <div className="inventory-message">{message}</div>}

      {loading ? (
        <div className="inventory-state sb-glass">
          <h3>Memuat inventaris...</h3>
          <p>Sedang mengambil data makanan yang tersimpan.</p>
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="Belum ada makanan tercatat"
          description="Tambahkan makanan pertama agar SaveByUp bisa memantau stok dan tanggal kedaluwarsa."
          action={
            <button
              className="sb-btn sb-btn-primary"
              onClick={() => navigate("/foods/add")}
            >
              Tambah Makanan Pertama
            </button>
          }
        />
      ) : filteredFoods.length === 0 ? (
        <EmptyState
          title="Makanan tidak ditemukan"
          description="Coba ubah kata kunci pencarian atau reset filter."
          action={
            <button
              className="sb-btn sb-btn-ghost"
              onClick={() => {
                setSearch("");
                setStatusFilter("semua");
                setPriorityFilter("semua");
              }}
            >
              Reset Filter
            </button>
          }
        />
      ) : (
        <div className="food-grid">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onEdit={() => navigate(`/foods/edit/${food.id}`)}
              onDelete={() => handleDelete(food)}
              onUsed={() =>
                handleUpdateStatus(
                  food,
                  "digunakan",
                  "Makanan ditandai sudah digunakan."
                )
              }
              onDiscard={() =>
                handleUpdateStatus(food, "dibuang", "Makanan ditandai dibuang.")
              }
              onSell={() => navigate(`/marketplace/sell/${food.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}