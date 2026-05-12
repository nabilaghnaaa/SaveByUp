import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../../services/authService';

import RegisterBrand from './register/components/RegisterBrand';
import RegisterForm from './register/components/RegisterForm';
import RegisterVisual from './register/components/RegisterVisual';

import './register/styles/register.css';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleGoLogin = () => {
    setLeaving(true);

    setTimeout(() => {
      navigate('/login');
    }, 450);
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

      setLeaving(true);

      setTimeout(() => {
        navigate('/login');
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
    <main className={`register-page ${leaving ? 'register-page-leave' : ''}`}>
      <div className="register-orb register-orb-one"></div>
      <div className="register-orb register-orb-two"></div>
      <div className="register-noise"></div>

      <section className="register-shell">
        <RegisterVisual />

        <div className="register-right">
          <RegisterBrand />

          <RegisterForm
            form={form}
            message={message}
            messageType={messageType}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onGoLogin={handleGoLogin}
          />
        </div>
      </section>
    </main>
  );
}

export default Register;