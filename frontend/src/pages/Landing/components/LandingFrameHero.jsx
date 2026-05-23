import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 60;

const currentFrame = (index) => {
  const frameNumber = String(index).padStart(3, "0");

  return new URL(
    `../../../assets/landing-frames/lemari-open_${frameNumber}.jpg`,
    import.meta.url
  ).href;
};

export default function LandingFrameHero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const dimRef = useRef(null);
  const contentRef = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const dim = dimRef.current;
    const content = contentRef.current;
    const scrollHint = scrollHintRef.current;

    if (!section || !canvas || !dim || !content || !scrollHint) return;

    const context = canvas.getContext("2d");
    const images = [];
    const frame = { index: 1 };

    let loadedImages = 0;
    let gsapContext;

    const setCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawImageCover = (img) => {
      if (!img || !img.complete) return;

      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      const imageWidth = img.width;
      const imageHeight = img.height;

      const scale = Math.max(
        canvasWidth / imageWidth,
        canvasHeight / imageHeight
      );

      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;

      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, x, y, drawWidth, drawHeight);
    };

    const render = () => {
      const currentIndex = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(frame.index))
      );

      drawImageCover(images[currentIndex]);
    };

    const setupAnimation = () => {
      if (gsapContext) {
        gsapContext.revert();
      }

      gsapContext = gsap.context(() => {
        gsap.set(content, {
          opacity: 0,
          y: 35,
          scale: 0.98,
          filter: "blur(8px)",
        });

        gsap.set(dim, {
          opacity: 0,
        });

        gsap.set(scrollHint, {
          opacity: 1,
          y: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2200",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(frame, {
          index: FRAME_COUNT,
          snap: "index",
          ease: "none",
          duration: 3,
          onUpdate: render,
        });

        tl.to(
          scrollHint,
          {
            opacity: 0,
            y: 16,
            duration: 0.35,
            ease: "power2.out",
          },
          "-=0.75"
        );

        tl.to(
          dim,
          {
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
          },
          "-=0.45"
        );

        tl.to(
          content,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.55,
            ease: "power3.out",
          },
          "-=0.25"
        );
      }, section);
    };

    const preloadImages = () => {
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = currentFrame(i);

        img.onload = () => {
          loadedImages += 1;

          if (i === 1) {
            frame.index = 1;
            render();
          }

          if (loadedImages === FRAME_COUNT) {
            render();
            setupAnimation();
            ScrollTrigger.refresh();
          }
        };

        img.onerror = () => {
          console.error(`Gagal load frame: ${img.src}`);
        };

        images[i] = img;
      }
    };

    setCanvasSize();

    context.fillStyle = "#07140d";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    preloadImages();

    const handleResize = () => {
      setCanvasSize();
      render();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (gsapContext) {
        gsapContext.revert();
      }
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