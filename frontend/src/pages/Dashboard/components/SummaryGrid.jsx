const getPercent = (value, total) => {
  const safeTotal = Number(total || 0);
  const safeValue = Number(value || 0);

  if (!safeTotal) return 0;

  return Math.min(Math.round((safeValue / safeTotal) * 100), 100);
};

export default function SummaryGrid({ summary, loading }) {
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
      icon: "🍱",
    },
    {
      title: "Aman Dikonsumsi",
      value: totalAman,
      desc: "Stok yang masih aman berdasarkan tanggal kedaluwarsa, termasuk stok yang sedang dijual jika kondisinya masih aman.",
      tone: "green",
      percent: getPercent(totalAman, totalStok),
      icon: "🌿",
    },
    {
      title: "Mendekati Kedaluwarsa",
      value: totalMendekati,
      desc: "Stok yang perlu diprioritaskan karena tanggal kedaluwarsanya sudah dekat.",
      tone: "warm",
      percent: getPercent(totalMendekati, totalStok),
      icon: "⏰",
    },
    {
      title: "Aktif Dijual",
      value: totalDijual,
      desc: "Jumlah stok yang sedang aktif ditawarkan di marketplace.",
      tone: "blue",
      percent: getPercent(totalDijual, totalStok),
      icon: "🛒",
    },
    {
      title: "Selesai / Waste",
      value: selesaiWaste,
      desc: "Akumulasi stok yang sudah digunakan, dibuang, terjual, atau melewati kedaluwarsa.",
      tone: "brown",
      percent: getPercent(selesaiWaste, totalStok + selesaiWaste),
      icon: "♻️",
    },
  ];

  return (
    <section className="summary-section">
      <div className="section-heading">
        <span>Ringkasan Inventaris</span>
        <h2>Status stok makanan kamu</h2>
        <p>
          Ringkasan ini memisahkan kondisi makanan dan aktivitas stok. Jadi stok
          yang dijual tetap bisa masuk kategori aman atau mendekati kedaluwarsa
          jika tanggalnya memang masih sesuai.
        </p>
      </div>

      <div className="summary-grid">
        {cards.map((card) => (
          <article
            className={`summary-card summary-${card.tone}`}
            key={card.title}
          >
            <div className="summary-icon">{card.icon}</div>

            <div className="summary-card-top">
              <span>{card.title}</span>
              <strong>{loading ? "..." : card.value}</strong>
            </div>

            <p>{card.desc}</p>

            <div className="summary-progress">
              <div style={{ width: `${card.percent}%` }} />
            </div>

            <small>{card.percent}% dari acuan stok</small>
          </article>
        ))}
      </div>
    </section>
  );
}