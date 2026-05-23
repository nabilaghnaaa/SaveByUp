function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="register-input-icon">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.4-4 4-6 7-6s5.6 2 7 6" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="register-input-icon">
      <path d="M4 6h16v12H4V6z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" className="register-input-icon">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" className="register-button-icon">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

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
    <div className="register-card">
      <div className="register-card-heading">
        <span>Create Account</span>
        <h1>Buat akunmu</h1>
        <p>
          Daftar untuk mengelola stok makanan, pantau kedaluwarsa, dan kurangi
          food waste dari satu dashboard.
        </p>
      </div>

      {message && (
        <div className={`register-message ${messageType}`}>
          {message}
        </div>
      )}

      <form className="register-form" onSubmit={onSubmit}>
        <div className="register-form-group">
          <label>Nama Lengkap</label>

          <div className="register-input-shell">
            <IconUser />

            <input
              type="text"
              name="name"
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="register-form-group">
          <label>Email</label>

          <div className="register-input-shell">
            <IconMail />

            <input
              type="email"
              name="email"
              placeholder="Masukkan email kamu"
              value={form.email}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="register-form-group">
          <label>Password</label>

          <div className="register-input-shell">
            <IconLock />

            <input
              type="password"
              name="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="register-form-group">
          <label>Konfirmasi Password</label>

          <div className="register-input-shell">
            <IconLock />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={onChange}
            />
          </div>
        </div>

        <button type="submit" className="register-submit-btn" disabled={loading}>
          {loading ? 'Memproses...' : 'Daftar Sekarang'}
          <IconArrow />
        </button>
      </form>

      <div className="register-login-row">
        <span>Sudah punya akun?</span>

        <button type="button" onClick={onGoLogin}>
          Masuk sekarang
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;