import { useNavigate } from 'react-router-dom';

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
      <div className="header-left">
        <div className="app-logo">
          <span>S</span>
        </div>

        <div>
          <p className="header-eyebrow">SaveByUp Dashboard</p>
          <h1>Halo, {user?.name || 'User'} 👋</h1>
          <p className="header-subtitle">
            Pantau stok makanan, prioritas kedaluwarsa, dan marketplace COD.
          </p>
        </div>
      </div>

      <div className="header-right">
        <div className="user-card-mini">
          <div className="user-avatar">{initial}</div>
          <div>
            <strong>{user?.name || 'User'}</strong>
            <span>Mahasiswa Kos UMY</span>
          </div>
        </div>

        <button className="logout-pro-btn" onClick={handleLogout}>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;