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
    <form className="product-edit-form" onSubmit={onSubmit}>
      <div className="product-edit-header">
        <div>
          <span>Edit Produk Jual</span>
          <h3>{product.name}</h3>
          <p>
            Perubahan hanya berlaku untuk produk yang sedang aktif di
            marketplace.
          </p>
        </div>

        <button type="button" onClick={onClose} disabled={savingEdit}>
          ×
        </button>
      </div>

      <div className="product-edit-grid">
        <label>
          <span>Jumlah Dijual</span>

          <div className="product-edit-input">
            <AppIcon name="stock" />
            <input
              type="number"
              min="1"
              value={editForm.quantity}
              disabled={savingEdit}
              onChange={(event) => onChange("quantity", event.target.value)}
            />
          </div>
        </label>

        <label>
          <span>Harga Jual per {product.unit || "pcs"}</span>

          <div className="product-edit-input">
            <AppIcon name="price" />
            <input
              type="number"
              min="1"
              value={editForm.price}
              disabled={savingEdit}
              onChange={(event) => onChange("price", event.target.value)}
            />
          </div>
        </label>
      </div>

      <label>
        <span>Deskripsi Produk</span>
        <textarea
          rows="4"
          maxLength="500"
          value={editForm.description}
          disabled={savingEdit}
          placeholder="Contoh: masih tersegel, COD sekitar kos/kampus, kondisi aman dikonsumsi."
          onChange={(event) => onChange("description", event.target.value)}
        />
      </label>

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

        <button type="submit" className="sb-btn sb-btn-primary" disabled={savingEdit}>
          {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}