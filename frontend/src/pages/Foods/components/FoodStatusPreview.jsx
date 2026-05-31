import {
  getFoodPriority,
  getRemainingDays,
} from "../../../utils/foodStatus";

import "../styles/foodStatusPreview.css";

const getAutoFoodStatus = (expiryDate) => {
  if (!expiryDate) return "aman";

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "kedaluwarsa";
  if (diffDays <= 7) return "mendekati_kedaluwarsa";

  return "aman";
};

export default function FoodStatusPreview({ form }) {
  const status = getAutoFoodStatus(form.expiry_date);
  const priority = getFoodPriority({
    ...form,
    status,
  });
  const remainingDays = getRemainingDays(form.expiry_date);

  const getStatusTitle = () => {
    if (status === "kedaluwarsa") return "Kedaluwarsa";
    if (status === "mendekati_kedaluwarsa") return "Mendekati Kedaluwarsa";
    return "Aman";
  };

  const getStatusClass = () => {
    if (status === "kedaluwarsa") {
      return "status-danger";
    }

    if (status === "mendekati_kedaluwarsa") {
      return "status-warning";
    }

    return "status-safe";
  };

  const getDescription = () => {
    if (!form.expiry_date) {
      return "Tambahkan tanggal kedaluwarsa agar sistem bisa menghitung prioritas makanan.";
    }

    if (status === "kedaluwarsa") {
      return "Makanan sudah melewati tanggal kedaluwarsa. Periksa kondisi makanan sebelum mengambil tindakan.";
    }

    if (status === "mendekati_kedaluwarsa") {
      return "Makanan perlu diprioritaskan untuk digunakan atau ditawarkan jika masih layak.";
    }

    return "Makanan masih aman berdasarkan tanggal kedaluwarsa yang kamu isi.";
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

    return "Simpan dengan baik dan cek kembali saat mendekati tanggal kedaluwarsa.";
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