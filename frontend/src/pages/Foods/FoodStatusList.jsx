import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";

import {
  deleteFood,
  getFoods,
  throwFoodStock,
  useFoodStock,
} from "../../services/foodService";

import "./styles/foodStatusList.css";

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

const FINISHED_STATUSES = ["digunakan", "dibuang", "terjual", "kedaluwarsa"];

const getStatusLabel = (status) => {
  const labels = {
    aman: "Aman",
    mendekati_kedaluwarsa: "Mendekati Kedaluwarsa",
    kedaluwarsa: "Kedaluwarsa",
    dijual: "Dijual",
    digunakan: "Digunakan",
    dibuang: "Dibuang",
    terjual: "Terjual",
  };

  return labels[status] || "Tidak diketahui";
};

const getStatusClass = (status) => {
  if (status === "aman") return "safe";
  if (status === "mendekati_kedaluwarsa") return "warning";
  if (status === "kedaluwarsa" || status === "dibuang") return "danger";
  if (status === "dijual") return "market";
  if (status === "digunakan" || status === "terjual") return "done";

  return "neutral";
};

const getImageSource = (food) => {
  return food.image_url || food.image || "";
};

const formatRupiah = (value) => {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRemainingDays = (expiryDate) => {
  if (!expiryDate) return null;

  const today = new Date();
  const expired = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expired.setHours(0, 0, 0, 0);

  const diffTime = expired.getTime() - today.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRemainingLabel = (expiryDate) => {
  const days = getRemainingDays(expiryDate);

  if (days === null) return "Tanggal belum diisi";
  if (days < 0) return `Lewat ${Math.abs(days)} hari`;
  if (days === 0) return "Hari ini";

  return `${days} hari lagi`;
};

const getValidQuantityInput = (value, maxQuantity) => {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      valid: false,
      message: "Jumlah harus berupa angka dan lebih dari 0.",
      quantity: 0,
    };
  }

  if (quantity > Number(maxQuantity || 0)) {
    return {
      valid: false,
      message: `Jumlah tidak boleh melebihi stok bebas: ${maxQuantity}.`,
      quantity: 0,
    };
  }

  return {
    valid: true,
    message: "",
    quantity,
  };
};

