import LocationPicker from "../../../components/location/LocationPicker";

import "../styles/profile.css";

function getInitial(name) {
  if (!name) return "S";
  return name.charAt(0).toUpperCase();
}

export default function ProfileCard({
  profile,
  saving,
  completeness,
  onChange,
  onPhoneChange,
  onPhotoChange,
  onLocationChange,
  onMessage,
  onSubmit,
}) {
  const avatarSource =
    profile.photoPreview || profile.photo_url || profile.avatar_url || profile.photo;

  const missingText =
    completeness?.missing?.length > 0
      ? completeness.missing.join(", ")
      : "Semua data penting sudah terisi.";

  return (
    <form className="profile-page" onSubmit={onSubmit}>
      <aside className="profile-side">
        <div className="profile-side-glow" />

        <div className="profile-avatar-zone">
          <div className="profile-avatar">
            {avatarSource ? (
              <img src={avatarSource} alt={profile.name || "Foto profil"} />
            ) : (
              getInitial(profile.name)
            )}
          </div>

          <label className="profile-photo-button">
            Ganti Foto
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              disabled={saving}
              onChange={(event) => onPhotoChange(event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="profile-side-info">
          <span>SaveByUp User</span>
          <h2>{profile.name || "Pengguna"}</h2>
          <p>{profile.email || "Email belum tersedia"}</p>
        </div>

        <div className="profile-rating-card">
          <div>
            <span>Rating</span>
            <strong>{Number(profile.rating || 0).toFixed(1)}</strong>
          </div>
          <small>/ 5 Rating dari transaksi selesai</small>
        </div>

        <div className="profile-completion-card">
          <div className="profile-completion-head">
            <span>Kelengkapan</span>
            <strong>{completeness?.percent || 0}%</strong>
          </div>

          <div className="profile-completion-bar">
            <div style={{ width: `${completeness?.percent || 0}%` }} />
          </div>

          <small>Kurang: {missingText}</small>
        </div>

        <div className="profile-mini-grid">
          <div>
            <span>WhatsApp</span>
            <strong>{profile.whatsapp ? "Aktif" : "Belum diisi"}</strong>
          </div>

          <div>
            <span>Area COD</span>
            <strong>{profile.address ? "Tersedia" : "Belum diisi"}</strong>
          </div>

          <div>
            <span>Titik GPS</span>
            <strong>{profile.has_location ? "Tersimpan" : "Belum ada"}</strong>
          </div>

          <div>
            <span>Privasi Lokasi</span>
            <strong>Aman</strong>
          </div>
        </div>

        <div className="profile-tips">
          <span>Tips Profil</span>
          <p>
            Titik GPS hanya dipakai untuk menghitung estimasi jarak. Lokasi
            detail baru dibuka setelah transaksi disetujui dan masuk tahap COD.
          </p>
        </div>
      </aside>

      <section className="profile-form">
        <div className="profile-form-header">
          <span>Informasi Akun</span>
          <h3>Data profil dan kontak</h3>
          <p>
            Pastikan data kamu benar agar pengguna lain dapat mengenali penjual
            atau pembeli dengan lebih jelas.
          </p>
        </div>

        <div className="profile-form-grid">
          <div className="profile-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={profile.name}
              disabled={saving}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </div>

          <div className="profile-group">
            <label>Email</label>
            <input type="email" value={profile.email} disabled />
            <small>Email tidak dapat diubah dari halaman ini.</small>
          </div>

          <div className="profile-group">
            <label>Nomor HP</label>
            <input
              type="text"
              value={profile.phone}
              placeholder="6281234567890"
              disabled={saving}
              onChange={(event) => onPhoneChange("phone", event.target.value)}
            />
          </div>

          <div className="profile-group">
            <label>Nomor WhatsApp</label>
            <input
              type="text"
              value={profile.whatsapp}
              placeholder="6281234567890"
              disabled={saving}
              onChange={(event) =>
                onPhoneChange("whatsapp", event.target.value)
              }
            />
            <small>
              Gunakan format internasional agar tombol WhatsApp bisa langsung
              terbuka.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Area COD</label>
            <input
              type="text"
              value={profile.address}
              placeholder="Contoh: Area Tamantirto dekat UMY"
              disabled={saving}
              onChange={(event) => onChange("address", event.target.value)}
            />
            <small>
              Area ini boleh dibuat umum. Detail titik GPS tetap disembunyikan
              sampai transaksi disetujui.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Bio Singkat</label>
            <textarea
              value={profile.bio}
              placeholder="Contoh: Mahasiswa UMY, sering COD area kampus."
              disabled={saving}
              onChange={(event) => onChange("bio", event.target.value)}
            />
            <small>Bio maksimal 160 karakter.</small>
          </div>

          <div className="profile-group profile-group-full">
            <LocationPicker
              latitude={profile.latitude}
              longitude={profile.longitude}
              locationLabel={profile.location_label}
              disabled={saving}
              onChange={onLocationChange}
              onMessage={onMessage}
            />
          </div>
        </div>

        <div className="profile-actions">
          <div>
            <strong>Simpan perubahan profil</strong>
            <p>
              Data lokasi akan disimpan sebagai titik privat untuk estimasi
              jarak marketplace.
            </p>
          </div>

          <button type="submit" className="sb-btn sb-btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </section>
    </form>
  );
}