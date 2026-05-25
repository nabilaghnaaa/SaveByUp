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
    } catch (error) {
      setRequests([]);
      setNotice("");
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
      setNotice("Pengajuan berhasil disetujui.");
      await fetchRequests();
    } catch (error) {
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
    } catch (error) {
      setNotice("Pengajuan belum bisa ditolak. Coba lagi nanti.");
    }
  };

  return (
    <AppShell>
      <main className="incoming-page">
        <section className="incoming-top">
          <div className="incoming-heading">
            <span>Pengajuan Masuk</span>
            <h1>Kelola permintaan pembelian.</h1>
            <p>
              Lihat pengajuan dari calon pembeli, lalu setujui atau tolak
              sebelum komunikasi dilanjutkan.
            </p>
          </div>

          <div className="incoming-count-card">
            <span>Total</span>
            <strong>{loading ? "..." : requests.length}</strong>
          </div>
        </section>

        {notice && <div className="incoming-notice">{notice}</div>}

        {loading ? (
          <section className="incoming-state">
            <div className="marketplace-loader" />
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