import { useNavigate } from "react-router-dom";

export default function InfoBanner({ user, summary, loading }) {
  const navigate = useNavigate();

  const userName = user?.name || user?.nama || "Pengguna";
  const totalFoods = Number(summary?.total_foods || 0);
  const totalMendekati = Number(summary?.total_mendekati || 0);
  const totalKedaluwarsa = Number(summary?.total_kedaluwarsa || 0);

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
      <div className="dashboard-hero-main">
        <span className="dashboard-kicker">SaveByUp Dashboard</span>

        <h1>Hai, {userName}. Kelola stok makanan kos sebelum terbuang.</h1>

        <p>
          Pantau stok makanan, tanggal kedaluwarsa, prioritas konsumsi, dan
          manfaatkan makanan yang masih layak melalui marketplace agar food waste
          bisa dikurangi.
        </p>

        <div className="dashboard-hero-actions">
          <button
            type="button"
            className="sb-btn sb-btn-primary"
            onClick={() => navigate("/foods/add")}
          >
            Tambah Stok Makanan
          </button>

          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={scrollToInventory}
          >
            Lihat Inventaris
          </button>

          <button
            type="button"
            className="sb-btn sb-btn-dark"
            onClick={() => navigate("/marketplace")}
          >
            Buka Marketplace
          </button>
        </div>
      </div>

      <aside className="dashboard-hero-panel sb-glass">
        <div className="hero-panel-label">
          <span>Monitoring Aktif</span>
          <strong>{loading ? "..." : totalFoods}</strong>
          <p>Total makanan tercatat</p>
        </div>

        <div className="hero-mini-stats">
          <div>
            <span>Mendekati Kedaluwarsa</span>
            <strong>{loading ? "-" : totalMendekati}</strong>
          </div>

          <div>
            <span>Kedaluwarsa</span>
            <strong>{loading ? "-" : totalKedaluwarsa}</strong>
          </div>
        </div>

        <div className="hero-alert">
          <span>Prioritas hari ini</span>
          <p>
            Cek makanan yang mendekati kedaluwarsa terlebih dahulu. Gunakan,
            tawarkan, atau tandai statusnya agar inventaris tetap akurat.
          </p>
        </div>
      </aside>
    </section>
  );
}