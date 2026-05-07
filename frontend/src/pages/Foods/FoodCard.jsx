import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="food-svg-icon">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4 8h16" />
      <path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="food-svg-icon">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 7.5l3 3" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 10v8" />
      <path d="M12 10v8" />
      <path d="M16 10v8" />
      <path d="M6 7l1 14h10l1-14" />
    </svg>
  );
}

function IconDots() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M12 5h.01" />
      <path d="M12 12h.01" />
      <path d="M12 19h.01" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.5 2.5 5-6" />
    </svg>
  );
}

function IconDiscard() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 14h8l1-14" />
      <path d="M10 11l4 4" />
      <path d="M14 11l-4 4" />
    </svg>
  );
}

function IconSell() {
  return (
    <svg viewBox="0 0 24 24" className="food-action-icon">
      <path d="M5 9h14l-1 10H6L5 9z" />
      <path d="M8 9a4 4 0 0 1 8 0" />
      <path d="M9 14h6" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" className="food-svg-icon">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 16l4-4 3 3 2-2 7 6" />
    </svg>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getStatusLabel(status) {
  const labels = {
    aman: 'Aman',
    mendekati_kedaluwarsa: 'Mendekati Kedaluwarsa',
    kedaluwarsa: 'Kedaluwarsa',
    dijual: 'Dijual',
    terjual: 'Terjual',
    digunakan: 'Sudah Digunakan',
    dibuang: 'Dibuang',
  };

  return labels[status] || status || 'Aman';
}

function getPriorityLabel(priority) {
  const labels = {
    tinggi: 'Prioritas Tinggi',
    sedang: 'Prioritas Sedang',
    rendah: 'Prioritas Rendah',
    tidak_layak: 'Tidak Layak',
  };

  return labels[priority] || priority || 'Prioritas Rendah';
}

function getFoodAccent(status) {
  if (status === 'kedaluwarsa') return 'expired';
  if (status === 'mendekati_kedaluwarsa') return 'warning';
  if (status === 'dijual') return 'selling';
  if (status === 'terjual') return 'sold';
  if (status === 'digunakan') return 'used';
  if (status === 'dibuang') return 'discarded';

  return 'safe';
}

function getImageSource(food) {
  return food?.image_url || food?.image || food?.photo_url || food?.photo || '';
}

function FoodActionModal({
  food,
  onClose,
  onEdit,
  onDelete,
  onUsed,
  onDiscard,
  onSell,
}) {
  const closeAndRun = (callback) => {
    onClose();

    if (callback) {
      setTimeout(() => {
        callback();
      }, 120);
    }
  };

  return createPortal(
    <div
      className="food-action-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="food-action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`food-action-title-${food?.id || 'item'}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="food-action-modal-header">
          <div>
            <span>Pilih Aksi</span>
            <h3 id={`food-action-title-${food?.id || 'item'}`}>
              {food?.name || 'Produk'}
            </h3>
          </div>

          <button
            type="button"
            className="food-action-close-btn"
            onClick={onClose}
            aria-label="Tutup popup aksi"
          >
            <IconClose />
          </button>
        </div>

        <div className="food-action-modal-summary">
          <div>
            <small>Status</small>
            <strong>{getStatusLabel(food?.status)}</strong>
          </div>

          <div>
            <small>Prioritas</small>
            <strong>{getPriorityLabel(food?.priority)}</strong>
          </div>
        </div>

        <div className="food-action-modal-list">
          <button type="button" onClick={() => closeAndRun(onEdit)}>
            <span className="action-modal-icon">
              <IconEdit />
            </span>

            <div>
              <strong>Edit produk</strong>
              <small>Ubah data makanan ini</small>
            </div>
          </button>

          <button type="button" onClick={() => closeAndRun(onUsed)}>
            <span className="action-modal-icon">
              <IconCheck />
            </span>

            <div>
              <strong>Produk sudah digunakan</strong>
              <small>Tandai produk sudah habis dipakai</small>
            </div>
          </button>

          <button type="button" onClick={() => closeAndRun(onDiscard)}>
            <span className="action-modal-icon">
              <IconDiscard />
            </span>

            <div>
              <strong>Produk dibuang</strong>
              <small>Tandai produk dibuang karena kondisi tidak habis</small>
            </div>
          </button>

          <button type="button" onClick={() => closeAndRun(onSell)}>
            <span className="action-modal-icon">
              <IconSell />
            </span>

            <div>
              <strong>Jual produk</strong>
              <small>Masukkan produk ke marketplace</small>
            </div>
          </button>

          <button
            type="button"
            className="danger-action"
            onClick={() => closeAndRun(onDelete)}
          >
            <span className="action-modal-icon">
              <IconTrash />
            </span>

            <div>
              <strong>Hapus produk</strong>
              <small>Hapus produk dari inventaris</small>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FoodCard({
  food,
  onEdit,
  onDelete,
  onUsed,
  onDiscard,
  onSell,
  index = 0,
}) {
  const accent = getFoodAccent(food?.status);
  const imageSource = getImageSource(food);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowActionModal(false);
      }
    };

    if (showActionModal) {
      document.body.classList.add('food-action-modal-open');
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.classList.remove('food-action-modal-open');
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showActionModal]);

  return (
    <>
      <article
        className={`food-card food-card-horizontal ${accent} ${food?.priority || ''}`}
        style={{ animationDelay: `${index * 0.06}s` }}
      >
        <div className="food-card-pattern"></div>

        <div className="food-card-main">
          <div className="food-product-photo">
            {imageSource ? (
              <img src={imageSource} alt={food?.name || 'Foto makanan'} />
            ) : (
              <IconImage />
            )}
          </div>

          <div className="food-card-body">
            <div className={`food-status ${food?.status || 'aman'}`}>
              {getStatusLabel(food?.status)}
            </div>

            <h3>{food?.name || 'Tanpa nama'}</h3>
            <p>{food?.category || 'Tanpa kategori'}</p>
          </div>
        </div>

        <div className="food-info-list">
          <div className="food-info-item">
            <div className="food-info-icon">
              <IconBox />
            </div>

            <div>
              <span>Jumlah Stok</span>
              <strong>
                {food?.quantity || 0} {food?.unit || 'satuan'}
              </strong>
            </div>
          </div>

          <div className="food-info-item">
            <div className="food-info-icon">
              <IconCalendar />
            </div>

            <div>
              <span>Tanggal Kedaluwarsa</span>
              <strong>{formatDate(food?.expiry_date)}</strong>
            </div>
          </div>
        </div>

        <div className="food-card-side">
          <div className={`food-priority ${food?.priority || 'rendah'}`}>
            <span></span>
            {getPriorityLabel(food?.priority)}
          </div>

          <button
            type="button"
            className="food-action-main-btn"
            onClick={() => setShowActionModal(true)}
          >
            Aksi
            <IconDots />
          </button>
        </div>
      </article>

      {showActionModal && (
        <FoodActionModal
          food={food}
          onClose={() => setShowActionModal(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          onUsed={onUsed}
          onDiscard={onDiscard}
          onSell={onSell}
        />
      )}
    </>
  );
}

export default FoodCard;