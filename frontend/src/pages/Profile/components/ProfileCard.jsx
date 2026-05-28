import "../styles/profile.css";

function getInitial(name) {
  if (!name) return "S";
  return name.charAt(0).toUpperCase();
}

export default function ProfileCard({
  profile,
  saving,
  onChange,
  onPhotoChange,
  onSubmit,
}) {
  const photoSource =
    profile.photoPreview || profile.photo_url || profile.avatar_url || "";

  return (
    <form className="profile-page" onSubmit={onSubmit}>
      <aside className="profile-side">
        <div className="profile-side-glow" />

        <div className="profile-avatar">
          {photoSource ? (
            <img src={photoSource} alt={profile.name || "Foto profil"} />
          ) : (
            <span>{getInitial(profile.name)}</span>
          )}
        </div>

        <div className="profile-side-info">
          <span>SaveByUp User</span>
          <h2>{profile.name || "Pengguna"}</h2>
          <p>{profile.email || "Email belum tersedia"}</p>

          <div className="profile-rating">
            <strong>{Number(profile.rating || 0).toFixed(1)}</strong>
            <span>/ 5 Rating</span>
          </div>
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
            Foto profil, nomor WhatsApp, dan area COD membantu proses komunikasi
            setelah pengajuan marketplace disetujui.
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
              placeholder="Masukkan nama lengkap"
              onChange={(event) => onChange("name", event.target.value)}
            />
          </div>

          <div className="profile-group">
            <label>Email</label>
            <input type="email" value={profile.email} disabled />
            <small>Email tidak dapat diubah dari halaman ini.</small>
          </div>

          <div className="profile-group">
            <label>Nomor WhatsApp</label>
            <input
              type="text"
              value={profile.whatsapp}
              placeholder="Contoh: 6281234567890"
              onChange={(event) => onChange("whatsapp", event.target.value)}
            />
            <small>
              Gunakan format internasional agar tombol WhatsApp bisa langsung
              terbuka.
            </small>
          </div>

          <div className="profile-group">
            <label>Foto Profil</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(event) =>
                onPhotoChange(event.target.files?.[0] || null)
              }
            />
            <small>
              Pilih foto dari perangkat kamu. Format JPG, JPEG, PNG, atau WEBP.
              Maksimal 2MB.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Alamat Kos / Area COD</label>
            <textarea
              rows="5"
              value={profile.address}
              placeholder="Contoh: Area Tamantirto, dekat Kampus UMY"
              onChange={(event) => onChange("address", event.target.value)}
            />
            <small>
              Tidak harus alamat lengkap. Cukup tulis area COD yang aman dan
              mudah ditemukan.
            </small>
          </div>

          <div className="profile-group profile-group-full">
            <label>Bio Singkat</label>
            <textarea
              rows="4"
              value={profile.bio || ""}
              placeholder="Contoh: Mahasiswa UMY, biasa COD sekitar kampus atau kos."
              onChange={(event) => onChange("bio", event.target.value)}
            />
          </div>
        </div>

        <div className="profile-actions">
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