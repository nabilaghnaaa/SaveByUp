import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import {
  completeTransaction,
  confirmTransactionLocation,
  getTransactions,
  rateTransaction,
} from "../../services/transactionService";

import RatingModal from "./components/RatingModal";
import TransactionCard from "./components/TransactionCard";
import TransactionLocationPanel from "./components/TransactionLocationPanel";

import "./styles/transactions.css";

const normalizeFilterStatus = (status) => {
  const map = {
    menunggu_komunikasi: "waiting_cod",
    selesai: "completed",
    dibatalkan: "cancelled",
  };

  return map[status] || status;
};

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

    const normalizedFilter = normalizeFilterStatus(activeFilter);

    return transactions.filter(
      (transaction) => transaction.status === normalizedFilter
    );
  }, [transactions, activeFilter]);

  const totalMenunggu = transactions.filter((transaction) =>
    ["waiting_buyer_confirmation", "waiting_cod"].includes(transaction.status)
  ).length;

  const totalSelesai = transactions.filter(
    (transaction) => transaction.status === "completed"
  ).length;

  const totalDibatalkan = transactions.filter(
    (transaction) => transaction.status === "cancelled"
  ).length;

  const totalRating = transactions.filter(
    (transaction) => transaction.rating
  ).length;

  const handleConfirmLocation = async (transaction) => {
    const ok = window.confirm(
      "Konfirmasi untuk membuka lokasi detail pembeli dan penjual?"
    );

    if (!ok) return;

    try {
      await confirmTransactionLocation(transaction.id);
      setMessage("Lokasi COD berhasil dikonfirmasi dan dibuka.");
      await fetchTransactions();
    } catch (error) {
      console.error("Gagal mengonfirmasi lokasi:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengonfirmasi lokasi COD."
      );
    }
  };

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
      <main className="transactions-page">
        <div className="transactions-orb transactions-orb-one" />
        <div className="transactions-orb transactions-orb-two" />

        <PageHeader
          label="Riwayat"
          title="Riwayat Transaksi"
          description="Pantau transaksi pembelian dan penjualan, konfirmasi lokasi COD, hubungi pihak terkait, selesaikan transaksi, lalu beri rating untuk membangun kepercayaan."
          action={
            <button
              type="button"
              className="sb-btn transaction-btn-outline"
              onClick={fetchTransactions}
            >
              Refresh
            </button>
          }
        />

        <section className="transactions-hero">
          <div className="transactions-hero-content">
            <span>Transaction History</span>
            <h2>Setiap makanan yang terselamatkan punya jejak transaksi.</h2>
            <p>
              Riwayat transaksi membantu kamu melihat proses pembelian dan
              penjualan makanan layak konsumsi, mulai dari pengajuan, konfirmasi
              lokasi COD, komunikasi, sampai rating setelah transaksi selesai.
            </p>
          </div>

          <div className="transactions-hero-card">
            <span>Total Transaksi</span>
            <strong>{loading ? "..." : transactions.length}</strong>
            <p>Seluruh transaksi yang melibatkan akun kamu.</p>
          </div>
        </section>

        <section className="transaction-summary">
          <div className="transaction-summary-card">
            <span>Butuh Tindak Lanjut</span>
            <strong>{loading ? "..." : totalMenunggu}</strong>
            <p>Transaksi yang menunggu konfirmasi lokasi atau COD.</p>
          </div>

          <div className="transaction-summary-card">
            <span>Selesai</span>
            <strong>{loading ? "..." : totalSelesai}</strong>
            <p>Transaksi yang sudah selesai diproses.</p>
          </div>

          <div className="transaction-summary-card">
            <span>Dibatalkan</span>
            <strong>{loading ? "..." : totalDibatalkan}</strong>
            <p>Transaksi yang tidak jadi dilanjutkan.</p>
          </div>

          <div className="transaction-summary-card">
            <span>Sudah Dinilai</span>
            <strong>{loading ? "..." : totalRating}</strong>
            <p>Transaksi yang sudah memiliki rating atau ulasan.</p>
          </div>
        </section>

        <section className="transaction-filter">
          <button
            type="button"
            className={activeFilter === "semua" ? "active" : ""}
            onClick={() => setActiveFilter("semua")}
          >
            Semua
          </button>

          <button
            type="button"
            className={activeFilter === "waiting_buyer_confirmation" ? "active" : ""}
            onClick={() => setActiveFilter("waiting_buyer_confirmation")}
          >
            Konfirmasi Lokasi
          </button>

          <button
            type="button"
            className={activeFilter === "waiting_cod" ? "active" : ""}
            onClick={() => setActiveFilter("waiting_cod")}
          >
            Menunggu COD
          </button>

          <button
            type="button"
            className={activeFilter === "completed" ? "active" : ""}
            onClick={() => setActiveFilter("completed")}
          >
            Selesai
          </button>

          <button
            type="button"
            className={activeFilter === "cancelled" ? "active" : ""}
            onClick={() => setActiveFilter("cancelled")}
          >
            Dibatalkan
          </button>
        </section>

        {message && <div className="transaction-message">{message}</div>}

        {loading ? (
          <div className="transaction-state">
            <div className="transaction-loader" />
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
                className="sb-btn transaction-btn-outline"
                onClick={() => setActiveFilter("semua")}
              >
                Lihat Semua
              </button>
            }
          />
        ) : (
          <section className="transaction-list">
            {filteredTransactions.map((transaction) => (
              <div className="transaction-list-item" key={transaction.id}>
                <TransactionCard
                  transaction={transaction}
                  onComplete={() => handleComplete(transaction)}
                  onRate={() => setSelectedTransaction(transaction)}
                />

                <TransactionLocationPanel
                  transaction={transaction}
                  onConfirmLocation={() => handleConfirmLocation(transaction)}
                />
              </div>
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
      </main>
    </AppShell>
  );
}