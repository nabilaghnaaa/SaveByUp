import { useEffect, useRef, useState } from "react";

import { uploadFoodImage } from "../../../services/uploadService";

import "../styles/foodImageUpload.css";

export default function FoodImageUpload({ form, onChange }) {
  const uploadInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return "Format foto harus JPG, PNG, atau WEBP.";
    }

    if (file.size > 2 * 1024 * 1024) {
      return "Ukuran foto maksimal 2MB.";
    }

    return "";
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const errorMessage = validateFile(file);

    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const imageUrl = await uploadFoodImage(file);

      if (!imageUrl) {
        setMessage("Foto berhasil diunggah, tetapi URL gambar tidak ditemukan.");
        return;
      }

      onChange("image_url", imageUrl);
      setMessage("Foto berhasil diunggah.");
    } catch (error) {
      console.error("Gagal upload foto:", error);
      setMessage(
        error.response?.data?.message || "Gagal mengunggah foto makanan."
      );
    } finally {
      setUploading(false);
    }
  };

  const openCamera = async () => {
    try {
      setMessage("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessage("Browser tidak mendukung akses kamera.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error("Gagal membuka kamera:", error);
      setMessage(
        "Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau gunakan Upload Foto."
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setMessage("Gagal mengambil foto dari kamera.");
          return;
        }

        const file = new File([blob], `food-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        closeCamera();
        await handleUpload(file);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    await handleUpload(file);
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    onChange("image_url", "");
    setMessage("");
  };

  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, []);

  return (
    <section className="food-image-upload">
      <div className="food-image-preview">
        {form.image_url ? (
          <img src={form.image_url} alt="Preview makanan" />
        ) : (
          <div className="food-image-empty">
            <span>IMG</span>
            <p>Belum ada foto makanan.</p>
          </div>
        )}
      </div>

      <div className="food-image-content">
        <span>Foto Makanan</span>

        <h3>Tambahkan foto produk</h3>

        <p>
          Ambil foto langsung dari kamera atau upload gambar dari perangkat.
          Foto ini akan dipakai untuk inventaris dan marketplace.
        </p>

        {message && <div className="food-image-message">{message}</div>}

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="food-image-input"
          onChange={handleFileChange}
        />

        <div className="food-image-actions">
          <button
            type="button"
            className="sb-btn sb-btn-primary"
            onClick={openCamera}
            disabled={uploading}
          >
            Buka Kamera
          </button>

          <button
            type="button"
            className="sb-btn food-image-secondary"
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
          >
            Upload Foto
          </button>

          {form.image_url && (
            <button
              type="button"
              className="sb-btn food-image-remove"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              Hapus Foto
            </button>
          )}
        </div>

        <small>Format: JPG, PNG, WEBP. Maksimal 2MB.</small>
      </div>

      {cameraOpen && (
        <div className="camera-modal">
          <div className="camera-card">
            <div className="camera-header">
              <div>
                <span>Kamera Produk</span>
                <h3>Ambil foto makanan</h3>
              </div>

              <button type="button" onClick={closeCamera}>
                ×
              </button>
            </div>

            <video ref={videoRef} className="camera-video" playsInline muted />

            <div className="camera-actions">
              <button
                type="button"
                className="sb-btn food-image-remove"
                onClick={closeCamera}
              >
                Batal
              </button>

              <button
                type="button"
                className="sb-btn sb-btn-primary"
                onClick={capturePhoto}
                disabled={uploading}
              >
                {uploading ? "Mengunggah..." : "Ambil Foto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}