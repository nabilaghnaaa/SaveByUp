function RegisterForm({
  form,
  message,
  messageType,
  loading,
  onChange,
  onSubmit,
  onGoLogin,
}) {
  return (
    <form className="register-form" onSubmit={onSubmit}>
      <div className="register-form-header">
        <p>Gabung Sekarang</p>
        <h1>Buat Akun SaveByUp</h1>
        <span>
          Daftar untuk mulai mengelola stok makanan, menemukan makanan layak
          konsumsi, dan ikut mengurangi food waste.
        </span>
      </div>

      {message && (
        <div className={`register-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="register-input-group">
        <label htmlFor="name">Nama Lengkap</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Masukkan nama lengkap"
          value={form.name}
          onChange={onChange}
        />
      </div>

      <div className="register-input-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Masukkan email"
          value={form.email}
          onChange={onChange}
        />
      </div>

      <div className="register-input-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Masukkan password"
          value={form.password}
          onChange={onChange}
        />
      </div>

      <div className="register-input-group">
        <label htmlFor="confirmPassword">Konfirmasi Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Ulangi password"
          value={form.confirmPassword}
          onChange={onChange}
        />
      </div>

      <button className="register-submit-btn" type="submit" disabled={loading}>
        {loading ? 'Mendaftarkan...' : 'Daftar'}
      </button>

      <p className="register-switch-text">
        Sudah punya akun?{' '}
        <button type="button" onClick={onGoLogin}>
          Masuk di sini
        </button>
      </p>
    </form>
  );
}

export default RegisterForm;