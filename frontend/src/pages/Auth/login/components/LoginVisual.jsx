export default function LoginVisual() {
  return (
    <section className="login-visual">
      <div className="login-visual-overlay" />

      <div className="login-visual-content">
        <div className="login-visual-badge">Smart Food Inventory</div>

        <h2>Cegah makanan kos terbuang sia-sia.</h2>

        <p>
          SaveByUp membantu mahasiswa kos mencatat stok makanan, memantau
          kedaluwarsa, menentukan prioritas, dan memanfaatkan makanan layak
          konsumsi melalui marketplace.
        </p>

        <div className="login-visual-grid">
          <div>
            <strong>H-7</strong>
            <span>Reminder kedaluwarsa</span>
          </div>

          <div>
            <strong>COD</strong>
            <span>Marketplace aman</span>
          </div>

          <div>
            <strong>WA</strong>
            <span>Komunikasi setelah disetujui</span>
          </div>
        </div>
      </div>

      <div className="login-floating-card">
        <span>Prioritas Hari Ini</span>
        <strong>Gunakan makanan mendekati kedaluwarsa</strong>
        <p>Atau tawarkan ke marketplace jika masih layak konsumsi.</p>
      </div>
    </section>
  );
}