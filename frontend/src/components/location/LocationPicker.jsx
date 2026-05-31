import { useMemo, useState } from "react";

import {
  buildLocationLabel,
  buildMapsUrl,
  buildOpenStreetMapEmbedUrl,
  formatCoordinate,
  getCurrentPosition,
  isValidCoordinate,
} from "../../services/locationService";

import "./locationPicker.css";

export default function LocationPicker({
  latitude,
  longitude,
  locationLabel,
  disabled = false,
  onChange,
  onMessage,
}) {
  const [detecting, setDetecting] = useState(false);

  const hasLocation = isValidCoordinate(latitude, longitude);

  const mapUrl = useMemo(() => {
    return hasLocation ? buildOpenStreetMapEmbedUrl(latitude, longitude) : "";
  }, [hasLocation, latitude, longitude]);

  const googleMapsUrl = useMemo(() => {
    return hasLocation ? buildMapsUrl(latitude, longitude) : "";
  }, [hasLocation, latitude, longitude]);

  const sendMessage = (text, type = "info") => {
    if (typeof onMessage === "function") {
      onMessage(text, type);
    }
  };

  const updateLocation = (nextLocation = {}) => {
    if (typeof onChange === "function") {
      onChange(nextLocation);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setDetecting(true);
      sendMessage("", "info");

      const position = await getCurrentPosition();

      updateLocation({
        latitude: formatCoordinate(position.latitude),
        longitude: formatCoordinate(position.longitude),
        location_label: buildLocationLabel(position),
      });

      sendMessage(
        "Lokasi GPS berhasil terdeteksi. Klik Simpan Profil untuk menyimpan titik lokasi.",
        "success"
      );
    } catch (error) {
      sendMessage(error.message || "Gagal mengambil lokasi GPS.", "error");
    } finally {
      setDetecting(false);
    }
  };

  const handleCoordinateChange = (name, value) => {
    const nextLatitude = name === "latitude" ? value : latitude;
    const nextLongitude = name === "longitude" ? value : longitude;

    updateLocation({
      latitude: nextLatitude,
      longitude: nextLongitude,
      location_label: locationLabel,
    });
  };

  const handleLabelChange = (value) => {
    updateLocation({
      latitude,
      longitude,
      location_label: value,
    });
  };

  const handleClearLocation = () => {
    updateLocation({
      latitude: "",
      longitude: "",
      location_label: "",
    });

    sendMessage("Titik lokasi dihapus dari form. Klik Simpan Profil untuk menyimpan perubahan.", "info");
  };

  return (
    <section className="location-picker-card">
      <div className="location-picker-header">
        <div>
          <span>GPS & Maps</span>
          <h4>Atur titik lokasi pribadi</h4>
          <p>
            Titik detail ini tidak ditampilkan ke pengguna lain sebelum transaksi
            disetujui. Pengguna lain hanya melihat estimasi jarak.
          </p>
        </div>

        <div className={`location-picker-status ${hasLocation ? "active" : ""}`}>
          {hasLocation ? "Lokasi aktif" : "Belum ada titik"}
        </div>
      </div>

      <div className="location-picker-actions">
        <button
          type="button"
          className="location-picker-primary"
          onClick={handleUseCurrentLocation}
          disabled={disabled || detecting}
        >
          {detecting ? "Mendeteksi GPS..." : "Gunakan Lokasi Saya"}
        </button>

        {hasLocation && (
          <a
            className="location-picker-secondary"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Buka di Google Maps
          </a>
        )}

        <button
          type="button"
          className="location-picker-secondary"
          onClick={handleClearLocation}
          disabled={disabled || detecting}
        >
          Hapus Titik
        </button>
      </div>

      <div className="location-picker-map">
        {hasLocation ? (
          <iframe
            title="Preview titik lokasi"
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="location-picker-empty-map">
            <strong>Maps belum tersedia</strong>
            <p>Klik “Gunakan Lokasi Saya” untuk menampilkan titik di maps.</p>
          </div>
        )}
      </div>

      <div className="location-picker-grid">
        <div className="profile-group">
          <label>Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude ?? ""}
            placeholder="-7.80123456"
            disabled={disabled || detecting}
            onChange={(event) =>
              handleCoordinateChange("latitude", event.target.value)
            }
          />
        </div>

        <div className="profile-group">
          <label>Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude ?? ""}
            placeholder="110.36456789"
            disabled={disabled || detecting}
            onChange={(event) =>
              handleCoordinateChange("longitude", event.target.value)
            }
          />
        </div>

        <div className="profile-group profile-group-full">
          <label>Label Lokasi</label>
          <input
            type="text"
            value={locationLabel || ""}
            placeholder="Contoh: Sekitar UMY / Kos area Tamantirto"
            disabled={disabled || detecting}
            onChange={(event) => handleLabelChange(event.target.value)}
          />
          <small>
            Label ini boleh dibuat umum. Titik koordinat detail hanya dibuka
            setelah transaksi disetujui.
          </small>
        </div>
      </div>
    </section>
  );
}