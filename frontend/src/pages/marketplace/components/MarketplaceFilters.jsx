const categories = ['Semua', 'Sayur', 'Roti', 'Buah', 'Makanan Siap Saji'];

function MarketplaceFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}) {
  return (
    <section className="marketplace-filters">
      <div className="marketplace-search-box">
        <span>🔎</span>
        <input
          type="text"
          placeholder="Cari makanan atau penjual..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="marketplace-category-list">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? 'active' : ''}
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

export default MarketplaceFilters;