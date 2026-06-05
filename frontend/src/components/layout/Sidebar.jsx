import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  HiOutlineBell,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineUserCircle,
} from "react-icons/hi2";

import { PiBowlFoodBold } from "react-icons/pi";

import { logoutUser } from "../../services/authService";
import { getIncomingRequests } from "../../services/marketplaceService";
import { getNotifications } from "../../services/notificationService";

import "./styles/sidebar.css";

const formatBadge = (value) => {
  const number = Number(value || 0);

  if (number <= 0) return "";
  if (number > 99) return "99+";

  return String(number);
};

const normalizeRequestStatus = (status = "") => {
  const value = String(status || "").toLowerCase();

  const map = {
    menunggu: "pending",
    pending: "pending",
    waiting: "pending",
    menunggu_konfirmasi: "pending",
    menunggu_komunikasi: "pending",

    disetujui: "accepted",
    diterima: "accepted",
    accepted: "accepted",

    ditolak: "rejected",
    rejected: "rejected",

    selesai: "completed",
    completed: "completed",

    dibatalkan: "cancelled",
    cancelled: "cancelled",
  };

  return map[value] || value || "pending";
};

const isPendingRequest = (request = {}) => {
  const status = normalizeRequestStatus(request.status);

  return status === "pending";
};

const isUnreadNotification = (notification = {}) => {
  if (notification.is_read === true || notification.is_read === 1) return false;
  if (notification.read === true || notification.read === 1) return false;

  if (notification.is_read === false || notification.is_read === 0) return true;
  if (notification.read === false || notification.read === 0) return true;

  const status = String(notification.status || "").toLowerCase();

  if (status === "read" || status === "dibaca") return false;

  return status === "unread" || status === "belum_dibaca" || !notification.is_read;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [incomingBadge, setIncomingBadge] = useState(0);
  const [notificationBadge, setNotificationBadge] = useState(0);

  const currentPath = location.pathname;

  const menuItems = useMemo(
    () => [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <HiOutlineHome />,
        badge: 0,
        isActive: (path) => path === "/dashboard",
      },
      {
        label: "Tambah Makanan",
        path: "/foods/add",
        icon: <PiBowlFoodBold />,
        badge: 0,
        isActive: (path) =>
          path === "/foods/add" || path.startsWith("/foods/add/"),
      },
      {
        label: "Marketplace",
        path: "/marketplace",
        icon: <HiOutlineShoppingBag />,
        badge: 0,
        isActive: (path) => {
          if (path === "/marketplace") return true;
          if (path.startsWith("/marketplace/requests")) return false;
          if (path.startsWith("/marketplace/sell")) return false;

          return path.startsWith("/marketplace/");
        },
      },
      {
        label: "Pengajuan Masuk",
        path: "/marketplace/requests",
        icon: <HiOutlineClipboardDocumentList />,
        badge: incomingBadge,
        isActive: (path) =>
          path === "/marketplace/requests" ||
          path.startsWith("/marketplace/requests/"),
      },
      {
        label: "Notifikasi",
        path: "/notifications",
        icon: <HiOutlineBell />,
        badge: notificationBadge,
        isActive: (path) =>
          path === "/notifications" || path.startsWith("/notifications/"),
      },
      {
        label: "Riwayat",
        path: "/transactions",
        icon: <HiOutlineClock />,
        badge: 0,
        isActive: (path) =>
          path === "/transactions" || path.startsWith("/transactions/"),
      },
      {
        label: "Profil",
        path: "/profile",
        icon: <HiOutlineUserCircle />,
        badge: 0,
        isActive: (path) => path === "/profile",
      },
    ],
    [incomingBadge, notificationBadge]
  );

  const fetchSidebarBadges = async () => {
    try {
      const [incomingResult, notificationResult] = await Promise.allSettled([
        getIncomingRequests(),
        getNotifications(),
      ]);

      if (incomingResult.status === "fulfilled") {
        const requests = Array.isArray(incomingResult.value)
          ? incomingResult.value
          : [];

        setIncomingBadge(requests.filter(isPendingRequest).length);
      }

      if (notificationResult.status === "fulfilled") {
        const notifications = Array.isArray(notificationResult.value)
          ? notificationResult.value
          : [];

        setNotificationBadge(notifications.filter(isUnreadNotification).length);
      }
    } catch (error) {
      console.error("Gagal mengambil badge sidebar:", error);
    }
  };

  useEffect(() => {
    fetchSidebarBadges();

    const interval = setInterval(() => {
      fetchSidebarBadges();
    }, 30000);

    const handleRefreshBadges = () => {
      fetchSidebarBadges();
    };

    window.addEventListener("savebyup:badges-refresh", handleRefreshBadges);

    return () => {
      clearInterval(interval);
      window.removeEventListener("savebyup:badges-refresh", handleRefreshBadges);
    };
  }, []);

  useEffect(() => {
    fetchSidebarBadges();
  }, [location.pathname]);

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
        {menuItems.map((item) => {
          const active = item.isActive(currentPath);
          const badge = formatBadge(item.badge);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={active ? "active" : ""}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>

              {badge && <span className="sidebar-badge">{badge}</span>}
            </Link>
          );
        })}
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