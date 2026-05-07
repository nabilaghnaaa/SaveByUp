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
  };

  return labels[status] || status;
}

function getPriorityLabel(priority) {
  const labels = {
    tinggi: 'Prioritas Tinggi',
    sedang: 'Prioritas Sedang',
    rendah: 'Prioritas Rendah',
    tidak_layak: 'Tidak Layak',
  };

  return labels[priority] || priority;
}

function getFoodAccent(status) {
  if (status === 'kedaluwarsa') return 'expired';
  if (status === 'mendekati_kedaluwarsa') return 'warning';
  if (status === 'dijual') return 'selling';
  if (status === 'terjual') return 'sold';
  return 'safe';
}

function FoodCard({ food, onEdit, onDelete, index = 0 }) {
  const accent = getFoodAccent(food.status);

  return (
    <div
      className={`food-card ${accent} ${food.priority}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="food-card-pattern"></div>

      <div className="food-card-top">
        <div className="food-icon-circle">
          <IconBox />
        </div>

        <div className={`food-status ${food.status}`}>
          {getStatusLabel(food.status)}
        </div>
      </div>

      <div className="food-card-body">
        <h3>{food.name}</h3>
        <p>{food.category || 'Tanpa kategori'}</p>
      </div>

      <div className="food-info-list">
        <div className="food-info-item">
          <div className="food-info-icon">
            <IconBox />
          </div>

          <div>
            <span>Jumlah Stok</span>
            <strong>
              {food.quantity} {food.unit}
            </strong>
          </div>
        </div>

        <div className="food-info-item">
          <div className="food-info-icon">
            <IconCalendar />
          </div>

          <div>
            <span>Tanggal Kedaluwarsa</span>
            <strong>{formatDate(food.expiry_date)}</strong>
          </div>
        </div>
      </div>

      <div className={`food-priority ${food.priority}`}>
        <span></span>
        {getPriorityLabel(food.priority)}
      </div>

      <div className="food-card-actions">
        <button className="edit-food-btn" onClick={onEdit}>
          <IconEdit />
          Edit
        </button>

        <button className="delete-food-btn" onClick={onDelete}>
          <IconTrash />
          Hapus
        </button>
      </div>
    </div>
  );
}

export default FoodCard;