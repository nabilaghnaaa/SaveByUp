function MarketplaceHero({ totalProducts }) {
  return (
    <section className="marketplace-hero">
      <div>
        <p className="marketplace-eyebrow">SaveByUp Marketplace</p>
        <h1>Temukan makanan layak konsumsi dengan harga lebih hemat.</h1>
        <p className="marketplace-hero-text">
          Marketplace ini membantu pengguna membeli stok makanan berlebih
          sebelum terbuang, sekaligus mendukung gerakan anti food waste.
        </p>

        <div className="marketplace-hero-actions">
          <a href="#marketplace-products" className="marketplace-primary-btn">
            Lihat Produk
          </a>
          <button className="marketplace-secondary-btn" type="button">
            Jual Makanan
          </button>
        </div>
      </div>

      <div className="marketplace-hero-card">
        <span>🌱</span>
        <h3>{totalProducts}+ Produk Tersedia</h3>
        <p>Dipilih dari penjual sekitar dengan stok yang masih aman.</p>
      </div>
    </section>
  );
}

export default MarketplaceHero;