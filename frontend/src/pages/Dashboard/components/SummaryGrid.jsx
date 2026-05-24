const getPercent = (value, total) => {
  const safeTotal = Number(total || 0);
  const safeValue = Number(value || 0);

  if (!safeTotal) return 0;

  return Math.min(Math.round((safeValue / safeTotal) * 100), 100);
};

export default function SummaryGrid({ summary, loading }) {
  const totalFoods = Number(summary.total_foods || 0);
  const totalAman = Number(summary.total_aman || 0);
  const totalMendekati = Number(summary.total_mendekati || 0);
  const totalKedaluwarsa = Number(summary.total_kedaluwarsa || 0);
  const totalDibuang = Number(summary.total_dibuang || 0);
  const totalDigunakan = Number(summary.total_digunakan || 0);

  const wasteTotal = totalKedaluwarsa + totalDibuang + totalDigunakan;

  const cards = [
    {
      title: "Total Makanan",
      value: totalFoods,
      desc: "Semua makanan yang tercatat dalam inventaris pribadi.",
      tone: "green",
      percent: totalFoods > 0 ? 100 : 0,
    },
    {
      title: "Aman Dikonsumsi",
      value: totalAman,
      desc: "Makanan yang masih aman dan belum mendekati tanggal kedaluwarsa.",
      tone: "safe",
      percent: getPercent(totalAman, totalFoods),
    },
    {
      title: "Mendekati Kedaluwarsa",
      value: totalMendekati,
      desc: "Makanan yang perlu diprioritaskan untuk digunakan atau ditawarkan.",
      tone: "warning",
      percent: getPercent(totalMendekati, totalFoods),
    },
    {
      title: "Selesai / Waste",
      value: wasteTotal,
      desc: "Makanan yang sudah digunakan, dibuang, atau sudah kedaluwarsa.",
      tone: "danger",
      percent: getPercent(wasteTotal, totalFoods),
    },
  ];

  return (
    <section className="summary-section">
      <div className="section-heading">
        <span>Ringkasan Inventaris</span>
        <h2>Status stok makanan</h2>
        <p>
          Ringkasan ini membantu kamu memantau kondisi stok dan risiko makanan
          terbuang.
        </p>
      </div>

      <div className="summary-grid">
        {cards.map((card) => (
          <article
            className={`summary-card summary-${card.tone}`}
            key={card.title}
          >
            <div className="summary-card-top">
              <span>{card.title}</span>
              <strong>{loading ? "..." : card.value}</strong>
            </div>

            <p>{card.desc}</p>

            <div className="summary-progress">
              <div style={{ width: `${card.percent}%` }} />
            </div>

            <small>{card.percent}% dari total data</small>
          </article>
        ))}
      </div>
    </section>
  );
}