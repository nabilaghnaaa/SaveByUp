import { useNavigate } from 'react-router-dom';

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="mini-svg-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" className="mini-svg-icon">
      <path d="M12 4l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6L7.2 19l.9-5.4-3.9-3.8 5.4-.8L12 4z" />
    </svg>
  );
}

function IconFood() {
  return (
    <svg viewBox="0 0 24 24" className="phone-svg-icon">
      <path d="M7 3v18" />
      <path d="M5 3v5a2 2 0 0 0 4 0V3" />
      <path d="M15 3v18" />
      <path d="M15 3c3 1.2 4.5 3.5 4.5 7 0 2.5-1.3 4-4.5 4" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="mini-svg-icon">
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
      <path d="M3 5h2l2.2 10h9.8l2-7H7" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="mini-svg-icon">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function InfoBanner({ user }) {
  const navigate = useNavigate();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const scrollToInventory = () => {
    const inventorySection = document.getElementById('dashboard-inventory');

    if (inventorySection) {
      inventorySection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section className="hero-pro hero-banner-full">
      <div className="hero-topbar">
        <div className="hero-brand">
          <div className="hero-brand-mark">S</div>
          <span>SaveByUp</span>
        </div>

        <div className="hero-user-actions">
          <div className="hero-user-card">
            <div className="hero-user-avatar">{initial}</div>

            <div>
              <strong>{user?.name || 'User'}</strong>
              <span>Mahasiswa Kos UMY</span>
            </div>
          </div>

          <button type="button" className="hero-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

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
          <button
            type="button"
            className="hero-primary-btn"
            onClick={() => navigate('/foods/add')}
          >
            <span className="button-icon-svg">
              <IconPlus />
            </span>
            Tambah Stok Makanan
          </button>

          <button
            type="button"
            className="hero-secondary-btn"
            onClick={scrollToInventory}
          >
            <span className="button-icon-svg">
              <IconCart />
            </span>
            Lihat Inventaris
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
        <div className="hero-visual-wrap">
          <div className="phone-mockup">
            <div className="phone-glow"></div>
            <div className="phone-top"></div>

            <div className="phone-card food-card-main">
              <div className="food-icon">
                <IconFood />
              </div>

              <div>
                <strong>Smart Inventory</strong>
                <span>Monitoring makanan harian</span>
              </div>
            </div>

            <div className="phone-list">
              <div className="phone-list-item">
                <span className="list-dot red-dot"></span>

                <div>
                  <strong>Roti Tawar</strong>
                  <p>Prioritas tinggi</p>
                </div>

                <b>1 hari</b>
              </div>

              <div className="phone-list-item">
                <span className="list-dot yellow-dot"></span>

                <div>
                  <strong>Susu Kotak</strong>
                  <p>Prioritas sedang</p>
                </div>

                <b>3 hari</b>
              </div>

              <div className="phone-list-item">
                <span className="list-dot green-dot"></span>

                <div>
                  <strong>Mi Instan</strong>
                  <p>Aman dikonsumsi</p>
                </div>

                <b>14 hari</b>
              </div>
            </div>
          </div>

          <div className="floating-widget widget-top">
            <span className="floating-icon-wrap">
              <IconClock />
            </span>

            <div>
              <strong>Reminder Aktif</strong>
              <p>Makanan mendekati kedaluwarsa</p>
            </div>
          </div>

          <div className="floating-widget widget-bottom">
            <span className="floating-icon-wrap">
              <IconStar />
            </span>

            <div>
              <strong>Reputasi</strong>
              <p>Rating setelah COD selesai</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InfoBanner;