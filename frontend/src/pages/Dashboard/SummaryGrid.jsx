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

function SummaryGrid({ summary }) {
  const summaryItems = [
    {
      title: 'Total Makanan',
      value: summary.total_foods,
      description: 'Semua stok makanan yang tercatat',
      icon: <IconBox />,
      color: 'green',
    },
    {
      title: 'Makanan Aman',
      value: summary.total_aman,
      description: 'Masih jauh dari tanggal kedaluwarsa',
      icon: <IconCheck />,
      color: 'blue',
    },
    {
      title: 'Hampir Kedaluwarsa',
      value: summary.total_mendekati,
      description: 'Perlu segera dikonsumsi atau dijual',
      icon: <IconClock />,
      color: 'orange',
    },
    {
      title: 'Kedaluwarsa',
      value: summary.total_kedaluwarsa,
      description: 'Tidak layak untuk dikonsumsi',
      icon: <IconWarning />,
      color: 'red',
    },
  ];

  return (
    <section className="dashboard-section">
      <div className="section-heading-pro">
        <div>
          <span>Ringkasan Inventaris</span>
          <h2>Status stok makanan</h2>
        </div>

        <p>Data otomatis berdasarkan makanan yang kamu input.</p>
      </div>

      <div className="summary-grid-pro">
        {summaryItems.map((item, index) => (
          <div
            className={`summary-card-pro ${item.color}`}
            key={item.title}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="summary-top">
              <div className="summary-icon-pro">{item.icon}</div>
              <div className="summary-glow"></div>
            </div>

            <div>
              <p>{item.title}</p>
              <h3>{item.value}</h3>
              <span>{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SummaryGrid;