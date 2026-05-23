import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const FRAME_COUNT = 60;

// Kalau awalnya kebalik, ubah true jadi false.
// true = awal pakai lemari-open_060.jpg, akhir pakai lemari-open_001.jpg
// false = awal pakai lemari-open_001.jpg, akhir pakai lemari-open_060.jpg
const REVERSE_FRAMES = false;

const getFrameSrc = (index) => {
  const realIndex = REVERSE_FRAMES ? FRAME_COUNT + 1 - index : index;
  const frameNumber = String(realIndex).padStart(3, "0");

  return `/landing-frames/lemari-open_${frameNumber}.jpg`;
};

export default function LandingFrameHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const dimRef = useRef(null);
  const hintRef = useRef(null);
  const loaderRef = useRef(null);

  const imagesRef = useRef([]);
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const animationRef = useRef(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const content = contentRef.current;
    const dim = dimRef.current;
    const hint = hintRef.current;
    const loader = loaderRef.current;

    if (!section || !canvas || !content || !dim || !hint || !loader) return;

    const ctx = canvas.getContext("2d");

    const setCanvasSize = () => {
      const ratio = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawCover = (img) => {
      if (!img) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      const imgWidth = img.width;
      const imgHeight = img.height;

      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);

      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    const render = () => {
      const index = Math.round(currentFrameRef.current);
      const safeIndex = Math.min(FRAME_COUNT, Math.max(1, index));
      const img = imagesRef.current[safeIndex];

      if (img && img.complete) {
        drawCover(img);
      }

      const progress = (safeIndex - 1) / (FRAME_COUNT - 1);

      if (progress >= 0.86) {
        content.classList.add("is-visible");
        dim.classList.add("is-visible");
        hint.classList.add("is-hidden");
      } else {
        content.classList.remove("is-visible");
        dim.classList.remove("is-visible");
        hint.classList.remove("is-hidden");
      }
    };

    const animate = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      currentFrameRef.current += (target - current) * 0.18;

      if (Math.abs(target - current) < 0.03) {
        currentFrameRef.current = target;
      }

      render();

      animationRef.current = requestAnimationFrame(animate);
    };

    const updateTargetFrame = (delta) => {
      if (!isReadyRef.current) return;

      const nextFrame = targetFrameRef.current + delta;
      targetFrameRef.current = Math.min(FRAME_COUNT, Math.max(1, nextFrame));
    };

    const handleWheel = (event) => {
      event.preventDefault();

      const direction = event.deltaY > 0 ? 1 : -1;

      // Atur kecepatan scroll di sini
      // makin besar makin cepat buka
      updateTargetFrame(direction * 2.2);
    };

    let touchStartY = 0;

    const handleTouchStart = (event) => {
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      event.preventDefault();

      const currentY = event.touches[0].clientY;
      const diff = touchStartY - currentY;

      updateTargetFrame(diff * 0.08);
      touchStartY = currentY;
    };

    const preloadImages = () => {
      let loaded = 0;

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFrameSrc(i);

        img.onload = () => {
          loaded += 1;

          if (i === 1) {
            drawCover(img);
            loader.classList.add("is-hidden");
            isReadyRef.current = true;
          }

          if (loaded === FRAME_COUNT) {
            isReadyRef.current = true;
          }
        };

        img.onerror = () => {
          console.error("Frame gagal load:", img.src);
        };

        imagesRef.current[i] = img;
      }
    };

    setCanvasSize();

    ctx.fillStyle = "#07140d";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    preloadImages();

    animationRef.current = requestAnimationFrame(animate);

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("touchstart", handleTouchStart, { passive: false });
    section.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("resize", setCanvasSize);

    return () => {
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", setCanvasSize);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="landing-hero-section">
      <canvas ref={canvasRef} className="landing-hero-canvas" />

      <div ref={loaderRef} className="landing-loader">
        <span>Memuat SaveByUp...</span>
      </div>

      <div className="landing-hero-vignette" />
      <div ref={dimRef} className="landing-hero-dim" />

      <div className="landing-brand">
        <span className="brand-dot"></span>
        <span>SaveByUp</span>
      </div>

      <div ref={hintRef} className="landing-scroll-hint">
        <span>Scroll untuk membuka lemari</span>
        <div className="mouse-icon">
          <div className="mouse-wheel"></div>
        </div>
      </div>

      <div ref={contentRef} className="landing-hero-content">
        <span className="landing-badge">Food Waste Prevention System</span>

        <h1>Kelola stok makananmu sebelum terbuang</h1>

        <p>
          Catat makanan di kos, pantau tanggal kedaluwarsa, dan manfaatkan
          makanan yang masih layak konsumsi melalui marketplace sederhana.
        </p>

        <div className="landing-actions">
          <Link to="/register" className="landing-btn landing-btn-primary">
            Daftar Sekarang
          </Link>

          <Link to="/login" className="landing-btn landing-btn-secondary">
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}