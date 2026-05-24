import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../services/authService";

import "./styles/sidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "🏠",
  },
  {
    label: "Tambah Makanan",
    path: "/foods/add",
    icon: "➕",
  },
  {
    label: "Marketplace",
    path: "/marketplace",
    icon: "🛒",
  },
  {
    label: "Pengajuan Masuk",
    path: "/marketplace/requests",
    icon: "🤝",
  },
  {
    label: "Notifikasi",
    path: "/notifications",
    icon: "🔔",
  },
  {
    label: "Riwayat",
    path: "/transactions",
    icon: "🧾",
  },
  {
    label: "Profil",
    path: "/profile",
    icon: "👤",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = window.confirm("Yakin ingin logout dari SaveByUp?");

    if (!ok) return;

    await logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">S</div>

        <div>
          <strong>SaveByUp</strong>
          <span>Food Waste Prevention</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>Tips Hari Ini</span>
        <p>
          Gunakan makanan yang paling dekat kedaluwarsa terlebih dahulu agar
          tidak terbuang.
        </p>
      </div>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}