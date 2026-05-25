import { Link } from "react-router-dom";

export default function RegisterBrand() {
  return (
    <div className="register-brand">
      <div className="register-logo">S</div>

      <div className="register-brand-text">
        <strong>SaveByUp</strong>
        <span>Food Waste Prevention System</span>
      </div>

      <div className="register-heading">
        <span>Buat Akun Baru</span>
        <h1>Mulai kelola makanan kosmu</h1>
        <p>
          Daftar untuk mencatat stok makanan, menerima reminder kedaluwarsa, dan
          menggunakan marketplace makanan layak konsumsi.
        </p>
      </div>

      <p className="register-switch">
        Sudah punya akun? <Link to="/login">Masuk di sini</Link>
      </p>
    </div>
  );
}