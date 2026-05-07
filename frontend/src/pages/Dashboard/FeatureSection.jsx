function IconInventory() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M4 7h16v13H4V7z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function IconMarket() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <path d="M5 9h14l-1 11H6L5 9z" />
      <path d="M8 9a4 4 0 0 1 8 0" />
      <path d="M9 14h6" />
    </svg>
  );
}

function IconReputation() {
  return (
    <svg viewBox="0 0 24 24" className="card-svg-icon">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21a6 6 0 0 1 12 0" />
      <path d="M18 5l1 2 2 .3-1.5 1.4.4 2.1L18 9.8l-1.9 1 .4-2.1L15 7.3l2-.3 1-2z" />
    </svg>
  );
}

function FeatureSection() {
  const scrollToInventory = () => {
    const inventorySection = document.getElementById('dashboard-inventory');

    if (inventorySection) {
      inventorySection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const features = [
    {
      title: 'Inventaris Makanan',
      description:
        'Tambah, edit, hapus, dan pantau stok makanan langsung dari dashboard.',
      icon: <IconInventory />,
      status: 'Aktif',
      buttonText: 'Lihat Inventaris',
      color: 'feature-green',
      disabled: false,
      action: scrollToInventory,
    },
    {
      title: 'Marketplace COD',
      description:
        'Jual makanan layak konsumsi kepada mahasiswa lain melalui sistem COD yang disepakati.',
      icon: <IconMarket />,
      status: 'Segera dibuat',
      buttonText: 'Buka Marketplace',
      color: 'feature-orange',
      disabled: true,
      action: null,
    },
    {
      title: 'Rating & Reputasi',
      description:
        'Tampilkan rating, jumlah transaksi selesai, transaksi batal, dan ulasan pengguna.',
      icon: <IconReputation />,
      status: 'Segera dibuat',
      buttonText: 'Lihat Reputasi',
      color: 'feature-blue',
      disabled: true,
      action: null,
    },
  ];

  return (
    <section className="dashboard-section feature-section-pro">
      <div className="section-heading-pro">
        <div>
          <span>Fitur Sistem</span>
          <h2>Modul utama SaveByUp</h2>
        </div>

        <p>Fitur dikembangkan bertahap sesuai konsep penelitian.</p>
      </div>

      <div className="feature-grid-pro">
        {features.map((feature, index) => (
          <div
            className={`feature-card-pro ${feature.color}`}
            key={feature.title}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="feature-card-header">
              <div className="feature-icon-pro">{feature.icon}</div>
              <span>{feature.status}</span>
            </div>

            <h3>{feature.title}</h3>
            <p>{feature.description}</p>

            <button
              type="button"
              disabled={feature.disabled}
              onClick={feature.action}
            >
              {feature.buttonText}
              <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;