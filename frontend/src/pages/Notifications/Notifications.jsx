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

      window.dispatchEvent(new Event("savebyup:badges-refresh"));
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

  const notificationStats = useMemo(() => {
    return notifications.reduce(
      (stats, notification) => {
        stats.total += 1;

        if (!notification.is_read) {
          stats.unread += 1;
        }

        if (notification.type === "expiry") {
          stats.expiry += 1;
        }

        if (notification.type === "request") {
          stats.request += 1;
        }

        if (notification.type === "transaction") {
          stats.transaction += 1;
        }

        if (notification.type === "system") {
          stats.system += 1;
        }

        return stats;
      },
      {
        total: 0,
        unread: 0,
        expiry: 0,
        request: 0,
        transaction: 0,
        system: 0,
      }
    );
  }, [notifications]);

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return;

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
      <main className="notifications-page">
        <div className="notifications-orb notifications-orb-one" />
        <div className="notifications-orb notifications-orb-two" />

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

        <section className="notifications-hero">
          <div className="notifications-hero-content">
            <span>Notification Center</span>
            <h2>Jangan sampai stok makanan terlewat begitu saja.</h2>
            <p>
              Notifikasi membantu kamu mengambil keputusan lebih cepat: gunakan
              makanan yang mendekati kedaluwarsa, cek pengajuan pembelian, dan
              pantau transaksi marketplace.
            </p>
          </div>

          <div className="notifications-hero-card">
            <span>Belum Dibaca</span>
            <strong>{loading ? "..." : notificationStats.unread}</strong>
            <p>Notifikasi yang masih perlu kamu cek.</p>
          </div>
        </section>

        <section className="notification-summary">
          <div className="notification-summary-card">
            <span>Total Notifikasi</span>
            <strong>{loading ? "..." : notificationStats.total}</strong>
            <p>Semua informasi yang masuk ke akun kamu.</p>
          </div>

          <div className="notification-summary-card">
            <span>Reminder</span>
            <strong>{loading ? "..." : notificationStats.expiry}</strong>
            <p>Pengingat makanan mendekati kedaluwarsa.</p>
          </div>

          <div className="notification-summary-card">
            <span>Pengajuan</span>
            <strong>{loading ? "..." : notificationStats.request}</strong>
            <p>Info terkait negosiasi dan pembelian.</p>
          </div>

          <div className="notification-summary-card">
            <span>Transaksi</span>
            <strong>{loading ? "..." : notificationStats.transaction}</strong>
            <p>Perkembangan transaksi marketplace.</p>
          </div>
        </section>

        <section className="notification-filter">
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
          <div className="notification-state">
            <div className="notification-loader" />
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
                className="sb-btn notification-btn-outline"
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
      </main>
    </AppShell>
  );
}