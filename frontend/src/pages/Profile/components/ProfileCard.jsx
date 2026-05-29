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
  onSubmit,
}) {
  const photoSource =
    profile.photoPreview || profile.photo_url || profile.avatar_url || "";

  return (
    <form className="profile-page" onSubmit={onSubmit}>
      <aside className="profile-side">
        <div className="profile-side-glow" />

        <div className="profile-avatar-zone">
          <div className="profile-avatar">
            {photoSource ? (
              <img src={photoSource} alt={profile.name || "Foto profil"} />
            ) : (
              <span>{getInitial(profile.name)}</span>
            )}
          </div>

          <label className="profile-photo-button">
            <span>Ganti Foto</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(event) =>
                onPhotoChange(event.target.files?.[0] || null)
              }
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
            <span>Rating Akun</span>
            <strong>{Number(profile.rating || 0).toFixed(1)}</strong>
          </div>

          <small>/ 5 berdasarkan transaksi selesai</small>
        </div>

        <div className="profile-completion-card">
          <div className="profile-completion-head">
            <span>Kelengkapan</span>
            <strong>{completeness.percent}%</strong>
          </div>

          <div className="profile-completion-bar">
            <div style={{ width: `${completeness.percent}%` }} />
          </div>

          {completeness.missing.length > 0 ? (
            <small>Belum lengkap: {completeness.missing.join(", ")}</small>
          ) : (
            <small>Profil kamu sudah lengkap.</small>
          )}
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
        </div>

        <div className="profile-tips">
          <span>Tips Profil</span>
          <p>
            Gunakan foto yang jelas, nomor WhatsApp aktif, dan area COD yang
            mudah dikenali agar calon pembeli atau penjual lebih percaya.
          </p>
        </div>
      </aside>

      <section className="profile-form">
        <div className="profile-form-header">
          <span>Informasi Akun</span>
          <h3>Lengkapi data profil dan kontak</h3>
          <p>
            Data ini dipakai untuk marketplace, pengajuan pembelian, komunikasi
            WhatsApp, rating, dan area COD.
          </p>
        </div>

        <div className="profile-form-grid">
          <div className="profile-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={profile.name}
              placeholder="Masukkan nama lengkap"
              maxLength="80"
              onChange={(event) => onChange("name", event.target.value)}
            />
            <small>Minimal 3 karakter dan maksimal 80 karakter.</small>
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
              value={profile.phone || ""}
              placeholder="Contoh: 6281234567890"
              onChange={(event) => onPhoneChange("phone", event.target.value)}
            />
            <small>Opsional. Boleh disamakan dengan nomor WhatsApp.</small>
          </div>

          <div className="profile-group">
            <label>Nomor WhatsApp</label>
            <input
              type="text"
              value={profile.whatsapp}
              placeholder="Contoh: 6281234567890"
              onChange={(event) =>
                onPhoneChange("whatsapp", event.target.value)
              }
            />
            <small>
              Wajib diisi. Gunakan format 62 agar tombol WhatsApp langsung
              terbuka.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Alamat Kos / Area COD</label>
            <textarea
              rows="5"
              value={profile.address}
              placeholder="Contoh: Area Tamantirto, dekat Kampus UMY"
              maxLength="220"
              onChange={(event) => onChange("address", event.target.value)}
            />
            <small>
              Tidak harus alamat lengkap. Cukup tulis area COD yang aman dan
              mudah ditemukan. Maksimal 220 karakter.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Bio Singkat</label>
            <textarea
              rows="4"
              value={profile.bio || ""}
              placeholder="Contoh: Mahasiswa UMY, biasa COD sekitar kampus atau kos."
              maxLength="160"
              onChange={(event) => onChange("bio", event.target.value)}
            />
            <small>{String(profile.bio || "").length}/160 karakter</small>
          </div>
        </div>

        <div className="profile-actions">
          <div>
            <strong>Pastikan data sudah benar</strong>
            <p>
              Profil lengkap membantu proses transaksi SaveByUp jadi lebih aman
              dan jelas.
            </p>
          </div>

          <button
            type="submit"
            className="sb-btn sb-btn-primary"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </section>
    </form>
  );
}