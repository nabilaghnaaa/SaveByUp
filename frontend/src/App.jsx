import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing/Landing";

import Login from "./pages/Auth/login/Login";
import Register from "./pages/Auth/register/Register";

import Dashboard from "./pages/Dashboard/Dashboard";
import FoodForm from "./pages/Foods/FoodForm";

import Marketplace from "./pages/Marketplace/Marketplace";
import MarketplaceDetail from "./pages/Marketplace/MarketplaceDetail";
import SellProduct from "./pages/Marketplace/SellProduct";
import IncomingRequests from "./pages/Marketplace/IncomingRequests";

import Notifications from "./pages/Notifications/Notifications";
import Transactions from "./pages/Transactions/Transactions";
import Profile from "./pages/Profile/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/foods/add"
        element={
          <ProtectedRoute>
            <FoodForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/foods/edit/:id"
        element={
          <ProtectedRoute>
            <FoodForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace/:id"
        element={
          <ProtectedRoute>
            <MarketplaceDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace/sell/:foodId"
        element={
          <ProtectedRoute>
            <SellProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace/requests"
        element={
          <ProtectedRoute>
            <IncomingRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;