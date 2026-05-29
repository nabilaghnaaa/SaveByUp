import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../../components/ui/EmptyState";
import FoodCard from "../../Foods/components/FoodCard";

import InventoryActionMenu from "./InventoryActionMenu";
import InventoryStockModal from "./InventoryStockModal";

import {
  deleteFood,
  getFoods,
  updateFoodStatus,
} from "../../../services/foodService";

import "../styles/dashboard-action-modal.css";

const emptyMenuModal = {
  open: false,
  food: null,
};

const emptyActionModal = {
  open: false,
  food: null,
  status: "",
  quantity: "",
  title: "",
  description: "",
  buttonLabel: "",
};

export default function DashboardInventory({ refreshKey, onInventoryChange }) {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [priorityFilter, setPriorityFilter] = useState("semua");

  const [menuModal, setMenuModal] = useState(emptyMenuModal);
  const [actionModal, setActionModal] = useState(emptyActionModal);

  const fetchFoods = async () => {
    try {
      setLoading(true);

      const data = await getFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil inventaris:", error);

      setMessage(
        error.response?.data?.message ||
          "Gagal mengambil data inventaris makanan."
      );
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3200);
  };

  const refreshAll = async () => {
    await fetchFoods();

    if (onInventoryChange) {
      onInventoryChange();
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [refreshKey]);

  const openMenuModal = (food) => {
    setMessage("");
    setActionModal(emptyActionModal);

    setMenuModal({
      open: true,
      food,
    });
  };

  const closeMenuModal = () => {
    setMenuModal(emptyMenuModal);
  };

  const openActionModal = (food, status) => {
    const isUsed = status === "digunakan";

    closeMenuModal();
    setMessage("");

    setActionModal({
      open: true,
      food,
      status,
      quantity: "",
      title: isUsed ? "Gunakan Stok Makanan" : "Buang Stok Makanan",
      description: isUsed
        ? `Masukkan jumlah ${food.name} yang sudah kamu gunakan. Sistem hanya mengurangi stok bebas, bukan stok yang sedang dijual.`
        : `Masukkan jumlah ${food.name} yang ingin kamu buang. Sistem hanya mengurangi stok bebas, bukan stok yang sedang dijual.`,
      buttonLabel: isUsed ? "Simpan Digunakan" : "Simpan Dibuang",
    });
  };

  const closeActionModal = () => {
    setActionModal(emptyActionModal);
  };

  const handleActionQuantityChange = (value) => {
    setActionModal((prev) => ({
      ...prev,
      quantity: value,
    }));
  };

  const handleDelete = async (food) => {
    closeMenuModal();

    const ok = window.confirm(`Hapus data makanan "${food.name}"?`);

    if (!ok) return;

    try {
      await deleteFood(food.id);
      showMessage("Data makanan berhasil dihapus.");
      await refreshAll();
    } catch (error) {
      console.error("Gagal menghapus makanan:", error);

      showMessage(
        error.response?.data?.message || "Gagal menghapus data makanan."
      );
    }
  };

  const handleSubmitActionModal = async (event) => {
    event.preventDefault();

    const { food, status, quantity } = actionModal;

    if (!food) return;

    const parsedQuantity = Number(quantity);
    const actionLabel = status === "digunakan" ? "digunakan" : "dibuang";
    const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);

    if (!quantity || parsedQuantity <= 0) {
      showMessage(
        `Jumlah makanan yang ${actionLabel} wajib diisi dan harus lebih dari 0.`
      );
      return;
    }

    if (parsedQuantity > freeQuantity) {
      showMessage(
        `Jumlah yang ${actionLabel} tidak boleh melebihi stok bebas. Stok bebas saat ini: ${freeQuantity} ${
          food.unit || "pcs"
        }.`
      );
      return;
    }

    try {
      await updateFoodStatus(food, status, parsedQuantity);

      showMessage(
        status === "digunakan"
          ? `${parsedQuantity} ${food.unit || "pcs"} ${food.name} berhasil ditandai digunakan.`
          : `${parsedQuantity} ${food.unit || "pcs"} ${food.name} berhasil ditandai dibuang.`
      );

      closeActionModal();
      await refreshAll();
    } catch (error) {
      console.error("Gagal mengubah status makanan:", error);

      showMessage(
        error.response?.data?.message || "Gagal mengubah status makanan."
      );
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

      const matchStatus =
        statusFilter === "semua" || food.status === statusFilter;

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
          <h2>Stok makanan yang kamu simpan</h2>
          <p>
            Kelola makanan berdasarkan stok total, stok bebas, stok marketplace,
            tanggal kedaluwarsa, dan status pemanfaatannya.
          </p>
        </div>

        <div className="inventory-actions">
          <button
            type="button"
            className="sb-btn dashboard-btn-outline"
            onClick={fetchFoods}
          >
            Refresh
          </button>

          <button
            type="button"
            className="sb-btn sb-btn-primary"
            onClick={() => navigate("/foods/add")}
          >
            Tambah Makanan
          </button>
        </div>
      </div>

      <div className="inventory-toolbar">
        <input
          type="text"
          value={search}
          placeholder="Cari nama makanan, kategori, atau satuan..."
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="semua">Semua Status</option>
          <option value="aman">Aman</option>
          <option value="mendekati_kedaluwarsa">
            Mendekati Kedaluwarsa
          </option>
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
        <div className="inventory-state">
          <div className="inventory-loader" />
          <h3>Memuat inventaris...</h3>
          <p>Sedang mengambil data makanan yang tersimpan.</p>
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="Belum ada makanan tercatat"
          description="Tambahkan makanan pertama agar SaveByUp bisa memantau stok dan tanggal kedaluwarsa."
          action={
            <button
              type="button"
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
              type="button"
              className="sb-btn dashboard-btn-outline"
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
              onAction={() => openMenuModal(food)}
            />
          ))}
        </div>
      )}

      {menuModal.open && menuModal.food && (
        <InventoryActionMenu
          food={menuModal.food}
          onClose={closeMenuModal}
          onDelete={handleDelete}
          onOpenStockAction={openActionModal}
        />
      )}

      {actionModal.open && actionModal.food && (
        <InventoryStockModal
          modal={actionModal}
          onClose={closeActionModal}
          onQuantityChange={handleActionQuantityChange}
          onSubmit={handleSubmitActionModal}
        />
      )}
    </section>
  );
}