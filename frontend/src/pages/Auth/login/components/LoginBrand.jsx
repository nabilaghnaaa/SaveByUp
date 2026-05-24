import { Link } from "react-router-dom";

export default function LoginBrand() {
  return (
    <div className="login-brand">
      <div className="login-logo">S</div>

      <div>
        <strong>SaveByUp</strong>
        <span>Food Waste Prevention System</span>
      </div>

      <div className="login-heading">
        <span>Selamat Datang Kembali</span>
        <h1>Masuk ke akun kamu</h1>
        <p>
          Lanjutkan memantau stok makanan, tanggal kedaluwarsa, dan marketplace
          makanan layak konsumsi.
        </p>
      </div>

      <p className="login-switch">
        Belum punya akun? <Link to="/register">Daftar sekarang</Link>
      </p>
    </div>
  );
}