export default function FoodStatusList() {
  const { status } = useParams();
  const navigate = useNavigate();

  const activeStatus = PAGE_CONFIG[status] ? status : "semua";
  const pageConfig = PAGE_CONFIG[activeStatus];

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getFoods();
      setFoods(Array.isArray(data) ? data : []);
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
    fetchFoods();
  }, [activeStatus]);

  const filteredFoods = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return foods
      .filter((food) => {
        if (activeStatus === "semua") return true;

        if (activeStatus === "selesai-waste") {
          return FINISHED_STATUSES.includes(food.status);
        }

        return food.status === activeStatus;
      })
      .filter((food) => {
        if (!keyword) return true;

        return (
          food.name?.toLowerCase().includes(keyword) ||
          food.category?.toLowerCase().includes(keyword) ||
          food.status?.toLowerCase().includes(keyword) ||
          food.unit?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.expiry_date || a.updated_at || a.created_at);
        const dateB = new Date(b.expiry_date || b.updated_at || b.created_at);

        return dateA - dateB;
      });
  }, [foods, activeStatus, search]);

  const totalStock = filteredFoods.reduce((total, food) => {
    return total + Number(food.quantity || 0);
  }, 0);

  const totalExpired = filteredFoods.filter(
    (food) => food.status === "kedaluwarsa"
  ).length;

  const handleDelete = async (food) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus "${food.name}" dari inventaris?`
    );

    if (!confirmed) return;

    try {
      await deleteFood(food.id);
      setMessage("Data makanan berhasil dihapus.");
      await fetchFoods();
    } catch (error) {
      console.error("Gagal menghapus makanan:", error);
      setMessage(error.response?.data?.message || "Gagal menghapus makanan.");
    }
  };

  const handleUseFood = async (food) => {
    const maxQuantity = Number(food.free_quantity ?? food.quantity ?? 0);

    if (maxQuantity <= 0) {
      setMessage("Stok bebas tidak tersedia untuk digunakan.");
      return;
    }

    const input = window.prompt(
      `Masukkan jumlah ${food.name} yang digunakan.\nStok bebas: ${maxQuantity} ${
        food.unit || "pcs"
      }`
    );

    if (input === null) return;

    const validation = getValidQuantityInput(input, maxQuantity);

    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    try {
      await useFoodStock(food, validation.quantity);
      setMessage("Stok makanan berhasil ditandai digunakan.");
      await fetchFoods();
    } catch (error) {
      console.error("Gagal menggunakan makanan:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengubah status makanan."
      );
    }
  };

  const handleDiscardFood = async (food) => {
    const maxQuantity = Number(food.free_quantity ?? food.quantity ?? 0);

    if (maxQuantity <= 0) {
      setMessage("Stok bebas tidak tersedia untuk dibuang.");
      return;
    }

    const input = window.prompt(
      `Masukkan jumlah ${food.name} yang dibuang.\nStok bebas: ${maxQuantity} ${
        food.unit || "pcs"
      }`
    );

    if (input === null) return;

    const validation = getValidQuantityInput(input, maxQuantity);

    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    try {
      await throwFoodStock(food, validation.quantity);
      setMessage("Stok makanan berhasil ditandai dibuang.");
      await fetchFoods();
    } catch (error) {
      console.error("Gagal membuang makanan:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengubah status makanan."
      );
    }
  };

  return (
    <AppShell>
      <main className="food-status-list-page">
        <section className="food-status-hero">
          <button
            type="button"
            className="food-status-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Kembali ke Dashboard
          </button>

          <div className="food-status-heading">
            <span>{pageConfig.label}</span>
            <h1>{pageConfig.title}</h1>
            <p>{pageConfig.description}</p>
          </div>

          <div className="food-status-stats">
            <div>
              <span>Total Data</span>
              <strong>{loading ? "..." : filteredFoods.length}</strong>
            </div>

            <div>
              <span>Total Stok</span>
              <strong>{loading ? "..." : totalStock}</strong>
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
            placeholder="Cari nama, kategori, satuan, atau status makanan..."
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="button" onClick={fetchFoods} disabled={loading}>
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
        ) : filteredFoods.length === 0 ? (
          <EmptyState
            title={pageConfig.emptyTitle}
            description={pageConfig.emptyDesc}
            action={
              <button
                type="button"
                className="food-status-primary-btn"
                onClick={() => navigate("/foods/add")}
              >
                Tambah Makanan
              </button>
            }
          />
        ) : (
          <section className="food-status-grid">
            {filteredFoods.map((food) => {
              const imageSource = getImageSource(food);
              const isFinished = FINISHED_STATUSES.includes(food.status);
              const statusClass = getStatusClass(food.status);

              return (
                <article className="food-status-card" key={food.id}>
                  <div className="food-status-image">
                    {imageSource ? (
                      <img src={imageSource} alt={food.name} />
                    ) : (
                      <div className="food-status-placeholder">
                        {food.name?.charAt(0)?.toUpperCase() || "F"}
                      </div>
                    )}

                    <span className={`food-status-badge ${statusClass}`}>
                      {getStatusLabel(food.status)}
                    </span>
                  </div>

                  <div className="food-status-content">
                    <div className="food-status-title-row">
                      <div>
                        <span>{food.category || "Tanpa Kategori"}</span>
                        <h3>{food.name}</h3>
                      </div>

                      <strong>{formatRupiah(food.price)}</strong>
                    </div>

                    <p className="food-status-desc">
                      {food.note ||
                        "Belum ada catatan tambahan untuk makanan ini."}
                    </p>

                    <div className="food-status-info-grid">
                      <div>
                        <span>Stok</span>
                        <strong>
                          {food.quantity} {food.unit || "pcs"}
                        </strong>
                      </div>

                      <div>
                        <span>Stok Bebas</span>
                        <strong>
                          {food.free_quantity ?? food.quantity}{" "}
                          {food.unit || "pcs"}
                        </strong>
                      </div>

                      <div>
                        <span>Kedaluwarsa</span>
                        <strong>{formatDate(food.expiry_date)}</strong>
                      </div>

                      <div>
                        <span>Sisa Waktu</span>
                        <strong>{getRemainingLabel(food.expiry_date)}</strong>
                      </div>
                    </div>

                    <div className="food-status-actions">
                      <button
                        type="button"
                        onClick={() => navigate(`/foods/edit/${food.id}`)}
                      >
                        Edit
                      </button>

                      {!isFinished && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/marketplace/sell/${food.id}`)
                            }
                          >
                            Jual
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUseFood(food)}
                          >
                            Gunakan
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDiscardFood(food)}
                          >
                            Buang
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="ghost danger"
                        onClick={() => handleDelete(food)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </AppShell>
  );
}