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

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M12 4l8 15H4L12 4z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
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

function getPercent(value, total) {
  if (!total || total <= 0) return 0;

  const percent = Math.round((value / total) * 100);

  return Math.min(percent, 100);
}

function SummaryGrid({ summary }) {
  const totalFoods = summary.total_foods || 0;

  const summaryItems = [
    {
      title: 'Total Makanan',
      value: summary.total_foods,
      description: 'Semua stok makanan yang tercatat',
      icon: <IconBox />,
      color: 'green',
      meta: 'Inventory',
      progress: totalFoods > 0 ? 100 : 0,
    },
    {
      title: 'Makanan Aman',
      value: summary.total_aman,
      description: 'Masih jauh dari tanggal kedaluwarsa',
      icon: <IconCheck />,
      color: 'emerald',
      meta: 'Safe Stock',
      progress: getPercent(summary.total_aman, totalFoods),
    },
    {
      title: 'Hampir Kedaluwarsa',
      value: summary.total_mendekati,
      description: 'Perlu segera dikonsumsi atau dijual',
      icon: <IconClock />,
      color: 'lime',
      meta: 'Urgent',
      progress: getPercent(summary.total_mendekati, totalFoods),
    },
    {
      title: 'Kedaluwarsa',
      value: summary.total_kedaluwarsa,
      description: 'Tidak layak untuk dikonsumsi',
      icon: <IconWarning />,
      color: 'danger',
      meta: 'Expired',
      progress: getPercent(summary.total_kedaluwarsa, totalFoods),
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

                <h3>{item.value || 0}</h3>

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