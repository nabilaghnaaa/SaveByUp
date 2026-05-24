import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import {
  completeTransaction,
  getTransactions,
  rateTransaction,
} from "../../services/transactionService";

import RatingModal from "./components/RatingModal";
import TransactionCard from "./components/TransactionCard";

import "./styles/transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("semua");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengambil riwayat transaksi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "semua") return transactions;

    return transactions.filter(
      (transaction) => transaction.status === activeFilter
    );
  }, [transactions, activeFilter]);

  const totalMenunggu = transactions.filter(
    (transaction) => transaction.status === "menunggu_komunikasi"
  ).length;

  const totalSelesai = transactions.filter(
    (transaction) => transaction.status === "selesai"
  ).length;

  const totalDibatalkan = transactions.filter(
    (transaction) => transaction.status === "dibatalkan"
  ).length;

  const handleComplete = async (transaction) => {
    const ok = window.confirm("Tandai transaksi ini sebagai selesai?");

    if (!ok) return;

    try {
      await completeTransaction(transaction.id);
      setMessage("Transaksi berhasil ditandai selesai.");
      await fetchTransactions();
    } catch (error) {
      console.error("Gagal menyelesaikan transaksi:", error);
      setMessage(
        error.response?.data?.message || "Gagal menyelesaikan transaksi."
      );
    }
  };

  const handleRate = async (payload) => {
    if (!selectedTransaction) return;

    try {
      await rateTransaction(selectedTransaction.id, payload);
      setMessage("Rating dan ulasan berhasil diberikan.");
      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (error) {
      console.error("Gagal memberikan rating:", error);
      setMessage(error.response?.data?.message || "Gagal memberikan rating.");
    }
  };

  return (
    <AppShell>
      <PageHeader
        label="Riwayat"
        title="Riwayat Transaksi"
        description="Pantau transaksi pembelian dan penjualan, hubungi pihak terkait via WhatsApp, selesaikan transaksi, lalu beri rating."
        action={
          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={fetchTransactions}
          >
            Refresh
          </button>
        }
      />

      <section className="transaction-summary">
        <div className="transaction-summary-card sb-glass">
          <span>Total Transaksi</span>
          <strong>{transactions.length}</strong>
          <p>Semua transaksi yang melibatkan akun kamu.</p>
        </div>

        <div className="transaction-summary-card sb-glass">
          <span>Menunggu Komunikasi</span>
          <strong>{totalMenunggu}</strong>
          <p>Transaksi yang perlu dilanjutkan melalui WhatsApp.</p>
        </div>

        <div className="transaction-summary-card sb-glass">
          <span>Selesai</span>
          <strong>{totalSelesai}</strong>
          <p>Transaksi yang sudah selesai diproses.</p>
        </div>

        <div className="transaction-summary-card sb-glass">
          <span>Dibatalkan</span>
          <strong>{totalDibatalkan}</strong>
          <p>Transaksi yang tidak jadi dilanjutkan.</p>
        </div>
      </section>

      <section className="transaction-filter sb-glass">
        <button
          type="button"
          className={activeFilter === "semua" ? "active" : ""}
          onClick={() => setActiveFilter("semua")}
        >
          Semua
        </button>

        <button
          type="button"
          className={activeFilter === "menunggu_komunikasi" ? "active" : ""}
          onClick={() => setActiveFilter("menunggu_komunikasi")}
        >
          Menunggu Komunikasi
        </button>

        <button
          type="button"
          className={activeFilter === "selesai" ? "active" : ""}
          onClick={() => setActiveFilter("selesai")}
        >
          Selesai
        </button>

        <button
          type="button"
          className={activeFilter === "dibatalkan" ? "active" : ""}
          onClick={() => setActiveFilter("dibatalkan")}
        >
          Dibatalkan
        </button>
      </section>

      {message && <div className="transaction-message">{message}</div>}

      {loading ? (
        <div className="transaction-state sb-glass">
          <h3>Memuat transaksi...</h3>
          <p>Sedang mengambil riwayat transaksi dari server.</p>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Transaksi akan muncul setelah pengajuan pembelian marketplace disetujui."
        />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title="Tidak ada transaksi pada filter ini"
          description="Coba pilih filter lain untuk melihat transaksi yang tersedia."
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
        <section className="transaction-list">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onComplete={() => handleComplete(transaction)}
              onRate={() => setSelectedTransaction(transaction)}
            />
          ))}
        </section>
      )}

      {selectedTransaction && (
        <RatingModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSubmit={handleRate}
        />
      )}
    </AppShell>
  );
}