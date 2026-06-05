import AppIcon from "../../../components/ui/AppIcon";
import { formatCurrency } from "../../../utils/formatCurrency";

export default function MarketplaceEditProductForm({
  product,
  editForm,
  editTotal,
  savingEdit,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <form className="product-edit-form product-edit-panel" onSubmit={onSubmit}>
      <div className="product-edit-header">
        <div>
          <span className="product-edit-eyebrow">Edit Produk Jual</span>
          <h3>{product.name}</h3>
          <p>
            Perubahan hanya berlaku untuk produk yang sedang aktif di
            marketplace.
          </p>
        </div>

        <button
          type="button"
          className="product-edit-close"
          onClick={onClose}
          disabled={savingEdit}
          aria-label="Tutup form edit"
        >
          ×
        </button>
      </div>

      <div className="product-edit-grid">
        <div className="product-edit-group">
          <label htmlFor="edit-quantity">Jumlah Dijual</label>

          <div className="product-input-with-icon">
            <span>
              <AppIcon name="stock" size={18} />
            </span>

            <input
              id="edit-quantity"
              type="number"
              min="1"
              value={editForm.quantity}
              disabled={savingEdit}
              onChange={(event) => onChange("quantity", event.target.value)}
            />
          </div>
        </div>

        <div className="product-edit-group">
          <label htmlFor="edit-price">
            Harga Jual per {product.unit || "pcs"}
          </label>

          <div className="product-input-with-icon">
            <span>
              <AppIcon name="price" size={18} />
            </span>

            <input
              id="edit-price"
              type="number"
              min="1"
              value={editForm.price}
              disabled={savingEdit}
              onChange={(event) => onChange("price", event.target.value)}
            />
          </div>
        </div>

        <div className="product-edit-group product-edit-full">
          <label htmlFor="edit-description">Deskripsi Produk</label>

          <textarea
            id="edit-description"
            rows="4"
            maxLength="500"
            value={editForm.description}
            disabled={savingEdit}
            placeholder="Contoh: masih tersegel, COD sekitar kos/kampus, kondisi aman dikonsumsi."
            onChange={(event) => onChange("description", event.target.value)}
          />

          <small>{String(editForm.description || "").length}/500 karakter</small>
        </div>
      </div>

      <div className="product-edit-total">
        <span>Estimasi total jika semua stok terjual</span>
        <strong>{formatCurrency(editTotal)}</strong>
      </div>

      <div className="product-edit-actions">
        <button
          type="button"
          className="sb-btn marketplace-btn-outline"
          disabled={savingEdit}
          onClick={onClose}
        >
          Batal
        </button>

        <button
          type="submit"
          className="sb-btn sb-btn-primary"
          disabled={savingEdit}
        >
          {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}