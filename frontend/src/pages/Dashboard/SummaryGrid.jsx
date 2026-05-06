function SummaryGrid({ summary }) {
  const summaryItems = [
    {
      title: 'Total Makanan',
      value: summary.total_foods,
      description: 'Semua stok makanan yang tercatat',
      icon: '📦',
      color: 'green',
    },
    {
      title: 'Makanan Aman',
      value: summary.total_aman,
      description: 'Masih jauh dari tanggal kedaluwarsa',
      icon: '✅',
      color: 'blue',
    },
    {
      title: 'Hampir Kedaluwarsa',
      value: summary.total_mendekati,
      description: 'Perlu segera dikonsumsi atau dijual',
      icon: '⏰',
      color: 'orange',
    },
    {
      title: 'Kedaluwarsa',
      value: summary.total_kedaluwarsa,
      description: 'Tidak layak untuk dikonsumsi',
      icon: '⚠️',
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