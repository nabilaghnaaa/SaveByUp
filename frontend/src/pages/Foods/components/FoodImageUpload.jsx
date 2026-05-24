import "../styles/foodImageUpload.css";

export default function FoodImageUpload({ form, onChange }) {
  return (
    <section className="food-image-upload sb-glass">
      <div className="food-image-preview">
        {form.image_url ? (
          <img src={form.image_url} alt="Preview makanan" />
        ) : (
          <div className="food-image-empty">
            <span>📷</span>
            <p>Preview foto makanan</p>
          </div>
        )}
      </div>

      <div className="food-image-body">
        <span>Foto Makanan</span>
        <h3>Tambahkan gambar produk</h3>

        <p>
          Untuk saat ini, masukkan URL foto makanan. Fitur upload file langsung
          bisa ditambahkan setelah backend upload siap.
        </p>

        <label>URL Foto</label>
        <input
          type="url"
          value={form.image_url}
          placeholder="https://contoh.com/foto-makanan.jpg"
          onChange={(event) => onChange("image_url", event.target.value)}
        />
      </div>
    </section>
  );
}