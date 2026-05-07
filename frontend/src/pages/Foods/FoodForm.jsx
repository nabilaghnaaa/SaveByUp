import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import FoodCard from './FoodCard';
import './foods.css';

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" className="foods-btn-icon">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg viewBox="0 0 24 24" className="foods-btn-icon">
      <path d="M5 4h12l2 2v14H5V4z" />
      <path d="M8 4v6h8V4" />
      <path d="M8 20v-6h8v6" />
    </svg>
  );
}

function IconFood() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <path d="M7 3v18" />
      <path d="M5 3v5a2 2 0 0 0 4 0V3" />
      <path d="M15 3v18" />
      <path d="M15 3c3 1.2 4.5 3.5 4.5 7 0 2.5-1.3 4-4.5 4" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
      <path d="M12 12v8" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4 8h16" />
      <path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <path d="M12 3l1.4 5.1L18.5 9.5l-5.1 1.4L12 16l-1.4-5.1-5.1-1.4 5.1-1.4L12 3z" />
      <path d="M18 14l.8 2.8L21.5 18l-2.7.8L18 21.5l-.8-2.7-2.7-.8 2.7-1.2L18 14z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="foods-input-icon">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getExpiryPreview(expiryDate) {
  if (!expiryDate) {
    return {
      label: 'Belum ditentukan',
      status: 'Isi tanggal kedaluwarsa terlebih dahulu',
      className: 'neutral',
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      label: 'Tidak Layak',
      status: 'Tanggal kedaluwarsa sudah lewat',
      className: 'danger',
    };
  }

  if (diffDays <= 1) {
    return {
      label: 'Prioritas Tinggi',
      status: diffDays === 0 ? 'Kedaluwarsa hari ini' : 'Kedaluwarsa besok',
      className: 'danger',
    };
  }

  if (diffDays <= 3) {
    return {
      label: 'Prioritas Sedang',
      status: `Kedaluwarsa dalam ${diffDays} hari`,
      className: 'warning',
    };
  }

  return {
    label: 'Prioritas Rendah',
    status: `Masih aman, ${diffDays} hari lagi`,
    className: 'safe',
  };
}

function FoodForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    expiry_date: '',
  });

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [priorityFilter, setPriorityFilter] = useState('semua');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(isEdit);
  const [loadingFoods, setLoadingFoods] = useState(true);

  const preview = useMemo(() => getExpiryPreview(form.expiry_date), [form.expiry_date]);

  const isFormComplete = form.name && form.quantity && form.unit && form.expiry_date;

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      expiry_date: '',
    });
  };

  const fetchFoods = async () => {
    try {
      setLoadingFoods(true);
      const response = await API.get('/foods');
      setFoods(response.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data makanan:', error);
      setMessageType('error');
      setMessage('Gagal mengambil data inventaris makanan');
    } finally {
      setLoadingFoods(false);
    }
  };

  const fetchFoodDetail = async () => {
    try {
      const response = await API.get(`/foods/${id}`);
      const food = response.data.data;

      setForm({
        name: food.name || '',
        category: food.category || '',
        quantity: food.quantity || '',
        unit: food.unit || '',
        expiry_date: food.expiry_date ? food.expiry_date.slice(0, 10) : '',
      });
    } catch (error) {
      console.error('Gagal mengambil detail makanan:', error);
      setMessageType('error');
      setMessage('Gagal mengambil detail makanan');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchFoods();

    if (isEdit) {
      fetchFoodDetail();
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (foodId) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus data makanan ini?');

    if (!confirmDelete) return;

    try {
      await API.delete(`/foods/${foodId}`);

      setMessageType('success');
      setMessage('Data makanan berhasil dihapus');

      if (Number(id) === Number(foodId)) {
        resetForm();
        navigate('/foods/add', { replace: true });
      }

      fetchFoods();

      setTimeout(() => {
        setMessage('');
      }, 2500);
    } catch (error) {
      console.error('Gagal menghapus makanan:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Gagal menghapus makanan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isFormComplete) {
      setMessageType('error');
      setMessage('Nama makanan, jumlah, satuan, dan tanggal kedaluwarsa wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await API.put(`/foods/${id}`, form);

        setMessageType('success');
        setMessage('Data makanan berhasil diperbarui');

        await fetchFoods();

        setTimeout(() => {
          resetForm();
          navigate('/foods/add', { replace: true });
        }, 800);
      } else {
        await API.post('/foods', form);

        setMessageType('success');
        setMessage('Data makanan berhasil ditambahkan');

        resetForm();
        await fetchFoods();

        setTimeout(() => {
          setMessage('');
        }, 2500);
      }
    } catch (error) {
      console.error('Gagal menyimpan data makanan:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Gagal menyimpan data makanan');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        food.name?.toLowerCase().includes(keyword) ||
        food.category?.toLowerCase().includes(keyword) ||
        food.unit?.toLowerCase().includes(keyword);

      const matchStatus = statusFilter === 'semua' || food.status === statusFilter;
      const matchPriority = priorityFilter === 'semua' || food.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [foods, search, statusFilter, priorityFilter]);

  const totalAman = foods.filter((food) => food.status === 'aman').length;
  const totalMendekati = foods.filter(
    (food) => food.status === 'mendekati_kedaluwarsa'
  ).length;
  const totalKedaluwarsa = foods.filter((food) => food.status === 'kedaluwarsa').length;

  if (loadingDetail) {
    return (
      <div className="foods-page">
        <div className="foods-shell">
          <div className="foods-loading">
            <div className="foods-spinner"></div>
            <div>
              <h3>Memuat detail makanan...</h3>
              <p>Sedang mengambil data makanan yang akan diedit.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="foods-page">
      <div className="foods-orb foods-orb-one"></div>
      <div className="foods-orb foods-orb-two"></div>
      <div className="foods-orb foods-orb-three"></div>

      <div className="foods-shell">
        <header className="food-form-topbar">
          <button className="foods-back-button dark" onClick={() => navigate('/dashboard')}>
            <IconArrowLeft />
            Kembali ke Dashboard
          </button>

          <div className="form-topbar-badge">
            <IconSparkle />
            {isEdit ? 'Mode Edit Data' : 'Mode Tambah Data'}
          </div>
        </header>

        <section className="food-form-hero-new">
          <div className="food-form-hero-left">
            <span className="foods-kicker">
              {isEdit ? 'Edit Inventaris' : 'Tambah Inventaris'}
            </span>

            <h1>{isEdit ? 'Perbarui data makanan' : 'Tambahkan makanan baru'}</h1>

            <p>
              Masukkan data makanan dengan lengkap. Setelah disimpan, daftar
              inventaris langsung muncul di bawah form ini.
            </p>
          </div>

          <div className="food-form-preview-card">
            <div className="preview-card-header">
              <div className="preview-icon">
                <IconFood />
              </div>

              <div>
                <span>Preview Makanan</span>
                <h3>{form.name || 'Nama makanan'}</h3>
              </div>
            </div>

            <div className="preview-data-grid">
              <div>
                <span>Kategori</span>
                <strong>{form.category || 'Belum diisi'}</strong>
              </div>

              <div>
                <span>Jumlah</span>
                <strong>
                  {form.quantity || '0'} {form.unit || 'satuan'}
                </strong>
              </div>
            </div>

            <div className={`preview-priority ${preview.className}`}>
              <span></span>
              <div>
                <strong>{preview.label}</strong>
                <p>{preview.status}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="food-form-layout premium-form-layout">
          <div className="food-form-card premium-form-card">
            <div className="form-card-heading">
              <div className="form-heading-icon">
                <IconBox />
              </div>

              <div>
                <span>Form Inventaris</span>
                <h2>Data makanan</h2>
              </div>
            </div>

            {message && <div className={`foods-message ${messageType}`}>{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="premium-form-group">
                <label>Nama Makanan</label>
                <div className="input-shell">
                  <IconFood />
                  <input
                    type="text"
                    name="name"
                    placeholder="Contoh: Roti Tawar"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="premium-form-group">
                <label>Kategori</label>
                <div className="input-shell">
                  <IconBox />
                  <input
                    type="text"
                    name="category"
                    placeholder="Contoh: Roti, Minuman, Makanan Instan"
                    value={form.category}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="premium-form-row">
                <div className="premium-form-group">
                  <label>Jumlah</label>
                  <div className="input-shell">
                    <IconBox />
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Contoh: 2"
                      value={form.quantity}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="premium-form-group">
                  <label>Satuan</label>
                  <div className="input-shell select-shell">
                    <IconBox />
                    <select name="unit" value={form.unit} onChange={handleChange}>
                      <option value="">Pilih satuan</option>
                      <option value="pcs">pcs</option>
                      <option value="bungkus">bungkus</option>
                      <option value="botol">botol</option>
                      <option value="kotak">kotak</option>
                      <option value="porsi">porsi</option>
                      <option value="kg">kg</option>
                      <option value="gram">gram</option>
                      <option value="liter">liter</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="premium-form-group">
                <label>Tanggal Kedaluwarsa</label>
                <div className="input-shell">
                  <IconCalendar />
                  <input
                    type="date"
                    name="expiry_date"
                    value={form.expiry_date}
                    onChange={handleChange}
                    min={getTodayDate()}
                  />
                </div>
              </div>

              <div className="form-actions premium-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    resetForm();
                    navigate('/foods/add', { replace: true });
                  }}
                >
                  Reset
                </button>

                <button type="submit" className="save-btn" disabled={loading}>
                  <IconSave />
                  {loading
                    ? 'Menyimpan...'
                    : isEdit
                      ? 'Simpan Perubahan'
                      : 'Tambah Makanan'}
                </button>
              </div>
            </form>
          </div>

          <aside className="food-form-info premium-info-panel">
            <div className="info-icon">
              <IconInfo />
            </div>

            <h3>Prioritas otomatis</h3>

            <p>
              Sistem membaca tanggal kedaluwarsa lalu menentukan prioritas makanan
              secara otomatis.
            </p>

            <div className="priority-rules">
              <div className="priority-rule danger">
                <span></span>
                <div>
                  <strong>Prioritas Tinggi</strong>
                  <p>Kedaluwarsa hari ini atau besok</p>
                </div>
              </div>

              <div className="priority-rule warning">
                <span></span>
                <div>
                  <strong>Prioritas Sedang</strong>
                  <p>Kedaluwarsa dalam 2–3 hari</p>
                </div>
              </div>

              <div className="priority-rule safe">
                <span></span>
                <div>
                  <strong>Prioritas Rendah</strong>
                  <p>Kedaluwarsa lebih dari 3 hari</p>
                </div>
              </div>
            </div>

            <div className="info-note premium-note">
              <strong>Alur halaman</strong>
              <p>
                Setelah tambah atau edit makanan, inventaris di bawah form akan
                langsung diperbarui tanpa perlu pindah halaman.
              </p>
            </div>
          </aside>
        </section>

        <section className="inline-inventory-section">
          <div className="inline-inventory-heading">
            <div>
              <span>Inventaris Langsung</span>
              <h2>Daftar makanan tersimpan</h2>
              <p>
                Data di bawah ini langsung terhubung dengan form di atas. Kamu bisa
                edit atau hapus makanan dari sini.
              </p>
            </div>

            <div className="inline-inventory-stats">
              <div>
                <strong>{foods.length}</strong>
                <span>Total</span>
              </div>
              <div>
                <strong>{totalAman}</strong>
                <span>Aman</span>
              </div>
              <div>
                <strong>{totalMendekati}</strong>
                <span>Mendekati</span>
              </div>
              <div>
                <strong>{totalKedaluwarsa}</strong>
                <span>Kedaluwarsa</span>
              </div>
            </div>
          </div>

          <div className="foods-toolbar compact-toolbar">
            <div className="foods-search-box">
              <IconSearch />
              <input
                type="text"
                placeholder="Cari makanan, kategori, atau satuan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="foods-filter-group">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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

          {loadingFoods ? (
            <div className="foods-loading">
              <div className="foods-spinner"></div>
              <div>
                <h3>Memuat inventaris...</h3>
                <p>Sedang mengambil daftar makanan tersimpan.</p>
              </div>
            </div>
          ) : foods.length === 0 ? (
            <div className="empty-foods inline-empty">
              <div className="empty-icon">
                <IconBox />
              </div>

              <h2>Belum ada makanan tercatat</h2>
              <p>Tambahkan makanan pertama melalui form di atas.</p>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="empty-foods inline-empty">
              <div className="empty-icon">
                <IconSearch />
              </div>

              <h2>Data tidak ditemukan</h2>
              <p>Coba gunakan kata kunci lain atau reset filter.</p>

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
            <section className="food-grid inline-food-grid">
              {filteredFoods.map((food, index) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  index={index}
                  onEdit={() => navigate(`/foods/edit/${food.id}`)}
                  onDelete={() => handleDelete(food.id)}
                />
              ))}
            </section>
          )}
        </section>
      </div>
    </div>
  );
}

export default FoodForm;