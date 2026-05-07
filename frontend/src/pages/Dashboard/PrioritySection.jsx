function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M13 3s1 3-1.5 5.5C9.5 10.5 8 12 8 15a4 4 0 0 0 8 0c0-2-1-3.5-2-5 3 .8 5 3.4 5 6.5A7 7 0 0 1 5 16c0-4.5 3-7 5-9 1.2-1.2 2-2.5 3-4z" />
    </svg>
  );
}

function IconHourglass() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M7 4h10" />
      <path d="M7 20h10" />
      <path d="M8 4c0 4 4 5 4 8s-4 4-4 8" />
      <path d="M16 4c0 4-4 5-4 8s4 4 4 8" />
      <path d="M10 16h4" />
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M19 5c-7.5.3-12 3.8-12 9.5 0 2.5 1.7 4.5 4.4 4.5 5.4 0 7.6-6.6 7.6-14z" />
      <path d="M7 19c2.5-4.7 5.5-7.5 9-9" />
    </svg>
  );
}

function PrioritySection({ summary }) {
  const priorities = [
    {
      title: 'Prioritas Tinggi',
      value: summary.total_prioritas_tinggi,
      description: 'Kedaluwarsa hari ini atau besok. Segera konsumsi atau jual.',
      icon: <IconFlame />,
      color: 'high',
      progress: 90,
    },
    {
      title: 'Prioritas Sedang',
      value: summary.total_prioritas_sedang,
      description: 'Kedaluwarsa dalam 2–3 hari. Perlu diperhatikan.',
      icon: <IconHourglass />,
      color: 'medium',
      progress: 60,
    },
    {
      title: 'Prioritas Rendah',
      value: summary.total_prioritas_rendah,
      description: 'Masih relatif aman dan belum mendesak.',
      icon: <IconLeaf />,
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