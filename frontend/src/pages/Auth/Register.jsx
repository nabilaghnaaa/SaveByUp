import { useState } from 'react';
import { registerUser } from '../../services/authService';

import LoginBrand from './components/LoginBrand';
import LoginVisual from './components/LoginVisual';

import './styles/login.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleGoLogin = () => {
    window.location.href = '/login';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setMessageType('error');
      setMessage('Nama, email, password, dan konfirmasi password wajib diisi.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessageType('error');
      setMessage('Password dan konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
      };

      await registerUser(payload);

      setMessageType('success');
      setMessage('Register berhasil. Mengalihkan ke login...');

      setTimeout(() => {
        window.location.replace('/login');
      }, 700);
    } catch (error) {
      console.error('Register error:', error);

      setMessageType('error');
      setMessage(error.response?.data?.message || 'Register gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-orb login-orb-one"></div>
      <div className="login-orb login-orb-two"></div>
      <div className="login-noise"></div>

      <section className="login-shell">
        <div className="login-left">
          <LoginBrand />

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-header">
              <p>Mulai Sekarang</p>
              <h1>Buat Akun SaveByUp</h1>
              <span>
                Daftar untuk mulai menyelamatkan makanan berlebih dan menemukan
                penawaran hemat di sekitarmu.
              </span>
            </div>

            {message && (
              <div className={`login-message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="login-input-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>

            <p className="login-switch-text">
              Sudah punya akun?{' '}
              <button type="button" onClick={handleGoLogin}>
                Masuk di sini
              </button>
            </p>
          </form>
        </div>

        <LoginVisual />
      </section>
    </main>
  );
}

export default Register;