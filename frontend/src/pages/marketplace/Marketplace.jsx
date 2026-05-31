import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import { getMarketplaceProducts } from "../../services/marketplaceService";
import { getProfile } from "../../services/profileService";

import ProductCard from "./components/ProductCard";
import ProductFilter from "./components/ProductFilter";

import "./styles/marketplace.css";

const normalizeOwnerFilter = (value) => {
  if (value === "tokoku") return "tokoku";
  if (value === "produk_lain") return "produk_lain";
  return "semua";
};

const normalizeStatusFilter = (value) => {
  if (
    [
      "semua",
      "tersedia",
      "dalam_proses",
      "terjual",
      "dibatalkan",
      "selesai",
    ].includes(value)
  ) {
    return value;
  }

  return "tersedia";
};

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOwnerFilter = normalizeOwnerFilter(searchParams.get("owner"));
  const initialStatusFilter = normalizeStatusFilter(searchParams.get("status"));

  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [ownerFilter, setOwnerFilter] = useState(initialOwnerFilter);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      setProfile(null);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getMarketplaceProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil produk marketplace:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal mengambil data marketplace."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    await Promise.all([fetchProfile(), fetchProducts()]);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const ownerFromUrl = normalizeOwnerFilter(searchParams.get("owner"));
    const statusFromUrl = normalizeStatusFilter(searchParams.get("status"));

    setOwnerFilter(ownerFromUrl);
    setStatusFilter(statusFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const params = {};

    if (ownerFilter !== "semua") {
      params.owner = ownerFilter;
    }

    if (statusFilter !== "tersedia") {
      params.status = statusFilter;
    }

    setSearchParams(params, { replace: true });
  }, [ownerFilter, statusFilter, setSearchParams]);

  const currentUserId = profile?.id || profile?.user_id || profile?.id_user;

  const productStats = useMemo(() => {
    const mine = products.filter(
      (item) => Number(item.seller_id) === Number(currentUserId)
    );

    const other = products.filter(
      (item) => Number(item.seller_id) !== Number(currentUserId)
    );

    const activeMine = mine.filter((item) =>
      ["tersedia", "dalam_proses"].includes(item.status)
    );

    return {
      total: products.length,
      mine: mine.length,
      other: other.length,
      activeMine: activeMine.length,
    };
  }, [products, currentUserId]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchSearch =
        !keyword ||
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword) ||
        product.seller_name?.toLowerCase().includes(keyword) ||
        product.seller_address?.toLowerCase().includes(keyword);

      const matchCategory =
        categoryFilter === "semua" || product.category === categoryFilter;

      const matchStatus =
        statusFilter === "semua" || product.status === statusFilter;

      const isMine = Number(product.seller_id) === Number(currentUserId);

      const matchOwner =
        ownerFilter === "semua" ||
        (ownerFilter === "tokoku" && isMine) ||
        (ownerFilter === "produk_lain" && !isMine);

      return matchSearch && matchCategory && matchStatus && matchOwner;
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    ownerFilter,
    currentUserId,
  ]);

  const handleOwnerFilterChange = (value) => {
    setOwnerFilter(value);

    if (value === "tokoku") {
      setStatusFilter("semua");
      return;
    }

    if (value === "produk_lain") {
      setStatusFilter("tersedia");
      return;
    }

    setStatusFilter("tersedia");
  };

  const handleResetFilter = () => {
    setSearch("");
    setCategoryFilter("semua");
    setStatusFilter(ownerFilter === "tokoku" ? "semua" : "tersedia");
  };

  return (
    <AppShell>
      <main className="marketplace-page">
        <div className="marketplace-orb marketplace-orb-one" />
        <div className="marketplace-orb marketplace-orb-two" />

        <PageHeader
          label={ownerFilter === "tokoku" ? "TokoKu" : "Marketplace"}
          title={
            ownerFilter === "tokoku"
              ? "Produk yang sedang kamu jual"
              : "Marketplace Makanan Mahasiswa Kos"
          }
          description={
            ownerFilter === "tokoku"
              ? "Kelola makanan yang sudah kamu tawarkan di marketplace. Kamu bisa melihat produk aktif, dalam proses, atau riwayat produk yang sudah selesai."
              : "Temukan makanan layak konsumsi dari mahasiswa lain, cek tanggal kedaluwarsa, lalu ajukan pembelian atau negosiasi harga secara aman."
          }
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={fetchInitialData}
              disabled={loading}
            >
              {loading ? "Memuat..." : "Refresh"}
            </button>
          }
        />

        <section className="marketplace-hero">
          <div className="marketplace-hero-content">
            <span>Save Food, Share Value</span>
            <h2>
              {ownerFilter === "tokoku"
                ? "Pantau semua makanan yang kamu tawarkan."
                : "Makanan yang masih layak tidak harus berakhir di tempat sampah."}
            </h2>
            <p>
              {ownerFilter === "tokoku"
                ? "Halaman TokoKu membantu kamu melihat produk milikmu sendiri, termasuk stok yang masih tersedia dan produk yang sedang dalam proses pengajuan."
                : "Marketplace SaveByUp membantu mahasiswa kos menawarkan makanan mendekati kedaluwarsa dengan sistem pengajuan, negosiasi, dan komunikasi lanjutan setelah disetujui."}
            </p>
          </div>

          <div className="marketplace-hero-stats">
            <div>
              <span>Total Produk</span>
              <strong>{loading ? "..." : productStats.total}</strong>
            </div>

            <div>
              <span>Tokoku</span>
              <strong>{loading ? "..." : productStats.mine}</strong>
            </div>

            <div>
              <span>Produk Lain</span>
              <strong>{loading ? "..." : productStats.other}</strong>
            </div>
          </div>
        </section>

        <div className="marketplace-owner-filter">
          <button
            type="button"
            className={ownerFilter === "semua" ? "active" : ""}
            onClick={() => handleOwnerFilterChange("semua")}
          >
            Semua
          </button>

          <button
            type="button"
            className={ownerFilter === "tokoku" ? "active" : ""}
            onClick={() => handleOwnerFilterChange("tokoku")}
          >
            Tokoku
            {!loading && productStats.activeMine > 0 && (
              <span>{productStats.activeMine}</span>
            )}
          </button>

          <button
            type="button"
            className={ownerFilter === "produk_lain" ? "active" : ""}
            onClick={() => handleOwnerFilterChange("produk_lain")}
          >
            Produk Lain
          </button>
        </div>

        <ProductFilter
          search={search}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
        />

        {message && <div className="marketplace-message">{message}</div>}

        {loading ? (
          <div className="marketplace-state">
            <div className="marketplace-loader" />
            <h3>Memuat marketplace...</h3>
            <p>Sedang mengambil daftar makanan yang ditawarkan.</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Belum ada produk marketplace"
            description="Produk dari inventaris yang ditawarkan ke marketplace akan muncul di sini."
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title={
              ownerFilter === "tokoku"
                ? "Belum ada produk di Tokoku"
                : "Produk tidak ditemukan"
            }
            description={
              ownerFilter === "tokoku"
                ? "Makanan yang kamu jual akan muncul di halaman Tokoku."
                : "Coba ubah kata kunci pencarian, kategori, status, atau filter toko."
            }
            action={
              <button
                type="button"
                className="sb-btn marketplace-btn-outline"
                onClick={handleResetFilter}
              >
                Reset Filter
              </button>
            }
          />
        ) : (
          <section className="marketplace-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                product={product}
                currentUserId={currentUserId}
                key={product.id}
              />
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}