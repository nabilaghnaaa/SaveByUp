export default function RegisterVisual() {
  return (
    <section className="register-visual">
      <div className="register-visual-overlay" />

      <div className="register-visual-content">
        <div className="register-visual-badge">Join SaveByUp</div>

        <h2>Ubah stok makanan jadi lebih terpantau.</h2>

        <p>
          SaveByUp dirancang untuk mahasiswa kos agar bisa mencatat makanan,
          memantau kedaluwarsa, mengurangi food waste, dan berbagi makanan layak
          konsumsi secara lebih aman.
        </p>

        <div className="register-steps">
          <div>
            <span>01</span>
            <strong>Catat Stok</strong>
            <p>Masukkan makanan dan tanggal kedaluwarsa.</p>
          </div>

          <div>
            <span>02</span>
            <strong>Dapatkan Reminder</strong>
            <p>Sistem membantu menentukan prioritas konsumsi.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Manfaatkan Lagi</strong>
            <p>Jual murah makanan layak konsumsi melalui marketplace.</p>
          </div>
        </div>
      </div>
    </section>
  );
}