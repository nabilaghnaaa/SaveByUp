import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import {
  generateExpiryNotifications,
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import NotificationCard from "./components/NotificationCard";

import "./styles/notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("semua");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengambil data notifikasi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "semua") return notifications;

    if (activeFilter === "belum_dibaca") {
      return notifications.filter((notification) => !notification.is_read);
    }

    return notifications.filter(
      (notification) => notification.type === activeFilter
    );
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const handleMarkAsRead = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      await fetchNotifications();
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal menandai notifikasi sebagai dibaca."
      );
    }
  };

  const handleGenerateExpiryNotifications = async () => {
    try {
      setGenerating(true);
      setMessage("");

      await generateExpiryNotifications();

      setMessage("Reminder kedaluwarsa berhasil dibuat.");
      await fetchNotifications();
    } catch (error) {
      console.error("Gagal membuat reminder kedaluwarsa:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal membuat reminder kedaluwarsa."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        label="Notifikasi"
        title="Pusat Notifikasi"
        description="Pantau pengingat makanan mendekati kedaluwarsa, pengajuan marketplace, transaksi, dan informasi penting lainnya."
        action={
          <button
            type="button"
            className="sb-btn sb-btn-primary"
            onClick={handleGenerateExpiryNotifications}
            disabled={generating}
          >
            {generating ? "Membuat..." : "Generate Reminder"}
          </button>
        }
      />

      <section className="notification-summary">
        <div className="notification-summary-card sb-glass">
          <span>Total Notifikasi</span>
          <strong>{notifications.length}</strong>
          <p>Semua notifikasi yang masuk ke akun kamu.</p>
        </div>

        <div className="notification-summary-card sb-glass">
          <span>Belum Dibaca</span>
          <strong>{unreadCount}</strong>
          <p>Notifikasi yang masih perlu kamu cek.</p>
        </div>

        <div className="notification-summary-card sb-glass">
          <span>Reminder</span>
          <strong>
            {
              notifications.filter(
                (notification) => notification.type === "expiry"
              ).length
            }
          </strong>
          <p>Pengingat makanan yang mendekati kedaluwarsa.</p>
        </div>
      </section>

      <section className="notification-filter sb-glass">
        <button
          type="button"
          className={activeFilter === "semua" ? "active" : ""}
          onClick={() => setActiveFilter("semua")}
        >
          Semua
        </button>

        <button
          type="button"
          className={activeFilter === "belum_dibaca" ? "active" : ""}
          onClick={() => setActiveFilter("belum_dibaca")}
        >
          Belum Dibaca
        </button>

        <button
          type="button"
          className={activeFilter === "expiry" ? "active" : ""}
          onClick={() => setActiveFilter("expiry")}
        >
          Kedaluwarsa
        </button>

        <button
          type="button"
          className={activeFilter === "request" ? "active" : ""}
          onClick={() => setActiveFilter("request")}
        >
          Pengajuan
        </button>

        <button
          type="button"
          className={activeFilter === "transaction" ? "active" : ""}
          onClick={() => setActiveFilter("transaction")}
        >
          Transaksi
        </button>

        <button
          type="button"
          className={activeFilter === "system" ? "active" : ""}
          onClick={() => setActiveFilter("system")}
        >
          Sistem
        </button>
      </section>

      {message && <div className="notification-message">{message}</div>}

      {loading ? (
        <div className="notification-state sb-glass">
          <h3>Memuat notifikasi...</h3>
          <p>Sedang mengambil data notifikasi dari server.</p>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Notifikasi kedaluwarsa, pengajuan pembelian, dan transaksi akan muncul di sini."
        />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi pada filter ini"
          description="Coba pilih filter lain untuk melihat notifikasi yang tersedia."
          action={
            <button
              type="button"
              className="sb-btn sb-btn-ghost"
              onClick={() => setActiveFilter("semua")}
            >
              Lihat Semua
            </button>
          }
        />
      ) : (
        <section className="notification-list">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={() => handleMarkAsRead(notification)}
            />
          ))}
        </section>
      )}
    </AppShell>
  );
}