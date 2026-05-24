import "../styles/marketplace.css";

const categories = [
  "Snack",
  "Makanan Instan",
  "Minuman",
  "Bahan Masak",
  "Buah",
  "Sayur",
  "Makanan Beku",
  "Lainnya",
];

export default function ProductFilter({
  search,
  categoryFilter,
  statusFilter,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}) {
  return (
    <section className="product-filter sb-glass">
      <input
        type="text"
        value={search}
        placeholder="Cari produk, kategori, penjual, atau lokasi..."
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <select
        value={categoryFilter}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="semua">Semua Kategori</option>
        {categories.map((category) => (
          <option value={category} key={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
      >
        <option value="semua">Semua Status</option>
        <option value="tersedia">Tersedia</option>
        <option value="dalam_proses">Dalam Proses</option>
        <option value="selesai">Selesai</option>
        <option value="tidak_tersedia">Tidak Tersedia</option>
      </select>
    </section>
  );
}