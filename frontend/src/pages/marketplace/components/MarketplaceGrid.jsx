import MarketplaceCard from './MarketplaceCard';

function MarketplaceGrid({ products }) {
  return (
    <section id="marketplace-products" className="marketplace-products">
      <div className="marketplace-section-heading">
        <div>
          <p>Produk Rescue</p>
          <h2>Makanan tersedia hari ini</h2>
        </div>
        <span>{products.length} produk ditemukan</span>
      </div>

      {products.length > 0 ? (
        <div className="marketplace-product-grid">
          {products.map((product) => (
            <MarketplaceCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="marketplace-empty-state">
          <h3>Produk belum ditemukan</h3>
          <p>Coba ubah kata kunci atau pilih kategori lain.</p>
        </div>
      )}
    </section>
  );
}

export default MarketplaceGrid;