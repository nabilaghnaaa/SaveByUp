import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await API.post('/auth/register', form);

      setMessage(response.data.message || 'Registrasi berhasil');

      setTimeout(() => {
        navigate('/login');
      }, 900);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <h1>SaveByUp</h1>
            <p>Food inventory & marketplace</p>
          </div>
        </div>

        <h2>Daftar Akun</h2>
        <p className="subtitle">
          Buat akun untuk mulai mengelola stok makanan dan mengurangi food waste.
        </p>

        {message && <div className="alert">{message}</div>}

        <form onSubmit={handleRegister}>
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="name"
            placeholder="Contoh: Regina Rana Nabila"
            value={form.name}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Contoh: regina@gmail.com"
            value={form.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Minimal 6 karakter"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="link-text">
          Sudah punya akun? <Link to="/login">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;