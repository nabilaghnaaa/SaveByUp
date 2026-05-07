import loginImage from '../../../assets/images/login-food.jpg';

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="login-mini-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2l2.2 2.2 4.8-5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="login-mini-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function LoginVisual() {
  return (
    <aside className="login-visual">
      <div className="login-image-card">
        <img src={loginImage} alt="SaveByUp food inventory" />

        <div className="login-image-overlay"></div>

        <div className="login-visual-content">
          <span>Smart Inventory</span>
          <h2>Catat makanan sebelum terbuang sia-sia.</h2>
          <p>
            Sistem membantu mahasiswa kos memantau stok, kedaluwarsa, prioritas,
            dan marketplace makanan layak konsumsi.
          </p>
        </div>
      </div>

      <div className="login-floating-card login-floating-top">
        <div>
          <IconClock />
        </div>

        <section>
          <strong>Reminder Aktif</strong>
          <span>Makanan mendekati kedaluwarsa</span>
        </section>
      </div>

      <div className="login-floating-card login-floating-bottom">
        <div>
          <IconCheck />
        </div>

        <section>
          <strong>Food Saved</strong>
          <span>Prioritas konsumsi otomatis</span>
        </section>
      </div>
    </aside>
  );
}

export default LoginVisual;