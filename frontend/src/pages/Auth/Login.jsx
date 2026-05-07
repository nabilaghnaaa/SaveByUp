import { useState } from 'react';

import { loginUser } from '../../services/authService';

import LoginBrand from './components/LoginBrand';
import LoginForm from './components/LoginForm';
import LoginVisual from './components/LoginVisual';

import './styles/login.css';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
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

  const handleGoRegister = () => {
    window.location.href = '/register';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');

    if (!form.email || !form.password) {
      setMessageType('error');
      setMessage('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(form);

      if (!data?.token || !data?.user) {
        setMessageType('error');
        setMessage('Response login tidak valid. Token atau data user tidak ditemukan.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessageType('success');
      setMessage('Login berhasil. Mengalihkan ke dashboard...');

      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);

      setMessageType('error');
      setMessage(error.response?.data?.message || 'Login gagal. Coba lagi.');
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

          <LoginForm
            form={form}
            message={message}
            messageType={messageType}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onGoRegister={handleGoRegister}
          />
        </div>

        <LoginVisual />
      </section>
    </main>
  );
}

export default Login;