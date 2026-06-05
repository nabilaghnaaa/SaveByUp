import { useEffect, useMemo, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import {
  completeTransactionWithRating,
  getTransactions,
  rateTransaction,
  shareTransactionLocation,
} from "../../services/transactionService";

import RatingModal from "./components/RatingModal";
import TransactionCard from "./components/TransactionCard";
import TransactionLocationPanel from "./components/TransactionLocationPanel";

import "./styles/transactions.css";

const normalizeFilterStatus = (status) => {
  const map = {
    waiting_buyer_confirmation: "menunggu_komunikasi",
    waiting_cod: "menunggu_komunikasi",
    menunggu_komunikasi: "menunggu_komunikasi",
    selesai: "selesai",
    dibatalkan: "dibatalkan",
  };

  return map[status] || status;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("semua");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [locationModalTransaction, setLocationModalTransaction] =
    useState(null);
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

  const totalMenunggu = transactions.filter(
    (transaction) => transaction.status === "menunggu_komunikasi"
  ).length;

  const totalSelesai = transactions.filter(
    (transaction) => transaction.status === "selesai"
  ).length;

  const totalDibatalkan = transactions.filter(
    (transaction) => transaction.status === "dibatalkan"
  ).length;

  const totalRating = transactions.filter(
    (transaction) => transaction.current_user_has_reviewed
  ).length;

  const handleShareLocation = async (transaction) => {
    const ok = window.confirm(
      "Bagikan lokasi COD dari profil kamu untuk transaksi ini?"
    );

    if (!ok) return;

    try {
      await shareTransactionLocation(transaction.id);
      setMessage("Lokasi COD kamu berhasil dibagikan.");
      await fetchTransactions();
    } catch (error) {
      console.error("Gagal membagikan lokasi:", error);
      setMessage(
        error.response?.data?.message || "Gagal membagikan lokasi COD."
      );
    }
  };

  const handleComplete = (transaction) => {
    setSelectedTransaction({
      ...transaction,
      mode: "complete",
    });
  };

  const handleOpenRating = (transaction) => {
    setSelectedTransaction({
      ...transaction,
      mode: "rate",
    });
  };

  const handleRate = async (payload) => {
    if (!selectedTransaction) return;

    try {
      if (selectedTransaction.mode === "complete") {
        await completeTransactionWithRating(selectedTransaction.id, payload);

        setMessage(
          "Ulasan berhasil dikirim. Transaksi berhasil ditandai selesai."
        );
      } else {
        await rateTransaction(selectedTransaction.id, payload);

        setMessage("Rating dan ulasan berhasil diberikan.");
      }

      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (error) {
      console.error("Gagal mengirim rating:", error);
      setMessage(
        error.response?.data?.message ||
          "Gagal mengirim rating dan ulasan transaksi."
      );
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
          description="Pantau transaksi pembelian dan penjualan, hubungi lewat WhatsApp, bagikan lokasi COD, lihat lokasi setelah kedua pihak membagikan lokasi, lalu selesaikan transaksi melalui rating dan ulasan."
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
              penjualan makanan layak konsumsi, mulai dari pengajuan, komunikasi,
              pembagian lokasi COD, sampai rating setelah transaksi selesai.
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
            <p>Transaksi yang menunggu komunikasi atau lokasi COD.</p>
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
            <p>Transaksi yang sudah kamu beri rating atau ulasan.</p>
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
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onShareLocation={() => handleShareLocation(transaction)}
                onViewLocation={() => setLocationModalTransaction(transaction)}
                onComplete={() => handleComplete(transaction)}
                onRate={() => handleOpenRating(transaction)}
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

        {locationModalTransaction && (
          <TransactionLocationPanel
            transaction={locationModalTransaction}
            onClose={() => setLocationModalTransaction(null)}
          />
        )}
      </main>
    </AppShell>
  );
}