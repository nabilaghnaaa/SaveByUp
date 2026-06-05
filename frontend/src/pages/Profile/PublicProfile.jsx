import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";

import { getPublicProfile } from "../../services/profileService";
import { formatDate } from "../../utils/formatDate";

import "./styles/profile.css";

const getInitial = (name = "") => {
  const cleanName = String(name || "").trim();

  if (!cleanName) return "S";

  return cleanName.charAt(0).toUpperCase();
};

const renderStars = (rating = 0) => {
  const roundedRating = Math.round(Number(rating || 0));

  return Array.from({ length: 5 }, (_, index) =>
    index < roundedRating ? "★" : "☆"
  ).join("");
};

const formatRating = (rating = 0) => {
  return Number(rating || 0).toFixed(1);
};

const getSafeLocationText = (profile = {}) => {
  const rawText = String(profile.location_label || profile.address || "").trim();

  const allText = String(
    `${profile.location_label || ""} ${profile.address || ""}`
  ).trim();

  const accuracyMatch =
    allText.match(
      /akurasi\s*[:：]?\s*(±|\+\/-|\+-)?\s*\d+(?:[.,]\d+)?\s*(m|km)/i
    ) || allText.match(/(±|\+\/-|\+-)\s*\d+(?:[.,]\d+)?\s*(m|km)/i);

  if (accuracyMatch) {
    const cleanAccuracy = accuracyMatch[0]
      .replace(/\+\/-/g, "±")
      .replace(/\+-/g, "±")
      .replace(/akurasi\s*[:：]?/i, "")
      .trim();

    return `Akurasi ${cleanAccuracy}`;
  }

  const hasCoordinate =
    /-?\d{1,2}\.\d+\s*,\s*-?\d{1,3}\.\d+/.test(rawText) ||
    /Titik GPS tersimpan/i.test(rawText);

  if (hasCoordinate) {
    return "Lokasi tersimpan";
  }

  return rawText || "-";
};

function StatCard({ label, value, helper, highlight = false }) {
  return (
    <div
      className={highlight ? "public-stat-card highlight" : "public-stat-card"}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </div>
  );
}

