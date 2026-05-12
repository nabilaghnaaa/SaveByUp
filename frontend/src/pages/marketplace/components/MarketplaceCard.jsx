function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function MarketplaceCard({ product }) {
  return (
    <article className="marketplace-card">
      <div className="marketplace-card-image">
        <span>{product.image}</span>
        <small>{product.tag}</small>
      </div>

      <div className="marketplace-card-body">
        <div className="marketplace-card-top">
          <p>{product.category}</p>
          <span>{product.expiresIn}</span>
        </div>

        <h3>{product.name}</h3>
        <p className="marketplace-seller">{product.seller}</p>

        <div className="marketplace-price-row">
          <strong>{formatRupiah(product.price)}</strong>
          <del>{formatRupiah(product.oldPrice)}</del>
        </div>

        <div className="marketplace-card-meta">
          <span>📍 {product.location}</span>
          <span>Stok {product.stock}</span>
        </div>

        <button type="button" className="marketplace-buy-btn">
          Ambil Sekarang
        </button>
      </div>
    </article>
  );
}

export default MarketplaceCard;