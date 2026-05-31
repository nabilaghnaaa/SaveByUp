import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";

import FoodCard from "./components/FoodCard";
import FoodHistoryCard from "./components/FoodHistoryCard";

import InventoryActionMenu from "../Dashboard/components/InventoryActionMenu";
import InventoryStockModal from "../Dashboard/components/InventoryStockModal";

import {
  deleteFood,
  getFoodHistory,
  getFoods,
  updateFoodStatus,
} from "../../services/foodService";

import { getFoodStatus } from "../../utils/foodStatus";

import "./styles/foodStatusList.css";
import "../Dashboard/styles/dashboard-action-modal.css";

const PAGE_CONFIG = {
  semua: {
    label: "Inventory",
    title: "Total Stok",
    description: "Daftar semua makanan yang masih tercatat di inventaris kamu.",
    emptyTitle: "Belum ada makanan",
    emptyDesc: "Tambahkan makanan terlebih dahulu agar inventaris kamu terisi.",
  },
  aman: {
    label: "Safe Stock",
    title: "Aman Dikonsumsi",
    description:
      "Daftar makanan yang masih aman berdasarkan tanggal kedaluwarsa.",
    emptyTitle: "Belum ada makanan aman",
    emptyDesc:
      "Makanan aman akan muncul otomatis berdasarkan tanggal kedaluwarsa.",
  },
  mendekati_kedaluwarsa: {
    label: "Priority Stock",
    title: "Mendekati Kedaluwarsa",
    description:
      "Daftar makanan yang perlu segera digunakan, dijual, atau diprioritaskan.",
    emptyTitle: "Belum ada makanan mendekati kedaluwarsa",
    emptyDesc:
      "Makanan akan masuk ke halaman ini jika tanggal kedaluwarsanya sudah dekat.",
  },
  "selesai-waste": {
    label: "History",
    title: "Selesai / Waste",
    description:
      "Riwayat makanan yang sudah digunakan, dibuang, terjual, atau melewati tanggal kedaluwarsa.",
    emptyTitle: "Belum ada riwayat selesai / waste",
    emptyDesc:
      "Makanan yang digunakan, dibuang, terjual, atau kedaluwarsa akan muncul di sini.",
  },
};

const MANUAL_FINISHED_STATUSES = ["digunakan", "dibuang", "terjual"];

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

const getConditionStatusByDate = (food) => {
  return getFoodStatus(food.expiry_date, "aman");
};

const getEffectiveFoodStatus = (food) => {
  if (MANUAL_FINISHED_STATUSES.includes(food.status)) {
    return food.status;
  }

  const conditionStatus = getConditionStatusByDate(food);

  if (conditionStatus === "kedaluwarsa") {
    return "kedaluwarsa";
  }

  return food.status || conditionStatus;
};

const isFoodFinishedOrWaste = (food) => {
  const conditionStatus = getConditionStatusByDate(food);

  return (
    MANUAL_FINISHED_STATUSES.includes(food.status) ||
    conditionStatus === "kedaluwarsa"
  );
};

const isFoodMatchPageStatus = (food, activeStatus) => {
  const conditionStatus = getConditionStatusByDate(food);

  if (activeStatus === "semua") {
    return true;
  }

  if (activeStatus === "selesai-waste") {
    return isFoodFinishedOrWaste(food);
  }

  if (activeStatus === "aman") {
    return (
      conditionStatus === "aman" &&
      !MANUAL_FINISHED_STATUSES.includes(food.status)
    );
  }

  if (activeStatus === "mendekati_kedaluwarsa") {
    return (
      conditionStatus === "mendekati_kedaluwarsa" &&
      !MANUAL_FINISHED_STATUSES.includes(food.status)
    );
  }

  return food.status === activeStatus;
};

const getPageStatusLabel = (status) => {
  const labels = {
    semua: "Semua",
    aman: "Aman",
    mendekati_kedaluwarsa: "Mendekati Kedaluwarsa",
    kedaluwarsa: "Kedaluwarsa",
    dijual: "Dijual",
    digunakan: "Digunakan",
    dibuang: "Dibuang",
    terjual: "Terjual",
    "selesai-waste": "Selesai / Waste",
  };

  return labels[status] || "Semua";
};