function ProductReviewImage({ src, alt }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="public-review-product-image is-placeholder">
        <span>🍱</span>
      </div>
    );
  }

  return (
    <div className="public-review-product-image">
      <img
        src={src}
        alt={alt || "Produk Marketplace"}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

function ReviewItem({ item }) {
  return (
    <article className="public-review-item">
      <div className="public-review-item-main">
        <ProductReviewImage
          src={item.product_image_url}
          alt={item.product_name}
        />

        <div className="public-review-content">
          <div className="public-review-title-row">
            <div>
              <h4>{item.product_name || "Produk Marketplace"}</h4>
              <p>
                Diulas oleh{" "}
                <strong>{item.reviewer_name || "Pengguna SaveByUp"}</strong>
              </p>
            </div>

            <div className="public-review-score-chip">
              <strong>{formatRating(item.rating)}</strong>
              <span>{renderStars(item.rating)}</span>
            </div>
          </div>

          <div className="public-review-text">
            {String(item.review || "").trim()
              ? `“${item.review}”`
              : "Pengguna tidak menulis ulasan."}
          </div>

          <div className="public-review-footer">
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyReview({ type }) {
  return (
    <div className="public-review-empty">
      <div className="public-empty-icon">💬</div>
      <h4>Belum ada ulasan</h4>
      <p>
        {type === "seller"
          ? "Belum ada pembeli yang memberi ulasan kepada pengguna ini sebagai penjual."
          : "Belum ada penjual yang memberi ulasan kepada pengguna ini sebagai pembeli."}
      </p>
    </div>
  );
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("seller");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getPublicProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error("Gagal mengambil profil publik:", error);

      setMessage(
        error.response?.data?.message || "Gagal mengambil profil pengguna."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  const reviewsAsSeller = useMemo(() => {
    return Array.isArray(profile?.reviews_as_seller)
      ? profile.reviews_as_seller
      : [];
  }, [profile]);

  const reviewsAsBuyer = useMemo(() => {
    return Array.isArray(profile?.reviews_as_buyer)
      ? profile.reviews_as_buyer
      : [];
  }, [profile]);

  const averageRating = Number(profile?.rating || 0);
  const sellerRating = Number(profile?.seller_rating || 0);
  const buyerRating = Number(profile?.buyer_rating || 0);

  const totalReviews = Number(profile?.total_reviews || 0);
  const totalSellerReviews = Number(profile?.total_seller_reviews || 0);
  const totalBuyerReviews = Number(profile?.total_buyer_reviews || 0);
  const totalTransactions = Number(profile?.total_transactions || 0);

  const safeLocationText = getSafeLocationText(profile || {});

  const activeReviews =
    activeTab === "seller" ? reviewsAsSeller : reviewsAsBuyer;

  const activeRating = activeTab === "seller" ? sellerRating : buyerRating;

  const activeTotal =
    activeTab === "seller" ? totalSellerReviews : totalBuyerReviews;

  return (
    <AppShell>
      <main className="public-profile-page">
        <PageHeader
          label="Profil Pengguna"
          title="Ulasan & Reputasi"
          description="Lihat reputasi pengguna sebagai penjual dan pembeli berdasarkan transaksi di SaveByUp."
          action={
            <button
              type="button"
              className="sb-btn profile-btn-outline"
              onClick={() => navigate(-1)}
            >
              Kembali
            </button>
          }
        />

        {loading ? (
          <section className="profile-state">
            <div className="profile-loader" />
            <h3>Memuat profil...</h3>
            <p>Sedang mengambil data profil pengguna.</p>
          </section>
        ) : message ? (
          <EmptyState
            title="Profil tidak dapat ditampilkan"
            description={message}
            action={
              <button
                type="button"
                className="sb-btn profile-btn-outline"
                onClick={() => navigate(-1)}
              >
                Kembali
              </button>
            }
          />
        ) : (
          profile && (
            <>
              <section className="public-profile-hero">
                <div className="public-profile-identity-card">
                  <div className="public-avatar-box">
                    <div className="public-profile-avatar">
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt={profile.name} />
                      ) : (
                        <span>{getInitial(profile.name)}</span>
                      )}
                    </div>
                  </div>

                  <div className="public-identity-content">
                    <span className="public-kicker">Pengguna SaveByUp</span>

                    <h2>{profile.name || "Pengguna SaveByUp"}</h2>

                    <p>
                      {profile.bio ||
                        "Pengguna ini belum menambahkan bio profil."}
                    </p>

                    <div className="public-main-rating-card">
                      <div>
                        <strong>{formatRating(averageRating)}/5</strong>
                        <span>{renderStars(averageRating)}</span>
                      </div>

                      <p>{totalReviews} total ulasan</p>
                    </div>
                  </div>
                </div>

                <div className="public-profile-side">
                  <StatCard
                    label="Rating Penjual"
                    value={`${formatRating(sellerRating)}/5`}
                    helper={`${totalSellerReviews} ulasan dari pembeli`}
                    highlight
                  />

                  <StatCard
                    label="Rating Pembeli"
                    value={`${formatRating(buyerRating)}/5`}
                    helper={`${totalBuyerReviews} ulasan dari penjual`}
                    highlight
                  />

                  <StatCard
                    label="Total Transaksi"
                    value={totalTransactions}
                    helper="Transaksi yang melibatkan akun ini"
                  />

                  <StatCard
                    label="Akurasi Lokasi"
                    value={safeLocationText}
                    helper="Koordinat GPS tidak ditampilkan"
                  />
                </div>
              </section>

              <section className="public-contact-strip">
                <div>
                  <span>Email</span>
                  <strong>{profile.email || "-"}</strong>
                </div>

                <div>
                  <span>WhatsApp</span>
                  <strong>{profile.whatsapp || "-"}</strong>
                </div>

                <div className="public-contact-note">
                  <span>Catatan Reputasi</span>
                  <p>
                    Rating penjual berasal dari pembeli. Rating pembeli berasal
                    dari penjual setelah transaksi selesai.
                  </p>
                </div>
              </section>

              <section className="public-review-board">
                <div className="public-review-board-head">
                  <div>
                    <span>Review Center</span>
                    <h3>Ulasan Pengguna</h3>
                  </div>

                  <button
                    type="button"
                    className="sb-btn profile-btn-outline"
                    onClick={fetchPublicProfile}
                  >
                    Refresh
                  </button>
                </div>

                <div className="public-review-tabs">
                  <button
                    type="button"
                    className={activeTab === "seller" ? "active" : ""}
                    onClick={() => setActiveTab("seller")}
                  >
                    <span>Sebagai Penjual</span>
                    <strong>{formatRating(sellerRating)}/5</strong>
                    <small>{totalSellerReviews} ulasan</small>
                  </button>

                  <button
                    type="button"
                    className={activeTab === "buyer" ? "active" : ""}
                    onClick={() => setActiveTab("buyer")}
                  >
                    <span>Sebagai Pembeli</span>
                    <strong>{formatRating(buyerRating)}/5</strong>
                    <small>{totalBuyerReviews} ulasan</small>
                  </button>
                </div>

                <div className="public-review-summary">
                  <div>
                    <span>
                      {activeTab === "seller"
                        ? "Reputasi saat menjual"
                        : "Reputasi saat membeli"}
                    </span>

                    <h4>
                      {activeTab === "seller"
                        ? "Ulasan sebagai Penjual"
                        : "Ulasan sebagai Pembeli"}
                    </h4>
                  </div>

                  <div className="public-review-summary-score">
                    <strong>{formatRating(activeRating)}/5</strong>
                    <span>{renderStars(activeRating)}</span>
                    <p>{activeTotal} ulasan</p>
                  </div>
                </div>

                {activeReviews.length === 0 ? (
                  <EmptyReview type={activeTab} />
                ) : (
                  <div className="public-review-list">
                    {activeReviews.map((item) => (
                      <ReviewItem
                        key={`${item.reviewed_role}-${item.transaction_id}-${item.id}`}
                        item={item}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )
        )}
      </main>
    </AppShell>
  );
}