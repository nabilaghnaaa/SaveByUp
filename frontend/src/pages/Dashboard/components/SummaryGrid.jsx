function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2l2.2 2.2 4.8-5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 14h8l1-14" />
      <path d="M10 11l4 4" />
      <path d="M14 11l-4 4" />
    </svg>
  );
}

function IconUsed() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.4 2.4 5-6" />
      <path d="M12 4v2" />
      <path d="M12 18v2" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-inventory-icon">
      <path d="M12 3l1.4 5.1L18.5 9.5l-5.1 1.4L12 16l-1.4-5.1-5.1-1.4 5.1-1.4L12 3z" />
      <path d="M18 14l.8 2.8L21.5 18l-2.7.8L18 21.5l-.8-2.7-2.7-.8 2.7-1.2L18 14z" />
    </svg>
  );
}

function getNumber(value) {
  return Number(value || 0);
}

function getPercent(value, total) {
  const numericValue = getNumber(value);
  const numericTotal = getNumber(total);

  if (!numericTotal || numericTotal <= 0) return 0;

  const percent = Math.round((numericValue / numericTotal) * 100);

  return Math.min(percent, 100);
}

function SummaryGrid({ summary }) {
  const totalFoods = getNumber(summary.total_foods);
  const totalAman = getNumber(summary.total_aman);
  const totalKedaluwarsa = getNumber(summary.total_kedaluwarsa);
  const totalDibuang = getNumber(summary.total_dibuang);
  const totalDigunakan = getNumber(summary.total_digunakan);

  const totalKedaluwarsaDibuang = totalKedaluwarsa + totalDibuang;

  const summaryItems = [
    {
      title: 'Total Makanan',
      value: totalFoods,
      description: 'Semua stok makanan yang pernah tercatat',
      icon: <IconBox />,
      color: 'green',
      meta: 'Inventory',
      progress: totalFoods > 0 ? 100 : 0,
    },
    {
      title: 'Makanan Aman',
      value: totalAman,
      description: 'Masih layak dan jauh dari tanggal kedaluwarsa',
      icon: <IconCheck />,
      color: 'emerald',
      meta: 'Safe Stock',
      progress: getPercent(totalAman, totalFoods),
    },
    {
      title: 'Kedaluwarsa / Dibuang',
      value: totalKedaluwarsaDibuang,
      description: 'Tidak layak konsumsi atau dibuang karena kondisi makanan',
      icon: <IconTrash />,
      color: 'danger',
      meta: 'Waste Track',
      progress: getPercent(totalKedaluwarsaDibuang, totalFoods),
    },
    {
      title: 'Digunakan',
      value: totalDigunakan,
      description: 'Produk yang sudah digunakan atau dikonsumsi sampai habis',
      icon: <IconUsed />,
      color: 'lime',
      meta: 'Used Stock',
      progress: getPercent(totalDigunakan, totalFoods),
    },
  ];

  return (
    <section className="summary-section-pro">
      <div className="summary-section-inner">
        <div className="section-heading-pro summary-heading-pro">
          <div>
            <span>
              <IconSparkle />
              Ringkasan Inventaris
            </span>

            <h2>Status stok makanan</h2>
          </div>

          <p>Data otomatis berdasarkan makanan yang kamu input.</p>
        </div>

        <div className="summary-grid-pro">
          {summaryItems.map((item, index) => (
            <div
              className={`summary-card-pro ${item.color}`}
              key={`${item.title}-${index}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="summary-card-shine"></div>

              <div className="summary-top">
                <div className="summary-icon-pro">{item.icon}</div>

                <div className="summary-meta">{item.meta}</div>
              </div>

              <div className="summary-content">
                <p>{item.title}</p>

                <h3>{item.value}</h3>

                <span>{item.description}</span>
              </div>

              <div className="summary-progress-area">
                <div className="summary-progress-info">
                  <small>Proporsi data</small>
                  <strong>{item.progress}%</strong>
                </div>

                <div className="summary-progress-track">
                  <div
                    className="summary-progress-fill"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SummaryGrid;