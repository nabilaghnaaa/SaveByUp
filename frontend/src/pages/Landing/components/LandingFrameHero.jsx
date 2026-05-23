import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 60;

// Path langsung mengarah ke folder public (sangat stabil)
const getFrameUrl = (index) =>
  `/landing-frames/lemari-open_${String(index).padStart(3, "0")}.jpg`;

export default function LandingFrameHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const dimRef = useRef(null);
  const contentRef = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d");
    const images = [];
    const frame = { index: 1 };
    
    let gsapContext;
    let loadedImages = 0;

    // Set ukuran canvas yang responsif dan anti blur
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    // Fungsi menggambar yang memastikan frame selalu proporsional (cover)
    const render = () => {
      const currentIndex = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(frame.index))
      );
      
      const img = images[currentIndex - 1]; // Array index mulai dari 0
      
      if (img && img.complete) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
        
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (canvasWidth - drawWidth) / 2;
        const y = (canvasHeight - drawHeight) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, x, y, drawWidth, drawHeight);
      }
    };

    const initAnimation = () => {
      // Bungkus dalam gsap.context agar aman dari Strict Mode
      gsapContext = gsap.context(() => {
        gsap.set(contentRef.current, { opacity: 0, y: 40, scale: 0.95 });
        gsap.set(dimRef.current, { opacity: 0 });
        gsap.set(scrollHintRef.current, { opacity: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // Angka 2500 adalah jarak tempuh scroll (makin besar, makin pelan animasinya)
            end: "+=2500", 
            scrub: 0.5,
            pin: true,
            // pinSpacing true akan memastikan user mentok saat animasi selesai
            pinSpacing: true, 
          },
        });

        // 1. Putar Frame Gambar
        tl.to(frame, {
          index: FRAME_COUNT,
          snap: "index",
          ease: "none",
          onUpdate: render,
          duration: 3,
        }, 0);

        // 2. Sembunyikan Hint Scroll
        tl.to(scrollHintRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.3,
        }, 0);

        // 3. Gelapkan Background saat lemari mulai terbuka lebar
        tl.to(dimRef.current, {
          opacity: 1,
          duration: 1,
        }, 1.5);

        // 4. Munculkan Teks + Tombol di akhir
        tl.to(contentRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        }, 2);

      }, sectionRef);
    };

    // Preload semua gambar dulu sebelum animasi dimulai
    const preloadImages = () => {
      setCanvasSize();
      
      // Paint warna hitam sesaat sambil nunggu gambar pertama
      context.fillStyle = "#07140d";
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        
        img.onload = () => {
          loadedImages++;
          
          // Paksa render frame pertama sesegera mungkin (hindari black screen)
          if (i === 1) render();
          
          // Jika semua gambar sudah ter-load, baru jalankan ScrollTrigger
          if (loadedImages === FRAME_COUNT) {
            initAnimation();
            ScrollTrigger.refresh();
          }
        };
        
        images.push(img);
      }
    };

    preloadImages();

    const handleResize = () => {
      setCanvasSize();
      render();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gsapContext) gsapContext.revert(); // Cleanup krusial
    };
  }, []);

  return (
    <section className="landing-hero-section" ref={sectionRef}>
      <canvas ref={canvasRef} className="landing-hero-canvas"></canvas>

      <div className="landing-hero-vignette"></div>
      <div className="landing-hero-dim" ref={dimRef}></div>

      <div className="landing-brand">
        <span className="brand-dot"></span>
        <span>SaveByUp</span>
      </div>

      <div className="landing-scroll-hint" ref={scrollHintRef}>
        <span>Scroll untuk membuka lemari</span>
        <div className="mouse-icon">
          <div className="mouse-wheel"></div>
        </div>
      </div>

      <div className="landing-hero-content" ref={contentRef}>
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