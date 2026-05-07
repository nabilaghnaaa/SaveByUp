import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import FoodForm from './pages/Foods/FoodForm';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />

      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <Register />}
      />

      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/foods/add"
        element={token ? <FoodForm /> : <Navigate to="/login" />}
      />

      <Route
        path="/foods/edit/:id"
        element={token ? <FoodForm /> : <Navigate to="/login" />}
      />

      <Route
        path="*"
        element={<Navigate to={token ? '/dashboard' : '/login'} />}
      />
    </Routes>
  );
}

export default App;