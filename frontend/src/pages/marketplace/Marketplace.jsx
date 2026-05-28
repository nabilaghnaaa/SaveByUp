import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import { getMarketplaceProducts } from "../../services/marketplaceService";
import { getProfile } from "../../services/profileService";

import ProductCard from "./components/ProductCard";
import ProductFilter from "./components/ProductFilter";

import "./styles/marketplace.css";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("tersedia");

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

  const currentUserId = profile?.id;

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

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  return (
    <AppShell>
      <main className="marketplace-page">
        <div className="marketplace-orb marketplace-orb-one" />
        <div className="marketplace-orb marketplace-orb-two" />

        <PageHeader
          label="Marketplace"
          title="Marketplace Makanan Mahasiswa Kos"
          description="Temukan makanan layak konsumsi dari mahasiswa lain, cek tanggal kedaluwarsa, lalu ajukan pembelian atau negosiasi harga secara aman."
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={fetchInitialData}
            >
              Refresh
            </button>
          }
        />

        <section className="marketplace-hero">
          <div className="marketplace-hero-content">
            <span>Save Food, Share Value</span>
            <h2>Makanan yang masih layak tidak harus berakhir di tempat sampah.</h2>
            <p>
              Marketplace SaveByUp membantu mahasiswa kos menawarkan makanan
              mendekati kedaluwarsa dengan sistem pengajuan, negosiasi, dan
              komunikasi lanjutan setelah disetujui.
            </p>
          </div>

          <div className="marketplace-hero-stats">
            <div>
              <span>Total Produk</span>
              <strong>{loading ? "..." : products.length}</strong>
            </div>

            <div>
              <span>Tersedia</span>
              <strong>
                {loading
                  ? "..."
                  : products.filter((item) => item.status === "tersedia").length}
              </strong>
            </div>

            <div>
              <span>Dalam Proses</span>
              <strong>
                {loading
                  ? "..."
                  : products.filter((item) => item.status === "dalam_proses").length}
              </strong>
            </div>
          </div>
        </section>

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
            title="Produk tidak ditemukan"
            description="Coba ubah kata kunci pencarian, kategori, atau status produk."
            action={
              <button
                type="button"
                className="sb-btn marketplace-btn-outline"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("semua");
                  setStatusFilter("semua");
                }}
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