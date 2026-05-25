import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";

import {
  approveRequest,
  getIncomingRequests,
  rejectRequest,
} from "../../services/marketplaceService";

import RequestCard from "./components/RequestCard";

import "./styles/incomingRequests.css";

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
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCount = requests.filter(
    (request) => request.status === "menunggu"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "disetujui"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "ditolak"
  ).length;

  const handleApprove = async (request) => {
    const ok = window.confirm(`Setujui pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await approveRequest(request.id);
      setNotice("Pengajuan berhasil disetujui.");
      await fetchRequests();
    } catch {
      setNotice("Pengajuan belum bisa disetujui. Coba lagi nanti.");
    }
  };

  const handleReject = async (request) => {
    const ok = window.confirm(`Tolak pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await rejectRequest(request.id);
      setNotice("Pengajuan berhasil ditolak.");
      await fetchRequests();
    } catch {
      setNotice("Pengajuan belum bisa ditolak. Coba lagi nanti.");
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
            <strong>{loading ? "..." : requests.length}</strong>
            <p>Semua pengajuan pembelian yang masuk ke produk kamu.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Menunggu</span>
            <strong>{loading ? "..." : pendingCount}</strong>
            <p>Pengajuan yang masih perlu kamu cek dan putuskan.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Disetujui</span>
            <strong>{loading ? "..." : approvedCount}</strong>
            <p>Pengajuan yang sudah bisa dilanjutkan ke komunikasi.</p>
          </div>

          <div className="incoming-summary-card">
            <span>Ditolak</span>
            <strong>{loading ? "..." : rejectedCount}</strong>
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
                request={request}
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