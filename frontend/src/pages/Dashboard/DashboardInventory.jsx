import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import FoodCard from '../Foods/FoodCard';

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-inventory-icon">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-inventory-icon">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-inventory-icon">
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v6h-6" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-empty-icon-svg">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" className="dashboard-inventory-icon">
      <path d="M12 3l1.4 5.1L18.5 9.5l-5.1 1.4L12 16l-1.4-5.1-5.1-1.4 5.1-1.4L12 3z" />
      <path d="M18 14l.8 2.8L21.5 18l-2.7.8L18 21.5l-.8-2.7-2.7-.8 2.7-1.2L18 14z" />
    </svg>
  );
}

function DashboardInventory({ refreshKey, onInventoryChange }) {
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [priorityFilter, setPriorityFilter] = useState('semua');

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await API.get('/foods');
      setFoods(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data makanan:', error);
      setMessage('Gagal mengambil data inventaris makanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [refreshKey]);

  const handleRefresh = async () => {
    await fetchFoods();

    if (onInventoryChange) {
      onInventoryChange();
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus data makanan ini?');

    if (!confirmDelete) return;

    try {
      await API.delete(`/foods/${id}`);
      setMessage('Data makanan berhasil dihapus');

      await fetchFoods();

      if (onInventoryChange) {
        onInventoryChange();
      }

      setTimeout(() => {
        setMessage('');
      }, 2500);
    } catch (error) {
      console.error('Gagal menghapus makanan:', error);
      setMessage(error.response?.data?.message || 'Gagal menghapus makanan');
    }
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        food.name?.toLowerCase().includes(keyword) ||
        food.category?.toLowerCase().includes(keyword) ||
        food.unit?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === 'semua' || food.status === statusFilter;

      const matchPriority =
        priorityFilter === 'semua' || food.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [foods, search, statusFilter, priorityFilter]);

  return (
    <section className="dashboard-inventory-section" id="dashboard-inventory">
      <div className="dashboard-inventory-heading">
        <div>
          <span>
            <IconSparkle />
            Inventaris Makanan
          </span>

          <h2>Daftar stok makanan kamu</h2>

          <p>
            Kelola semua makanan yang sudah kamu input. Kamu bisa tambah, edit,
            hapus, dan memantau status kedaluwarsa langsung dari dashboard.
          </p>
        </div>

        <div className="dashboard-inventory-actions">
          <button
            type="button"
            className="inventory-outline-button"
            onClick={handleRefresh}
          >
            <IconRefresh />
            Refresh
          </button>

          <button
            type="button"
            className="inventory-primary-button"
            onClick={() => navigate('/foods/add')}
          >
            <IconPlus />
            Tambah Makanan
          </button>
        </div>
      </div>

      <div className="dashboard-inventory-toolbar">
        <div className="dashboard-search-box">
          <IconSearch />

          <input
            type="text"
            placeholder="Cari makanan, kategori, atau satuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dashboard-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="semua">Semua Status</option>
            <option value="aman">Aman</option>
            <option value="mendekati_kedaluwarsa">Mendekati Kedaluwarsa</option>
            <option value="kedaluwarsa">Kedaluwarsa</option>
            <option value="dijual">Dijual</option>
            <option value="terjual">Terjual</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="semua">Semua Prioritas</option>
            <option value="tinggi">Prioritas Tinggi</option>
            <option value="sedang">Prioritas Sedang</option>
            <option value="rendah">Prioritas Rendah</option>
            <option value="tidak_layak">Tidak Layak</option>
          </select>
        </div>
      </div>

      {message && <div className="dashboard-inventory-message">{message}</div>}

      {loading ? (
        <div className="dashboard-inventory-loading">
          <div className="dashboard-spinner"></div>

          <div>
            <h3>Memuat inventaris...</h3>
            <p>Sedang mengambil daftar makanan tersimpan.</p>
          </div>
        </div>
      ) : foods.length === 0 ? (
        <div className="dashboard-inventory-empty">
          <div className="dashboard-empty-icon">
            <IconBox />
          </div>

          <h3>Belum ada makanan tercatat</h3>

          <p>
            Tambahkan makanan pertama kamu agar sistem bisa membantu memantau stok
            dan tanggal kedaluwarsa.
          </p>

          <button type="button" onClick={() => navigate('/foods/add')}>
            <IconPlus />
            Tambah Makanan Pertama
          </button>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="dashboard-inventory-empty">
          <div className="dashboard-empty-icon">
            <IconSearch />
          </div>

          <h3>Data tidak ditemukan</h3>

          <p>Coba ubah kata kunci pencarian atau reset filter.</p>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('semua');
              setPriorityFilter('semua');
            }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="dashboard-food-grid">
          {filteredFoods.map((food, index) => (
            <FoodCard
              key={food.id}
              food={food}
              index={index}
              onEdit={() => navigate(`/foods/edit/${food.id}`)}
              onDelete={() => handleDelete(food.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardInventory;