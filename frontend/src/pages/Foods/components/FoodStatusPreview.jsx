import {
  getFoodPriority,
  getFoodStatus,
  getRemainingDays,
} from "../../../utils/foodStatus";

import "../styles/foodStatusPreview.css";

export default function FoodStatusPreview({ form }) {
  const status = getFoodStatus(form);
  const priority = getFoodPriority(form);
  const remainingDays = getRemainingDays(form.expiry_date);

  const getStatusTitle = () => {
    if (status === "kedaluwarsa") return "Kedaluwarsa";
    if (status === "mendekati_kedaluwarsa") return "Mendekati Kedaluwarsa";
    if (status === "dijual") return "Dijual";
    if (status === "digunakan") return "Digunakan";
    if (status === "dibuang") return "Dibuang";
    return "Aman";
  };

  const getStatusClass = () => {
    if (status === "kedaluwarsa" || status === "dibuang") {
      return "status-danger";
    }

    if (status === "mendekati_kedaluwarsa") {
      return "status-warning";
    }

    if (status === "dijual") {
      return "status-market";
    }

    if (status === "digunakan") {
      return "status-done";
    }

    return "status-safe";
  };

  const getDescription = () => {
    if (!form.expiry_date) {
      return "Tambahkan tanggal kedaluwarsa agar sistem bisa menghitung prioritas makanan.";
    }

    if (status === "kedaluwarsa") {
      return "Makanan sudah melewati tanggal kedaluwarsa. Periksa kondisi sebelum mengambil tindakan.";
    }

    if (status === "mendekati_kedaluwarsa") {
      return "Makanan perlu diprioritaskan untuk digunakan atau ditawarkan jika masih layak.";
    }

    if (status === "dijual") {
      return "Makanan ditandai untuk ditawarkan ke marketplace.";
    }

    if (status === "digunakan") {
      return "Makanan ditandai sudah digunakan.";
    }

    if (status === "dibuang") {
      return "Makanan ditandai sudah dibuang.";
    }

    return "Makanan masih aman dan belum mendesak.";
  };

  const getRemainingLabel = () => {
    if (!form.expiry_date) return "Tanggal belum diisi";

    if (remainingDays < 0) {
      return `Lewat ${Math.abs(remainingDays)} hari`;
    }

    if (remainingDays === 0) {
      return "Hari ini";
    }

    return `${remainingDays} hari lagi`;
  };

  const getPriorityLabel = () => {
    if (!form.expiry_date) return "Belum ada tanggal";
    if (priority === "tinggi") return "Tinggi";
    if (priority === "sedang") return "Sedang";
    if (priority === "tidak_layak") return "Tidak layak";
    if (priority === "selesai") return "Selesai";
    return "Rendah";
  };

  const getActionSuggestion = () => {
    if (!form.expiry_date) {
      return "Isi tanggal kedaluwarsa agar sistem bisa memberi rekomendasi.";
    }

    if (status === "kedaluwarsa") {
      return "Jangan langsung dijual. Cek kondisi makanan terlebih dahulu.";
    }

    if (status === "mendekati_kedaluwarsa") {
      return "Gunakan lebih dulu atau tawarkan ke marketplace jika masih layak.";
    }

    if (status === "aman") {
      return "Simpan dengan baik dan cek kembali saat mendekati tanggal kedaluwarsa.";
    }

    return "Status makanan sudah ditandai secara manual.";
  };

  return (
    <section className="food-status-preview">
      <div className="status-preview-header">
        <div>
          <span>Status Otomatis</span>
          <h3>{getStatusTitle()}</h3>
        </div>

        <div className={`status-preview-badge ${getStatusClass()}`}>
          {getStatusTitle()}
        </div>
      </div>

      <p className="status-preview-description">{getDescription()}</p>

      <div className="status-preview-grid">
        <div className="status-info-card">
          <span>Sisa Waktu</span>
          <strong>{getRemainingLabel()}</strong>
        </div>

        <div className="status-info-card">
          <span>Prioritas</span>
          <strong>{getPriorityLabel()}</strong>
        </div>
      </div>

      <div className="status-suggestion-card">
        <span>Rekomendasi Sistem</span>
        <p>{getActionSuggestion()}</p>
      </div>
    </section>
  );
}