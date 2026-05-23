import registerImage from '../../../../assets/images/login-food.jpg';

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="register-mini-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2l2.2 2.2 4.8-5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="register-mini-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function RegisterVisual() {
  return (
    <aside className="register-visual">
      <div className="register-image-card">
        <img src={registerImage} alt="SaveByUp food marketplace" />

        <div className="register-image-overlay"></div>

        <div className="register-visual-content">
          <span>Smart Marketplace</span>
          <h2>Mulai hemat dan kurangi makanan terbuang.</h2>
          <p>
            SaveByUp membantu pengguna menemukan makanan berlebih yang masih
            layak konsumsi dengan harga lebih terjangkau.
          </p>
        </div>
      </div>

      <div className="register-floating-card register-floating-top">
        <div>
          <IconClock />
        </div>

        <section>
          <strong>Food Rescue</strong>
          <span>Selamatkan makanan layak konsumsi</span>
        </section>
      </div>

      <div className="register-floating-card register-floating-bottom">
        <div>
          <IconCheck />
        </div>

        <section>
          <strong>Akun Baru</strong>
          <span>Siap kelola stok dan marketplace</span>
        </section>
      </div>
    </aside>
  );
}

export default RegisterVisual;