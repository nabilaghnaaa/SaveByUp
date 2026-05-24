import { useState } from "react";

import { loginUser } from "../../../../services/authService";

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!form.password.trim()) {
      return "Password wajib diisi.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await loginUser(form);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.message ||
          "Login gagal. Periksa kembali email dan password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {message && <div className="login-message">{message}</div>}

      <div className="login-field">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          placeholder="Masukkan email"
          onChange={(event) => handleChange("email", event.target.value)}
        />
      </div>

      <div className="login-field">
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          placeholder="Masukkan password"
          onChange={(event) => handleChange("password", event.target.value)}
        />
      </div>

      <button type="submit" className="login-submit" disabled={loading}>
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}