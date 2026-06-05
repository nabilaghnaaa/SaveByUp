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

function ReviewList({ title, subtitle, rating, total, reviews }) {
  return (
    <section className="profile-card public-review-section">
      <div className="profile-section-header">
        <div>
          <span>{subtitle}</span>
          <h3>{title}</h3>
        </div>

        <div className="profile-rating-box public-rating-mini">
          <span>{renderStars(rating)}</span>
          <strong>{Number(rating || 0).toFixed(1)}/5</strong>
          <p>{total} ulasan</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="profile-empty-review">
          <h4>Belum ada ulasan</h4>
          <p>Belum ada ulasan untuk peran ini.</p>
        </div>
      ) : (
        <div className="public-review-list">
          {reviews.map((item) => (
            <article
              className="public-review-card"
              key={`${item.reviewed_role}-${item.transaction_id}-${item.created_at}`}
            >
              <div className="public-review-top">
                <div>
                  <h4>{item.product_name || "Produk Marketplace"}</h4>
                  <p>
                    Oleh{" "}
                    <strong>
                      {item.reviewer_name || "Pengguna SaveByUp"}
                    </strong>
                  </p>
                </div>

                <div className="public-review-rating">
                  <span>{renderStars(item.rating)}</span>
                  <strong>{Number(item.rating || 0)}/5</strong>
                </div>
              </div>

              {item.review ? (
                <p className="public-review-text">“{item.review}”</p>
              ) : (
                <p className="public-review-text">
                  Pengguna tidak menulis ulasan.
                </p>
              )}

              <span className="public-review-date">
                {formatDate(item.created_at)}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
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

  return (
    <AppShell>
      <main className="profile-page">
        <div className="profile-orb profile-orb-one" />
        <div className="profile-orb profile-orb-two" />

        <PageHeader
          label="Profil Pengguna"
          title="Profil Publik SaveByUp"
          description="Lihat identitas, rating, ulasan sebagai penjual, dan ulasan sebagai pembeli sebelum melanjutkan transaksi."
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
              <section className="profile-card public-profile-card">
                <div className="profile-cover">
                  <div className="profile-avatar">
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt={profile.name} />
                    ) : (
                      <span>{getInitial(profile.name)}</span>
                    )}
                  </div>
                </div>

                <div className="profile-info">
                  <div>
                    <span className="profile-label">Pengguna SaveByUp</span>
                    <h2>{profile.name || "Pengguna SaveByUp"}</h2>

                    {profile.bio ? (
                      <p>{profile.bio}</p>
                    ) : (
                      <p>Pengguna ini belum menambahkan bio profil.</p>
                    )}
                  </div>

                  <div className="profile-rating-box">
                    <span>{renderStars(averageRating)}</span>
                    <strong>{averageRating.toFixed(1)}/5</strong>
                    <p>{totalReviews} total ulasan</p>
                  </div>
                </div>

                <div className="profile-detail-grid">
                  <div>
                    <span>Email</span>
                    <strong>{profile.email || "-"}</strong>
                  </div>

                  <div>
                    <span>WhatsApp</span>
                    <strong>{profile.whatsapp || "-"}</strong>
                  </div>

                  <div>
                    <span>Area COD</span>
                    <strong>
                      {profile.location_label || profile.address || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Total Transaksi</span>
                    <strong>{totalTransactions}</strong>
                  </div>

                  <div>
                    <span>Rating sebagai Penjual</span>
                    <strong>{sellerRating.toFixed(1)}/5</strong>
                  </div>

                  <div>
                    <span>Rating sebagai Pembeli</span>
                    <strong>{buyerRating.toFixed(1)}/5</strong>
                  </div>
                </div>
              </section>

              <div className="public-profile-review-grid">
                <ReviewList
                  title="Ulasan sebagai Penjual"
                  subtitle="Reputasi saat menjual"
                  rating={sellerRating}
                  total={totalSellerReviews}
                  reviews={reviewsAsSeller}
                />

                <ReviewList
                  title="Ulasan sebagai Pembeli"
                  subtitle="Reputasi saat membeli"
                  rating={buyerRating}
                  total={totalBuyerReviews}
                  reviews={reviewsAsBuyer}
                />
              </div>
            </>
          )
        )}
      </main>
    </AppShell>
  );
}