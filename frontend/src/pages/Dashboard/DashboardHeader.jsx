import { useNavigate } from 'react-router-dom';

function IconLeafLogo() {
  return (
    <svg viewBox="0 0 24 24" className="header-logo-icon">
      <path d="M19 5c-7.2.3-12 3.9-12 9.4 0 2.7 1.9 4.6 4.5 4.6C16.9 19 19 12.6 19 5z" />
      <path d="M7 19c2.4-4.6 5.5-7.3 9.2-9" />
    </svg>
  );
}

function IconInventory() {
  return (
    <svg viewBox="0 0 24 24" className="header-mini-icon">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="header-mini-icon">
      <path d="M10 6H6v12h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

function DashboardHeader({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="dashboard-header-pro">
      <div className="dashboard-header-inner">
        <div className="header-brand-area">
          <div className="app-logo">
            <IconLeafLogo />
          </div>

          <div className="header-title-block">
            <div className="header-eyebrow">
              <IconInventory />
              <span>SaveByUp Dashboard</span>
            </div>

            <h1>Halo, {user?.name || 'User'} 👋</h1>

            <p className="header-subtitle">
              Pantau stok makanan, prioritas kedaluwarsa, dan marketplace COD.
            </p>
          </div>
        </div>

        <div className="header-action-area">
          <div className="user-card-mini">
            <div className="user-avatar">{initial}</div>

            <div className="user-card-text">
              <strong>{user?.name || 'User'}</strong>
              <span>Mahasiswa Kos UMY</span>
            </div>
          </div>

          <button type="button" className="logout-pro-btn" onClick={handleLogout}>
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;