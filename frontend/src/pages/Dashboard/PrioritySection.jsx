function PrioritySection({ summary }) {
  const priorities = [
    {
      title: 'Prioritas Tinggi',
      value: summary.total_prioritas_tinggi,
      description: 'Kedaluwarsa hari ini atau besok. Segera konsumsi atau jual.',
      icon: '🔥',
      color: 'high',
      progress: 90,
    },
    {
      title: 'Prioritas Sedang',
      value: summary.total_prioritas_sedang,
      description: 'Kedaluwarsa dalam 2–3 hari. Perlu diperhatikan.',
      icon: '⏳',
      color: 'medium',
      progress: 60,
    },
    {
      title: 'Prioritas Rendah',
      value: summary.total_prioritas_rendah,
      description: 'Masih relatif aman dan belum mendesak.',
      icon: '🌿',
      color: 'low',
      progress: 35,
    },
  ];

  return (
    <section className="dashboard-section">
      <div className="section-heading-pro">
        <div>
          <span>Prioritas Makanan</span>
          <h2>Rekomendasi tindakan</h2>
        </div>

        <p>Bantu menentukan makanan mana yang harus diprioritaskan.</p>
      </div>

      <div className="priority-grid-pro">
        {priorities.map((item, index) => (
          <div
            className={`priority-card-pro ${item.color}`}
            key={item.title}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="priority-main">
              <div className="priority-icon-pro">{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>

              <div className="priority-number-pro">{item.value}</div>
            </div>

            <div className="priority-progress">
              <div style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PrioritySection;