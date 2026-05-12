function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="login-input-icon">
      <path d="M4 6h16v12H4V6z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" className="login-input-icon">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v3" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" className="login-button-icon">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function LoginForm({
  form,
  message,
  messageType,
  loading,
  onChange,
  onSubmit,
  onGoRegister,
}) {
  return (
    <div className="login-card">
      <div className="login-card-heading">
        <span>Welcome Back</span>
        <h1>Masuk ke akunmu</h1>
        <p>
          Kelola stok makanan, pantau kedaluwarsa, dan kurangi food waste dari
          satu dashboard.
        </p>
      </div>

      {message && (
        <div className={`login-message ${messageType}`}>
          {message}
        </div>
      )}

      <form className="login-form" onSubmit={onSubmit}>
        <div className="login-form-group">
          <label>Email</label>

          <div className="login-input-shell">
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

        <div className="login-form-group">
          <label>Password</label>

          <div className="login-input-shell">
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

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          <IconArrow />
        </button>
      </form>

      <div className="login-register-row">
        <span>Belum punya akun?</span>

        <button type="button" onClick={onGoRegister}>
          Daftar sekarang
        </button>
      </div>
    </div>
  );
}

export default LoginForm;