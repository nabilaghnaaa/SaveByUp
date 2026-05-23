import "../styles/foodImageUpload.css";

export default function FoodImageUpload({ form, onChange }) {
  return (
    <section className="food-image-upload sb-glass">
      <div className="food-image-preview">
        {form.image_url ? (
          <img src={form.image_url} alt="Preview makanan" />
        ) : (
          <div>
            <span>📷</span>
            <p>Preview foto makanan</p>
          </div>
        )}
      </div>

      <div className="food-image-body">
        <h3>Foto Makanan</h3>
        <p>
          Untuk sementara masukkan URL gambar. Upload file fisik bisa kita
          tambahkan saat backend upload sudah tersedia.
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