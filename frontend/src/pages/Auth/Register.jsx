import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Register Page</h1>
        <p>Halaman register belum dibuat ulang.</p>

        <button type="button" onClick={() => navigate('/login')}>
          Kembali ke Login
        </button>
      </div>
    </main>
  );
}

export default Register;