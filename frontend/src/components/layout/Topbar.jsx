import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../../services/authService";

import "./styles/topbar.css";

function getInitial(user) {
  const name = user?.name || user?.nama || user?.email || "S";
  return name.charAt(0).toUpperCase();
}

export default function Topbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  return (
    <header className="app-topbar">
      <div>
        <p className="app-topbar-label">Mahasiswa Kos UMY</p>
        <h2>Inventaris & Marketplace Makanan</h2>
      </div>

      <div className="app-user">
        <button
          type="button"
          className="app-notification-button"
          onClick={() => navigate("/notifications")}
          title="Lihat notifikasi"
        >
          🔔
        </button>

        <div className="app-avatar">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name || "User"} />
          ) : (
            <span>{getInitial(user)}</span>
          )}
        </div>

        <div className="app-user-info">
          <strong>{user?.name || "Pengguna"}</strong>
          <span>{user?.email || "SaveByUp User"}</span>
        </div>

        <button
          type="button"
          className="app-profile-button"
          onClick={() => navigate("/profile")}
        >
          Profil
        </button>
      </div>
    </header>
  );
}