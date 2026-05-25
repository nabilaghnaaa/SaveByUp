import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

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
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getIncomingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil pengajuan masuk:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal mengambil daftar pengajuan masuk."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    const ok = window.confirm(`Setujui pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await approveRequest(request.id);
      setMessage(
        "Pengajuan berhasil disetujui. Pembeli akan mendapat notifikasi dan transaksi akan dibuat."
      );
      await fetchRequests();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Gagal menyetujui pengajuan."
      );
    }
  };

  const handleReject = async (request) => {
    const ok = window.confirm(`Tolak pengajuan dari ${request.buyer_name}?`);

    if (!ok) return;

    try {
      await rejectRequest(request.id);
      setMessage("Pengajuan berhasil ditolak.");
      await fetchRequests();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Gagal menolak pengajuan."
      );
    }
  };

  return (
    <AppShell>
      <main className="incoming-page">
        <div className="incoming-orb incoming-orb-one" />
        <div className="incoming-orb incoming-orb-two" />

        <PageHeader
          label="Pengajuan Masuk"
          title="Daftar Pengajuan Pembelian"
          description="Lihat calon pembeli, jumlah pembelian, harga penawaran, lalu terima atau tolak pengajuan."
          action={
            <button
              type="button"
              className="sb-btn marketplace-btn-outline"
              onClick={fetchRequests}
            >
              Refresh
            </button>
          }
        />

        <section className="incoming-hero">
          <div>
            <span>Request Management</span>
            <h2>Kelola pengajuan sebelum lanjut ke WhatsApp.</h2>
            <p>
              Pembeli tidak langsung menghubungi penjual. Pengajuan harus
              disetujui terlebih dahulu agar alur transaksi lebih aman dan rapi.
            </p>
          </div>

          <strong>{loading ? "..." : requests.length}</strong>
        </section>

        {message && <div className="incoming-message">{message}</div>}

        {loading ? (
          <div className="incoming-state">
            <div className="marketplace-loader" />
            <h3>Memuat pengajuan...</h3>
            <p>Sedang mengambil daftar pengajuan pembelian.</p>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Belum ada pengajuan masuk"
            description="Pengajuan pembelian dan negosiasi dari calon pembeli akan muncul di sini."
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