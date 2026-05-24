import { useState } from "react";

import { registerUser } from "../../../../services/authService";

export default function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Nama lengkap wajib diisi.";
    }

    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!form.password.trim()) {
      return "Password wajib diisi.";
    }

    if (form.password.length < 6) {
      return "Password minimal 6 karakter.";
    }

    if (form.password !== form.confirmPassword) {
      return "Konfirmasi password tidak sama.";
    }

    if (form.whatsapp && !/^[0-9+\-\s]+$/.test(form.whatsapp)) {
      return "Nomor WhatsApp hanya boleh berisi angka, +, -, atau spasi.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setMessage(errorMessage);
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSuccessMessage("");

      await registerUser(form);

      setSuccessMessage("Akun berhasil dibuat. Kamu akan diarahkan ke login.");

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 900);
    } catch (error) {
      console.error("Register error:", error);

      setMessage(
        error.response?.data?.message ||
          "Registrasi gagal. Coba gunakan email lain."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      {message && <div className="register-message error">{message}</div>}

      {successMessage && (
        <div className="register-message success">{successMessage}</div>
      )}

      <div className="register-field">
        <label>Nama Lengkap</label>
        <input
          type="text"
          value={form.name}
          placeholder="Masukkan nama lengkap"
          onChange={(event) => handleChange("name", event.target.value)}
        />
      </div>

      <div className="register-field">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          placeholder="Masukkan email"
          onChange={(event) => handleChange("email", event.target.value)}
        />
      </div>

      <div className="register-field">
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          placeholder="Minimal 6 karakter"
          onChange={(event) => handleChange("password", event.target.value)}
        />
      </div>

      <div className="register-field">
        <label>Konfirmasi Password</label>
        <input
          type="password"
          value={form.confirmPassword}
          placeholder="Ulangi password"
          onChange={(event) =>
            handleChange("confirmPassword", event.target.value)
          }
        />
      </div>

      <div className="register-field">
        <label>Nomor WhatsApp</label>
        <input
          type="text"
          value={form.whatsapp}
          placeholder="Contoh: 6281234567890"
          onChange={(event) => handleChange("whatsapp", event.target.value)}
        />
      </div>

      <div className="register-field">
        <label>Area Kos / COD</label>
        <input
          type="text"
          value={form.address}
          placeholder="Contoh: Tamantirto, dekat UMY"
          onChange={(event) => handleChange("address", event.target.value)}
        />
      </div>

      <button type="submit" className="register-submit" disabled={loading}>
        {loading ? "Membuat akun..." : "Daftar"}
      </button>
    </form>
  );
}