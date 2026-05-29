import AppIcon from "../../../components/ui/AppIcon";

export default function MarketplaceBuyerPanel({
  product,
  productQuantity,
  productCanBeBought,
  disabledReason,
  onOpenNegotiation,
}) {
  return (
    <section className="buyer-panel">
      <div>
        <span>Ajukan Pembelian</span>
        <h3>Minat dengan produk ini?</h3>
        <p>
          Kamu bisa mengajukan pembelian atau menawar harga. Titik lokasi detail
          baru dibuka setelah pengajuan disetujui dan transaksi dikonfirmasi.
        </p>
      </div>

      <button
        type="button"
        className="sb-btn sb-btn-primary product-request-button"
        disabled={!productCanBeBought}
        onClick={onOpenNegotiation}
      >
        <AppIcon name="request" />
        {product.status !== "tersedia"
          ? "Produk Tidak Tersedia"
          : productQuantity <= 0
            ? "Stok Habis"
            : "Ajukan Pembelian / Negosiasi"}
      </button>

      {disabledReason && (
        <small className="product-detail-note">{disabledReason}</small>
      )}
    </section>
  );
}