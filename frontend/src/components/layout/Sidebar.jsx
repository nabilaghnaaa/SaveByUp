import { NavLink, useNavigate } from "react-router-dom";

import { logoutUser } from "../../services/authService";

import "./styles/sidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    key: "D",
  },
  {
    label: "Tambah Makanan",
    path: "/foods/add",
    key: "+",
  },
  {
    label: "Marketplace",
    path: "/marketplace",
    key: "M",
  },
  {
    label: "Pengajuan Masuk",
    path: "/marketplace/requests",
    key: "P",
  },
  {
    label: "Notifikasi",
    path: "/notifications",
    key: "N",
  },
  {
    label: "Riwayat",
    path: "/transactions",
    key: "R",
  },
  {
    label: "Profil",
    path: "/profile",
    key: "U",
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
            <span className="sidebar-icon">{item.key}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>Tips</span>
        <p>Prioritaskan makanan yang paling dekat kedaluwarsa.</p>
      </div>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}