import AppIcon from "../../../components/ui/AppIcon";

export default function MarketplaceOwnerPanel({
  product,
  editMode,
  onToggleEdit,
  onCancelSell,
}) {
  return (
    <section className="product-owner-panel">
      <div className="product-owner-panel-head">
        <div>
          <span>Kelola Produk Kamu</span>
          <h3>Atur penjualan tanpa pindah halaman.</h3>
        </div>

        <div className="product-owner-panel-icon">
          <AppIcon name="shield" size={26} />
        </div>
      </div>

      <div className="product-owner-actions">
        <button
          type="button"
          className="product-action-card primary"
          disabled={product.status !== "tersedia"}
          onClick={onToggleEdit}
        >
          <span>
            <AppIcon name="edit" />
          </span>

          <div>
            <strong>{editMode ? "Tutup Edit Produk" : "Edit Produk Jual"}</strong>
            <small>Ubah jumlah, harga, dan deskripsi produk.</small>
          </div>
        </button>

        <button
          type="button"
          className="product-action-card danger"
          disabled={product.status !== "tersedia"}
          onClick={onCancelSell}
        >
          <span>
            <AppIcon name="delete" />
          </span>

          <div>
            <strong>Batal Jual</strong>
            <small>Hapus produk dari daftar marketplace aktif.</small>
          </div>
        </button>
      </div>

      {product.status !== "tersedia" && (
        <small className="product-detail-note">
          Produk tidak bisa diedit atau dibatalkan karena statusnya bukan
          tersedia.
        </small>
      )}
    </section>
  );
}