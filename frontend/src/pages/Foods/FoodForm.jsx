import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import './styles/foods.css';

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

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" className="food-form-svg">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 16l4-4 3 3 2-2 7 6" />
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(isEdit);

  const preview = useMemo(
    () => getExpiryPreview(form.expiry_date),
    [form.expiry_date]
  );

  const isFormComplete =
    form.name && form.quantity && form.unit && form.expiry_date;

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      expiry_date: '',
    });

    setImageFile(null);
    setImagePreview('');
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

      setImagePreview(food.image_url || food.image || food.photo_url || food.photo || '');
    } catch (error) {
      console.error('Gagal mengambil detail makanan:', error);
      setMessageType('error');
      setMessage('Gagal mengambil detail makanan');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildPayload = () => {
    if (!imageFile) {
      return form;
    }

    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('quantity', form.quantity);
    formData.append('unit', form.unit);
    formData.append('expiry_date', form.expiry_date);
    formData.append('image', imageFile);

    return formData;
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
      const payload = buildPayload();

      if (isEdit) {
        await API.put(`/foods/${id}`, payload);

        setMessageType('success');
        setMessage('Data makanan berhasil diperbarui');

        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        await API.post('/foods', payload);

        setMessageType('success');
        setMessage('Data makanan berhasil ditambahkan');

        resetForm();

        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      }
    } catch (error) {
      console.error('Gagal menyimpan data makanan:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Gagal menyimpan data makanan');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDetail) {
    return (
      <div className="foods-page food-form-page">
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
    <div className="foods-page food-form-page">
      <div className="foods-orb foods-orb-one"></div>
      <div className="foods-orb foods-orb-two"></div>
      <div className="foods-orb foods-orb-three"></div>

      <main className="food-form-main-section">
        <div className="foods-shell">
          <header className="food-form-topbar clean-form-topbar">
            <button
              type="button"
              className="foods-back-button dark"
              onClick={() => navigate('/dashboard')}
            >
              <IconArrowLeft />
              Kembali ke Dashboard
            </button>

            <div className="form-topbar-badge">
              <IconSparkle />
              {isEdit ? 'Mode Edit Data' : 'Mode Tambah Data'}
            </div>
          </header>

          <section className="food-form-layout premium-form-layout only-form-layout">
            <div className="food-form-card premium-form-card">
              <div className="form-card-heading">
                <div className="form-heading-icon">
                  <IconBox />
                </div>

                <div>
                  <span>Form Inventaris</span>
                  <h2>{isEdit ? 'Perbarui data makanan' : 'Tambah makanan baru'}</h2>
                  <p>
                    Isi data makanan dengan lengkap agar sistem bisa menghitung
                    prioritas kedaluwarsa secara otomatis.
                  </p>
                </div>
              </div>

              {message && (
                <div className={`foods-message ${messageType}`}>{message}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="premium-form-group">
                  <label>Foto Produk</label>

                  <label className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    <div className="image-upload-preview">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview produk" />
                      ) : (
                        <IconImage />
                      )}
                    </div>

                    <div className="image-upload-text">
                      <strong>
                        {imagePreview ? 'Ganti foto produk' : 'Upload foto produk'}
                      </strong>
                      <span>Format JPG, PNG, atau WEBP</span>
                    </div>
                  </label>
                </div>

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

                      <select
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                      >
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

                <div className={`preview-priority inline-preview ${preview.className}`}>
                  <span></span>

                  <div>
                    <strong>{preview.label}</strong>
                    <p>{preview.status}</p>
                  </div>
                </div>

                <div className="form-actions premium-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={resetForm}
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
                <strong>Setelah disimpan</strong>

                <p>
                  Data makanan akan tersimpan dan tampil di bagian inventaris pada
                  Dashboard.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

export default FoodForm;