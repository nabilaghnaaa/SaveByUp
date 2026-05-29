import { useEffect, useMemo, useState } from "react";

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

const allowedPhotoTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const normalizePhoneNumber = (value = "") => {
  return String(value || "")
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");
};

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const completeness = useMemo(() => {
    const fields = [
      {
        label: "Nama",
        complete: Boolean(String(profile.name || "").trim()),
      },
      {
        label: "Email",
        complete: Boolean(String(profile.email || "").trim()),
      },
      {
        label: "WhatsApp",
        complete: Boolean(String(profile.whatsapp || "").trim()),
      },
      {
        label: "Area COD",
        complete: Boolean(String(profile.address || "").trim()),
      },
      {
        label: "Foto",
        complete: Boolean(
          profile.photoPreview || profile.photo_url || profile.avatar_url
        ),
      },
    ];

    const completed = fields.filter((item) => item.complete).length;
    const percent = Math.round((completed / fields.length) * 100);

    return {
      fields,
      completed,
      total: fields.length,
      percent,
      missing: fields.filter((item) => !item.complete).map((item) => item.label),
    };
  }, [profile]);

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      showMessage("", "info");

      const data = await getProfile();

      setProfile((prev) => {
        if (prev.photoPreview) {
          URL.revokeObjectURL(prev.photoPreview);
        }

        return {
          ...initialProfile,
          ...data,
          photoFile: null,
          photoPreview: "",
        };
      });
    } catch (error) {
      console.error("Gagal mengambil profil:", error);

      showMessage(
        error.response?.data?.message || "Gagal mengambil data profil.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (profile.photoPreview) {
        URL.revokeObjectURL(profile.photoPreview);
      }
    };
  }, [profile.photoPreview]);

  const handleChange = (name, value) => {
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (name, value) => {
    setProfile((prev) => ({
      ...prev,
      [name]: normalizePhoneNumber(value),
    }));
  };

  const handlePhotoChange = (file) => {
    if (!file) {
      setProfile((prev) => {
        if (prev.photoPreview) {
          URL.revokeObjectURL(prev.photoPreview);
        }

        return {
          ...prev,
          photoFile: null,
          photoPreview: "",
        };
      });

      return;
    }

    if (!allowedPhotoTypes.includes(file.type)) {
      showMessage("Format foto harus JPG, JPEG, PNG, atau WEBP.", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Ukuran foto maksimal 2MB.", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProfile((prev) => {
      if (prev.photoPreview) {
        URL.revokeObjectURL(prev.photoPreview);
      }

      return {
        ...prev,
        photoFile: file,
        photoPreview: previewUrl,
      };
    });

    showMessage("Foto berhasil dipilih. Klik Simpan Profil untuk menyimpan.", "info");
  };

  const validateProfile = () => {
    const name = String(profile.name || "").trim();
    const phone = normalizePhoneNumber(profile.phone);
    const whatsapp = normalizePhoneNumber(profile.whatsapp);
    const address = String(profile.address || "").trim();
    const bio = String(profile.bio || "").trim();

    if (!name) {
      return "Nama wajib diisi.";
    }

    if (name.length < 3) {
      return "Nama minimal 3 karakter.";
    }

    if (name.length > 80) {
      return "Nama maksimal 80 karakter.";
    }

    if (phone && !/^\+?\d{8,15}$/.test(phone)) {
      return "Nomor HP harus 8 sampai 15 digit. Contoh: 6281234567890.";
    }

    if (!whatsapp) {
      return "Nomor WhatsApp wajib diisi.";
    }

    if (!/^\+?\d{8,15}$/.test(whatsapp)) {
      return "Nomor WhatsApp harus 8 sampai 15 digit. Contoh: 6281234567890.";
    }

    if (!address) {
      return "Area COD wajib diisi.";
    }

    if (address.length < 5) {
      return "Area COD terlalu pendek. Contoh: Area Tamantirto dekat UMY.";
    }

    if (address.length > 220) {
      return "Area COD maksimal 220 karakter.";
    }

    if (bio.length > 160) {
      return "Bio maksimal 160 karakter.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateProfile();

    if (errorMessage) {
      showMessage(errorMessage, "error");
      return;
    }

    try {
      setSaving(true);
      showMessage("", "info");

      const response = await updateProfile({
        name: profile.name.trim(),
        phone: normalizePhoneNumber(profile.phone),
        whatsapp: normalizePhoneNumber(profile.whatsapp),
        address: profile.address.trim(),
        bio: String(profile.bio || "").trim(),
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
          updatedProfile.photo_url ||
          updatedProfile.avatar_url ||
          updatedProfile.photo ||
          profile.photo_url ||
          profile.avatar_url ||
          profile.photo,
        photo:
          updatedProfile.photo_url ||
          updatedProfile.photo ||
          updatedProfile.avatar_url ||
          profile.photo_url ||
          profile.photo ||
          profile.avatar_url,
        rating: updatedProfile.rating ?? profile.rating,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      showMessage("Profil berhasil diperbarui.", "success");

      await fetchProfile();
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);

      showMessage(
        error.response?.data?.message || "Gagal memperbarui data profil.",
        "error"
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
          description="Lengkapi identitas, foto profil, WhatsApp, area COD, dan bio agar transaksi marketplace lebih jelas dan terpercaya."
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
            <span>User Trust Profile</span>
            <h2>Profil yang rapi bikin transaksi lebih dipercaya.</h2>
            <p>
              Foto profil, WhatsApp aktif, area COD, bio singkat, dan rating
              membantu pengguna lain mengenali kamu sebelum melakukan transaksi.
            </p>
          </div>

          <div className="profile-hero-card">
            <span>Kelengkapan Profil</span>
            <strong>{loading ? "..." : `${completeness.percent}%`}</strong>
            <p>
              {completeness.completed}/{completeness.total} data penting sudah
              terisi.
            </p>

            <div className="profile-hero-progress">
              <div style={{ width: `${completeness.percent}%` }} />
            </div>
          </div>
        </section>

        {message && (
          <div className={`profile-message profile-message-${messageType}`}>
            {message}
          </div>
        )}

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
            completeness={completeness}
            onChange={handleChange}
            onPhoneChange={handlePhoneChange}
            onPhotoChange={handlePhotoChange}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </AppShell>
  );
}