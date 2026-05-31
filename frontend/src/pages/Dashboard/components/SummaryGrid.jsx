import { useNavigate } from "react-router-dom";

import AppIcon from "../../../components/ui/AppIcon";

const getPercent = (value, total) => {
  const safeTotal = Number(total || 0);
  const safeValue = Number(value || 0);

  if (!safeTotal) return 0;

  return Math.min(Math.round((safeValue / safeTotal) * 100), 100);
};

export default function SummaryGrid({ summary, loading }) {
  const navigate = useNavigate();

  const totalStok = Number(summary.total_stok || summary.total_foods || 0);
  const totalItems = Number(summary.total_items || 0);

  const totalAman = Number(summary.total_aman || 0);
  const totalMendekati = Number(summary.total_mendekati || 0);
  const totalKedaluwarsa = Number(summary.total_kedaluwarsa || 0);

  const totalDijual = Number(summary.total_dijual || 0);
  const totalDigunakan = Number(summary.total_digunakan || 0);
  const totalDibuang = Number(summary.total_dibuang || 0);
  const totalTerjual = Number(summary.total_terjual || 0);

  const selesaiWaste =
    Number(summary.total_selesai_waste || 0) ||
    totalKedaluwarsa + totalDibuang + totalDigunakan + totalTerjual;

  const cards = [
    {
      title: "Total Stok",
      value: totalStok,
      desc: `${totalItems} jenis makanan tercatat. Angka utama dihitung berdasarkan jumlah stok, bukan jumlah kartu makanan.`,
      tone: "earth",
      percent: totalStok > 0 ? 100 : 0,
      icon: "stock",
      path: "/foods/status/semua",
      actionLabel: "Lihat semua stok",
    },
    {
      title: "Aman Dikonsumsi",
      value: totalAman,
      desc: "Stok yang masih aman berdasarkan tanggal kedaluwarsa, termasuk stok yang sedang dijual jika kondisinya masih aman.",
      tone: "green",
      percent: getPercent(totalAman, totalStok),
      icon: "safe",
      path: "/foods/status/aman",
      actionLabel: "Lihat stok aman",
    },
    {
      title: "Mendekati Kedaluwarsa",
      value: totalMendekati,
      desc: "Stok yang perlu diprioritaskan karena tanggal kedaluwarsanya sudah dekat.",
      tone: "warm",
      percent: getPercent(totalMendekati, totalStok),
      icon: "warning",
      path: "/foods/status/mendekati_kedaluwarsa",
      actionLabel: "Lihat prioritas",
    },
    {
      title: "Aktif Dijual",
      value: totalDijual,
      desc: "Jumlah stok yang sedang aktif ditawarkan di marketplace.",
      tone: "blue",
      percent: getPercent(totalDijual, totalStok),
      icon: "sold",
      path: "/marketplace?owner=tokoku&status=semua",
      actionLabel: "Buka Tokoku",
    },
    {
      title: "Selesai / Waste",
      value: selesaiWaste,
      desc: "Akumulasi stok yang sudah digunakan, dibuang, terjual, atau melewati kedaluwarsa.",
      tone: "brown",
      percent: getPercent(selesaiWaste, totalStok + selesaiWaste),
      icon: "waste",
      path: "/foods/status/selesai-waste",
      actionLabel: "Lihat riwayat",
    },
  ];

  const handleOpenCard = (path) => {
    if (loading) return;
    navigate(path);
  };

  const handleKeyDown = (event, path) => {
    if (loading) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(path);
    }
  };

  return (
    <section className="summary-section">
      <div className="section-heading">
        <span>Ringkasan Inventaris</span>
        <h2>Status stok makanan kamu</h2>
        <p>
          Ringkasan ini memisahkan kondisi makanan dan aktivitas stok. Klik card
          untuk melihat daftar makanan sesuai statusnya.
        </p>
      </div>

      <div className="summary-grid">
        {cards.map((card) => (
          <article
            className={`summary-card summary-${card.tone} summary-card-clickable ${
              loading ? "summary-card-disabled" : ""
            }`}
            key={card.title}
            role="button"
            tabIndex={loading ? -1 : 0}
            aria-label={`${card.title}. ${card.actionLabel}`}
            onClick={() => handleOpenCard(card.path)}
            onKeyDown={(event) => handleKeyDown(event, card.path)}
          >
            <div className="summary-icon">
              <AppIcon name={card.icon} />
            </div>

            <div className="summary-card-top">
              <span>{card.title}</span>
              <strong>{loading ? "..." : card.value}</strong>
            </div>

            <p>{card.desc}</p>

            <div className="summary-progress">
              <div style={{ width: `${loading ? 0 : card.percent}%` }} />
            </div>

            <div className="summary-card-bottom">
              <small>{loading ? "Memuat data..." : `${card.percent}% dari acuan stok`}</small>
              <b>{card.actionLabel} →</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}