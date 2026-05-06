function InfoBanner({ user }) {
  return (
    <section className="hero-pro">
      <div className="hero-left">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          Food Waste Prevention System
        </div>

        <h2>
          Kelola makananmu,
          <span> kurangi food waste.</span>
        </h2>

        <p>
          SaveByUp membantu mahasiswa kos mencatat stok makanan, memantau
          kedaluwarsa, menentukan prioritas, dan memanfaatkan makanan layak
          konsumsi melalui marketplace COD.
        </p>

        <div className="hero-actions">
          <button className="hero-primary-btn">
            <span>＋</span>
            Tambah Stok Makanan
          </button>

          <button className="hero-secondary-btn">
            <span>🛒</span>
            Lihat Marketplace
          </button>
        </div>

        <div className="hero-stats-row">
          <div>
            <strong>COD</strong>
            <span>Transaksi langsung</span>
          </div>
          <div>
            <strong>Rating</strong>
            <span>Reputasi pengguna</span>
          </div>
          <div>
            <strong>Priority</strong>
            <span>Deteksi kedaluwarsa</span>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="phone-mockup">
          <div className="phone-top"></div>

          <div className="phone-card food-card-main">
            <div className="food-icon">🥗</div>
            <div>
              <strong>Smart Inventory</strong>
              <span>Monitoring makanan harian</span>
            </div>
          </div>

          <div className="phone-list">
            <div className="phone-list-item">
              <span>🍞</span>
              <div>
                <strong>Roti Tawar</strong>
                <p>Prioritas tinggi</p>
              </div>
              <b>1 hari</b>
            </div>

            <div className="phone-list-item">
              <span>🥛</span>
              <div>
                <strong>Susu Kotak</strong>
                <p>Prioritas sedang</p>
              </div>
              <b>3 hari</b>
            </div>

            <div className="phone-list-item">
              <span>🍜</span>
              <div>
                <strong>Mi Instan</strong>
                <p>Aman dikonsumsi</p>
              </div>
              <b>14 hari</b>
            </div>
          </div>
        </div>

        <div className="floating-widget widget-top">
          <span>⏰</span>
          <div>
            <strong>Reminder Aktif</strong>
            <p>Makanan mendekati kedaluwarsa</p>
          </div>
        </div>

        <div className="floating-widget widget-bottom">
          <span>⭐</span>
          <div>
            <strong>Reputasi</strong>
            <p>Rating setelah COD selesai</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfoBanner;