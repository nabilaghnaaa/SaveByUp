import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../../components/ui/EmptyState";
import FoodCard from "../../Foods/components/FoodCard";
import "../styles/dashboard-action-modal.css";

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

  const [menuModal, setMenuModal] = useState({
    open: false,
    food: null,
  });

  const [actionModal, setActionModal] = useState({
    open: false,
    food: null,
    status: "",
    quantity: "",
    title: "",
    description: "",
    buttonLabel: "",
  });

  const fetchFoods = async () => {
    try {
      setLoading(true);

      const data = await getFoods();
      setFoods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil inventaris:", error);
      setMessage("Gagal mengambil data inventaris makanan.");
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
    setMenuModal({
      open: true,
      food,
    });
  };

  const closeMenuModal = () => {
    setMenuModal({
      open: false,
      food: null,
    });
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

  const openActionModal = (food, status) => {
    const isUsed = status === "digunakan";
    const freeQuantity = Number(food.free_quantity ?? food.quantity ?? 0);

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
      maxQuantity: freeQuantity,
    });
  };

  const closeActionModal = () => {
    setActionModal({
      open: false,
      food: null,
      status: "",
      quantity: "",
      title: "",
      description: "",
      buttonLabel: "",
      maxQuantity: 0,
    });
  };

  const handleActionQuantityChange = (value) => {
    setActionModal((prev) => ({
      ...prev,
      quantity: value,
    }));
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
        <div className="inventory-modal-backdrop" onClick={closeMenuModal}>
          <div
            className="inventory-action-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div>
                <span>Aksi Makanan</span>
                <h3>{menuModal.food.name}</h3>
              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={closeMenuModal}
              >
                ×
              </button>
            </div>

            <div className="inventory-modal-food">
              <div className="inventory-modal-food-icon">
                {menuModal.food.image_url ? (
                  <img src={menuModal.food.image_url} alt={menuModal.food.name} />
                ) : (
                  <span>🍱</span>
                )}
              </div>

              <div>
                <strong>{menuModal.food.name}</strong>
                <small>
                  Total: {menuModal.food.quantity} {menuModal.food.unit || "pcs"}{" "}
                  • Bebas: {menuModal.food.free_quantity}{" "}
                  {menuModal.food.unit || "pcs"} • Dijual:{" "}
                  {menuModal.food.active_marketplace_quantity}{" "}
                  {menuModal.food.unit || "pcs"}
                </small>
              </div>
            </div>

            <div className="inventory-menu-grid">
              <button
                type="button"
                onClick={() => {
                  closeMenuModal();
                  navigate(`/foods/edit/${menuModal.food.id}`);
                }}
              >
                <span>✏️</span>
                <strong>Edit Data</strong>
                <small>Ubah detail makanan.</small>
              </button>

              <button
                type="button"
                disabled={
                  ["kedaluwarsa", "dibuang", "terjual", "digunakan"].includes(
                    menuModal.food.status
                  ) || Number(menuModal.food.free_quantity || 0) <= 0
                }
                onClick={() => {
                  closeMenuModal();
                  navigate(`/marketplace/sell/${menuModal.food.id}`);
                }}
              >
                <span>🛒</span>
                <strong>Jual</strong>
                <small>Tawarkan stok bebas ke marketplace.</small>
              </button>

              <button
                type="button"
                disabled={Number(menuModal.food.free_quantity || 0) <= 0}
                onClick={() => openActionModal(menuModal.food, "digunakan")}
              >
                <span>🍽️</span>
                <strong>Digunakan</strong>
                <small>Kurangi stok yang dipakai.</small>
              </button>

              <button
                type="button"
                disabled={Number(menuModal.food.free_quantity || 0) <= 0}
                onClick={() => openActionModal(menuModal.food, "dibuang")}
              >
                <span>🗑️</span>
                <strong>Dibuang</strong>
                <small>Kurangi stok yang terbuang.</small>
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => handleDelete(menuModal.food)}
              >
                <span>🚫</span>
                <strong>Hapus</strong>
                <small>Hapus data dari inventaris.</small>
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal.open && actionModal.food && (
        <div className="inventory-modal-backdrop" onClick={closeActionModal}>
          <form
            className="inventory-action-modal"
            onSubmit={handleSubmitActionModal}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div>
                <span>Kelola Stok</span>
                <h3>{actionModal.title}</h3>
              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={closeActionModal}
              >
                ×
              </button>
            </div>

            <p className="inventory-modal-description">
              {actionModal.description}
            </p>

            <div className="inventory-modal-food">
              <div className="inventory-modal-food-icon">
                {actionModal.food.image_url ? (
                  <img
                    src={actionModal.food.image_url}
                    alt={actionModal.food.name}
                  />
                ) : (
                  <span>🍱</span>
                )}
              </div>

              <div>
                <strong>{actionModal.food.name}</strong>
                <small>
                  Stok bebas: {actionModal.food.free_quantity}{" "}
                  {actionModal.food.unit || "pcs"} dari total{" "}
                  {actionModal.food.quantity} {actionModal.food.unit || "pcs"}
                </small>
              </div>
            </div>

            <label>
              Jumlah yang{" "}
              {actionModal.status === "digunakan" ? "digunakan" : "dibuang"}
            </label>

            <div className="inventory-quantity-control">
              <button
                type="button"
                onClick={() =>
                  handleActionQuantityChange(
                    Math.max(Number(actionModal.quantity || 0) - 1, 1)
                  )
                }
              >
                −
              </button>

              <input
                type="number"
                min="1"
                max={actionModal.food.free_quantity}
                value={actionModal.quantity}
                placeholder={`Maks. ${actionModal.food.free_quantity}`}
                onChange={(event) =>
                  handleActionQuantityChange(event.target.value)
                }
                autoFocus
              />

              <button
                type="button"
                onClick={() =>
                  handleActionQuantityChange(
                    Math.min(
                      Number(actionModal.quantity || 0) + 1,
                      Number(actionModal.food.free_quantity || 1)
                    )
                  )
                }
              >
                +
              </button>
            </div>

            <small className="inventory-modal-note">
              Stok yang sedang dijual di marketplace tidak ikut digunakan atau
              dibuang. Yang dikurangi hanya stok bebas.
            </small>

            <div className="inventory-modal-actions">
              <button
                type="button"
                className="sb-btn dashboard-btn-outline"
                onClick={closeActionModal}
              >
                Batal
              </button>

              <button type="submit" className="sb-btn sb-btn-primary">
                {actionModal.buttonLabel}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}