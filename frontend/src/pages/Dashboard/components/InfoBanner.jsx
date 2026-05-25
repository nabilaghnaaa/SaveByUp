import { useNavigate } from "react-router-dom";

export default function InfoBanner({ user }) {
  const navigate = useNavigate();

  const userName = user?.name || user?.nama || "Pengguna";

  const scrollToInventory = () => {
    const target = document.getElementById("dashboard-inventory");

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-content">
        <span>SaveByUp Dashboard</span>

        <h2>Hai, {userName}. Kelola stok makanan kos dengan lebih rapi.</h2>

        <p>
          Pantau stok makanan, tanggal kedaluwarsa, dan makanan yang perlu
          diprioritaskan sebelum terbuang. Semua data inventaris bisa kamu
          kelola dari satu dashboard.
        </p>

        <div className="dashboard-hero-actions">
          <button
            type="button"
            className="sb-btn sb-btn-primary"
            onClick={() => navigate("/foods/add")}
          >
            Tambah Makanan
          </button>

          <button
            type="button"
            className="sb-btn dashboard-btn-glass"
            onClick={scrollToInventory}
          >
            Lihat Inventaris
          </button>

          <button
            type="button"
            className="sb-btn dashboard-btn-glass"
            onClick={() => navigate("/marketplace")}
          >
            Marketplace
          </button>
        </div>
      </div>
    </section>
  );
}