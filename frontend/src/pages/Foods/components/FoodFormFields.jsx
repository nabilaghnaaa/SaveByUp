import "../styles/foodFormFields.css";

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

const units = ["pcs", "bungkus", "botol", "kotak", "gram", "kg", "liter"];

export default function FoodFormFields({ form, onChange }) {
  return (
    <section className="food-form-fields">
      <div className="food-field food-field-full">
        <label>Nama Makanan</label>
        <input
          type="text"
          value={form.name}
          placeholder="Contoh: Roti tawar, susu kotak, mie instan"
          onChange={(event) => onChange("name", event.target.value)}
        />
      </div>

      <div className="food-field">
        <label>Kategori</label>
        <select
          value={form.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="food-field">
        <label>Jumlah Stok</label>
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(event) => onChange("quantity", event.target.value)}
        />
      </div>

      <div className="food-field">
        <label>Satuan</label>
        <select
          value={form.unit}
          onChange={(event) => onChange("unit", event.target.value)}
        >
          {units.map((unit) => (
            <option value={unit} key={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div className="food-field">
        <label>Harga Satuan</label>
        <input
          type="number"
          min="1"
          value={form.price}
          placeholder="Contoh: 8000"
          onChange={(event) => onChange("price", event.target.value)}
        />
        <small>
          Harga ini akan menjadi harga dasar makanan dan bisa dipakai saat
          makanan ditawarkan ke marketplace.
        </small>
      </div>

      <div className="food-field">
        <label>Tanggal Kedaluwarsa</label>
        <input
          type="date"
          value={form.expiry_date}
          onChange={(event) => onChange("expiry_date", event.target.value)}
        />
        <small>
          Status makanan akan dihitung otomatis berdasarkan tanggal kedaluwarsa.
        </small>
      </div>
    </section>
  );
}