export default function FoodStatusList() {
  const { status } = useParams();
  const navigate = useNavigate();

  const activeStatus = PAGE_CONFIG[status] ? status : "semua";
  const pageConfig = PAGE_CONFIG[activeStatus];
  const isHistoryPage = activeStatus === "selesai-waste";

  const [foods, setFoods] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [menuModal, setMenuModal] = useState(emptyMenuModal);
  const [actionModal, setActionModal] = useState(emptyActionModal);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (isHistoryPage) {
        const data = await getFoodHistory();
        setHistoryItems(Array.isArray(data) ? data : []);
        setFoods([]);
        return;
      }

      const data = await getFoods();
      setFoods(Array.isArray(data) ? data : []);
      setHistoryItems([]);
    } catch (error) {
      console.error("Gagal mengambil data makanan:", error);

      setMessage(
        error.response?.data?.message || "Gagal mengambil data makanan."
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
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [activeStatus]);

  const filteredFoods = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return foods
      .filter((food) => isFoodMatchPageStatus(food, activeStatus))
      .filter((food) => {
        if (!keyword) return true;

        const conditionStatus = getConditionStatusByDate(food);
        const effectiveStatus = getEffectiveFoodStatus(food);

        return (
          food.name?.toLowerCase().includes(keyword) ||
          food.category?.toLowerCase().includes(keyword) ||
          food.unit?.toLowerCase().includes(keyword) ||
          food.status?.toLowerCase().includes(keyword) ||
          conditionStatus?.toLowerCase().includes(keyword) ||
          effectiveStatus?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.expiry_date || a.updated_at || a.created_at);
        const dateB = new Date(b.expiry_date || b.updated_at || b.created_at);

        return dateA - dateB;
      });
  }, [foods, activeStatus, search]);

  const filteredHistory = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return historyItems.filter((item) => {
      if (!keyword) return true;

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.unit?.toLowerCase().includes(keyword) ||
        item.action?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword) ||
        item.note?.toLowerCase().includes(keyword)
      );
    });
  }, [historyItems, search]);

  const activeItems = isHistoryPage ? filteredHistory : filteredFoods;

  const totalStock = activeItems.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  const totalExpired = activeItems.filter((item) => {
    if (isHistoryPage) return item.action === "kedaluwarsa";
    return getConditionStatusByDate(item) === "kedaluwarsa";
  }).length;

  const openMenuModal = (food) => {
    const effectiveFood = {
      ...food,
      status: getEffectiveFoodStatus(food),
    };

    setMessage("");
    setActionModal(emptyActionModal);

    setMenuModal({
      open: true,
      food: effectiveFood,
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

  return (
    <AppShell>
      <main className="food-status-list-page">
        <section className="food-status-hero">
          <div className="food-status-hero-top">
            <button
              type="button"
              className="food-status-back"
              onClick={() => navigate("/dashboard")}
            >
              ← Kembali ke Dashboard
            </button>

            {!isHistoryPage && (
              <button
                type="button"
                className="food-status-add"
                onClick={() => navigate("/foods/add")}
              >
                + Tambah Makanan
              </button>
            )}
          </div>

          <div className="food-status-heading">
            <span>{pageConfig.label}</span>
            <h1>{pageConfig.title}</h1>
            <p>{pageConfig.description}</p>
          </div>

          <div className="food-status-stats">
            <div>
              <span>Total Data</span>
              <strong>{loading ? "..." : activeItems.length}</strong>
            </div>

            <div>
              <span>Total Stok</span>
              <strong>{loading ? "..." : totalStock}</strong>
            </div>

            <div>
              <span>Status Halaman</span>
              <strong>{getPageStatusLabel(activeStatus)}</strong>
            </div>

            <div>
              <span>Kedaluwarsa</span>
              <strong>{loading ? "..." : totalExpired}</strong>
            </div>
          </div>
        </section>

        <section className="food-status-toolbar">
          <input
            type="text"
            value={search}
            placeholder={
              isHistoryPage
                ? "Cari riwayat makanan, aksi, kategori, atau catatan..."
                : "Cari nama makanan, kategori, satuan, atau status..."
            }
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="button" onClick={fetchData} disabled={loading}>
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </section>

        {message && <div className="food-status-message">{message}</div>}

        {loading ? (
          <section className="food-status-state">
            <div className="food-status-loader" />
            <h3>Memuat data makanan...</h3>
            <p>Sedang mengambil daftar makanan sesuai status.</p>
          </section>
        ) : activeItems.length === 0 ? (
          <EmptyState
            title={pageConfig.emptyTitle}
            description={pageConfig.emptyDesc}
            action={
              !isHistoryPage && (
                <button
                  type="button"
                  className="food-status-primary-btn"
                  onClick={() => navigate("/foods/add")}
                >
                  Tambah Makanan
                </button>
              )
            }
          />
        ) : isHistoryPage ? (
          <section className="food-history-grid">
            {filteredHistory.map((item) => (
              <FoodHistoryCard item={item} key={item.id} />
            ))}
          </section>
        ) : (
          <section className="food-status-food-grid">
            {filteredFoods.map((food) => {
              const effectiveFood = {
                ...food,
                status: getEffectiveFoodStatus(food),
              };

              return (
                <FoodCard
                  key={food.id}
                  food={effectiveFood}
                  onAction={() => openMenuModal(food)}
                />
              );
            })}
          </section>
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
      </main>
    </AppShell>
  );
}