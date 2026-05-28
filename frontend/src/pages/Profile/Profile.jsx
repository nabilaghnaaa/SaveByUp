import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/ui/PageHeader";

import { getProfile, updateProfile } from "../../services/profileService";

import ProfileCard from "./components/ProfileCard";

import "./styles/profile.css";

const initialProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  photo: "",
  photo_url: "",
  avatar_url: "",
  bio: "",
  rating: 0,
  photoFile: null,
  photoPreview: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getProfile();

      setProfile({
        ...initialProfile,
        ...data,
        photoFile: null,
        photoPreview: "",
      });
    } catch (error) {
      console.error("Gagal mengambil profil:", error);

      setMessage(
        error.response?.data?.message || "Gagal mengambil data profil."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (name, value) => {
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (file) => {
    if (!file) {
      setProfile((prev) => ({
        ...prev,
        photoFile: null,
        photoPreview: "",
      }));

      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Format foto harus JPG, JPEG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 2MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProfile((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: previewUrl,
    }));

    setMessage("");
  };

  const validateProfile = () => {
    if (!profile.name.trim()) {
      return "Nama wajib diisi.";
    }

    if (profile.whatsapp && !/^[0-9+\-\s]+$/.test(profile.whatsapp)) {
      return "Nomor WhatsApp hanya boleh berisi angka, +, -, atau spasi.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateProfile();

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        address: profile.address,
        bio: profile.bio,
        photoFile: profile.photoFile,
      });

      const updatedProfile = response.data || {};

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const updatedUser = {
        ...currentUser,
        id: updatedProfile.id || profile.id || currentUser.id,
        name: updatedProfile.name || profile.name,
        email: updatedProfile.email || profile.email || currentUser.email,
        phone: updatedProfile.phone || profile.phone,
        whatsapp: updatedProfile.whatsapp || profile.whatsapp,
        address: updatedProfile.address || profile.address,
        avatar_url:
          updatedProfile.avatar_url ||
          updatedProfile.photo ||
          profile.avatar_url ||
          profile.photo,
        photo:
          updatedProfile.photo ||
          updatedProfile.avatar_url ||
          profile.photo ||
          profile.avatar_url,
        rating: updatedProfile.rating ?? profile.rating,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Profil berhasil diperbarui.");

      await fetchProfile();
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      setMessage(
        error.response?.data?.message || "Gagal memperbarui data profil."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="profile-page-wrapper">
        <div className="profile-orb profile-orb-one" />
        <div className="profile-orb profile-orb-two" />

        <PageHeader
          label="Profil"
          title="Profil Pengguna"
          description="Lengkapi data profil agar fitur marketplace, komunikasi WhatsApp, rating, dan area COD bisa berjalan lebih jelas."
          action={
            <button
              type="button"
              className="sb-btn profile-btn-outline"
              onClick={fetchProfile}
              disabled={loading || saving}
            >
              Refresh
            </button>
          }
        />

        <section className="profile-hero">
          <div className="profile-hero-content">
            <span>User Identity</span>
            <h2>Profil yang jelas membuat transaksi lebih dipercaya.</h2>
            <p>
              Data seperti nama, WhatsApp, area COD, foto profil, dan rating
              membantu proses marketplace berjalan lebih aman, rapi, dan mudah
              dikenali oleh pengguna lain.
            </p>
          </div>

          <div className="profile-hero-card">
            <span>Rating Akun</span>
            <strong>
              {loading ? "..." : Number(profile.rating || 0).toFixed(1)}
            </strong>
            <p>Nilai kepercayaan berdasarkan transaksi yang sudah selesai.</p>
          </div>
        </section>

        {message && <div className="profile-message">{message}</div>}

        {loading ? (
          <div className="profile-state">
            <div className="profile-loader" />
            <h3>Memuat profil...</h3>
            <p>Sedang mengambil data pengguna dari server.</p>
          </div>
        ) : (
          <ProfileCard
            profile={profile}
            saving={saving}
            onChange={handleChange}
            onPhotoChange={handlePhotoChange}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </AppShell>
  );
}