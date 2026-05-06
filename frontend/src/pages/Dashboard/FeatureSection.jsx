function FeatureSection() {
  const features = [
    {
      title: 'Inventaris Makanan',
      description:
        'Tambah, edit, hapus, dan pantau stok makanan pribadi dengan status kedaluwarsa otomatis.',
      icon: '📦',
      status: 'Tahap berikutnya',
      buttonText: 'Kelola Inventaris',
      color: 'feature-green',
    },
    {
      title: 'Marketplace COD',
      description:
        'Jual makanan layak konsumsi kepada mahasiswa lain melalui sistem COD yang disepakati.',
      icon: '🛒',
      status: 'Segera dibuat',
      buttonText: 'Buka Marketplace',
      color: 'feature-orange',
    },
    {
      title: 'Rating & Reputasi',
      description:
        'Tampilkan rating, jumlah transaksi selesai, transaksi batal, dan ulasan pengguna.',
      icon: '⭐',
      status: 'Segera dibuat',
      buttonText: 'Lihat Reputasi',
      color: 'feature-blue',
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

            <button disabled>
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