import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";

import {
  approveRequest,
  getIncomingRequests,
  rejectRequest,
} from "../../services/marketplaceService";

import RequestCard from "./components/RequestCard";

import "./styles/incomingRequests.css";

const normalizeRequestStatus = (status = "") => {
  const value = String(status || "").toLowerCase();

  const map = {
    menunggu: "pending",
    pending: "pending",

    disetujui: "accepted",
    diterima: "accepted",
    accepted: "accepted",

    ditolak: "rejected",
    rejected: "rejected",

    dibatalkan: "cancelled",
    cancelled: "cancelled",

    selesai: "completed",
    completed: "completed",
  };

  return map[value] || value || "pending";
};

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setNotice("");

      const data = await getIncomingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil pengajuan masuk:", error);
      setRequests([]);
      setNotice(
        error.response?.data?.message ||
          "Gagal mengambil daftar pengajuan pembelian."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const requestStats = useMemo(() => {
    const stats = {
      total: requests.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    requests.forEach((request) => {
      const status = normalizeRequestStatus(request.status);

      if (status === "pending") {
        stats.pending += 1;
      }

      if (status === "accepted" || status === "completed") {
        stats.approved += 1;
      }

      if (status === "rejected" || status === "cancelled") {
        stats.rejected += 1;
      }
    });

    return stats;
  }, [requests]);

  const handleApprove = async (request) => {
    const status = normalizeRequestStatus(request.status);

    if (status === "accepted" || status === "completed") {
      setNotice("Pengajuan ini sudah disetujui atau sudah selesai.");
      return;
    }

    if (status === "rejected" || status === "cancelled") {
      setNotice("Pengajuan yang sudah ditolak atau dibatalkan tidak bisa disetujui.");
      return;
    }

    const ok = window.confirm(`Setujui pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await approveRequest(request.id);
      setNotice("Pengajuan berhasil disetujui.");
      await fetchRequests();
    } catch (error) {
      console.error("Gagal menyetujui pengajuan:", error);
      setNotice(
        error.response?.data?.message ||
          "Pengajuan belum bisa disetujui. Coba lagi nanti."
      );
    }
  };

  const handleReject = async (request) => {
    const status = normalizeRequestStatus(request.status);

    if (status === "accepted" || status === "completed") {
      setNotice("Pengajuan yang sudah disetujui atau selesai tidak bisa ditolak.");
      return;
    }

    if (status === "rejected" || status === "cancelled") {
      setNotice("Pengajuan ini sudah ditolak atau dibatalkan.");
      return;
    }

    const ok = window.confirm(`Tolak pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await rejectRequest(request.id);
      setNotice("Pengajuan berhasil ditolak.");
      await fetchRequests();
    } catch (error) {
      console.error("Gagal menolak pengajuan:", error);
      setNotice(
        error.response?.data?.message ||
          "Pengajuan belum bisa ditolak. Coba lagi nanti."
      );
    }
  };

  return (
    <AppShell>
      <main className="incoming-page">
        <section className="incoming-hero">
          <div className="incoming-hero-content">
            <span>Purchase Requests</span>
            <h2>Kelola pengajuan pembelian dengan lebih rapi.</h2>
            <p>
              Pengajuan dari calon pembeli akan tampil di sini. Kamu bisa
              mengecek jumlah, harga penawaran, dan catatan pembeli sebelum
              menerima atau menolak pengajuan.
            </p>
          </div>
        </section>

        <section className="incoming-summary">
          <div className="incoming-summary-card">
            <span>Total Pengajuan</span>
            <strong>{loading ? "..." : requestStats.total}</strong>
            <p>Semua pengajuan pembelian yang masuk ke produk kamu.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Menunggu</span>
            <strong>{loading ? "..." : requestStats.pending}</strong>
            <p>Pengajuan yang masih perlu kamu cek dan putuskan.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Disetujui</span>
            <strong>{loading ? "..." : requestStats.approved}</strong>
            <p>Pengajuan yang sudah bisa dilanjutkan ke komunikasi.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Ditolak</span>
            <strong>{loading ? "..." : requestStats.rejected}</strong>
            <p>Pengajuan yang tidak dilanjutkan ke proses transaksi.</p>
          </div>
        </section>

        {notice && <div className="incoming-notice">{notice}</div>}

        {loading ? (
          <section className="incoming-state">
            <div className="incoming-loader" />
            <h3>Memuat pengajuan...</h3>
            <p>Sedang mengambil daftar pengajuan pembelian.</p>
          </section>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Belum ada pengajuan masuk"
            description="Pengajuan pembelian dari calon pembeli akan muncul di halaman ini."
          />
        ) : (
          <section className="incoming-list">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={{
                  ...request,
                  status: normalizeRequestStatus(request.status),
                }}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
              />
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}