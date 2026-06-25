/* ============================================================
   ARIZKA WiFi Store — app.js
   Main JavaScript — All Interactions & Animations
   ============================================================ */

"use strict";

/* ---- LOADING SCREEN ---- */
window.addEventListener("load", () => {
  setTimeout(() => {
    const ls = document.getElementById("loading-screen");
    if (!ls) return;
    ls.classList.add("fade-out");
    setTimeout(() => ls.remove(), 750);
  }, 2600);
});

/* ---- AOS INIT ---- */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 720, once: true, offset: 55, easing: "ease-out-cubic" });
  }

  initNavbar();
  initCanvas();
  initMusicPlayer();
  initClickSound();
  initFAQ();
  initSwiper();
  initStats();
  initLightbox();
  initGSAP();
  initContactForm();
  initActiveNav();
});

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });
}

/* ============================================================
   ANIMATED PARTICLE CANVAS BACKGROUND
   ============================================================ */
function initCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.38;
      this.vy = (Math.random() - 0.5) * 0.38;
      this.r = Math.random() * 1.4 + 0.4;
      this.alpha = Math.random() * 0.38 + 0.08;
      this.color = Math.random() > 0.5 ? "0,229,255" : "124,77,255";
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 105) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${0.055 * (1 - dist / 105)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  resize();
  particles = Array.from({ length: 130 }, () => new Particle());
  window.addEventListener("resize", resize);
  animate();
}

/* ============================================================
   MUSIC PLAYER (Web Audio API — synthetic ambient)
   ============================================================ */
function initMusicPlayer() {
  let audioCtx, gainNode, isPlaying = false;

  const toggleBtn = document.getElementById("sound-toggle-btn");
  const volSlider = document.getElementById("vol-slider");
  if (!toggleBtn) return;

  function buildSynth() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);

    function addOsc(freq, type, vol) {
      const osc = audioCtx.createOscillator();
      const g   = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = vol;
      osc.connect(g);
      g.connect(gainNode);
      osc.start();
    }
    addOsc(55,  "sine",     0.45);
    addOsc(110, "sine",     0.22);
    addOsc(165, "sine",     0.12);
    addOsc(220, "triangle", 0.07);
    addOsc(82,  "sine",     0.18);
  }

  function getVolume() {
    return volSlider ? parseFloat(volSlider.value) * 0.28 : 0.15;
  }

  toggleBtn.addEventListener("click", () => {
    try {
      buildSynth();
      if (audioCtx.state === "suspended") audioCtx.resume();

      if (!isPlaying) {
        gainNode.gain.setTargetAtTime(getVolume(), audioCtx.currentTime, 0.6);
        isPlaying = true;
        toggleBtn.textContent = "🔊";
      } else {
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        isPlaying = false;
        toggleBtn.textContent = "🔇";
      }
    } catch (e) { console.warn("Audio:", e); }
  });

  if (volSlider) {
    volSlider.addEventListener("input", function () {
      if (audioCtx && gainNode && isPlaying) {
        gainNode.gain.setTargetAtTime(getVolume(), audioCtx.currentTime, 0.1);
      }
    });
  }
}

/* ============================================================
   CLICK SOUND ON NAV & BUTTONS
   ============================================================ */
function initClickSound() {
  document.querySelectorAll(".nav-link, .btn-neon").forEach(el => {
    el.addEventListener("click", () => {
      try {
        const ac  = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.frequency.value = 880; osc.type = "sine";
        g.gain.setValueAtTime(0.05, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
        osc.start(); osc.stop(ac.currentTime + 0.12);
      } catch (e) {}
    });
  });
}

/* ============================================================
   SWIPER TESTIMONIALS
   ============================================================ */
function initSwiper() {
  if (typeof Swiper === "undefined") return;
  const el = document.querySelector(".swiper-testimonial");
  if (!el) return;
  new Swiper(".swiper-testimonial", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 4800, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    breakpoints: {
      640:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item   = btn.parentElement;
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ============================================================
   ANIMATED STATISTICS COUNTER
   ============================================================ */
function initStats() {
  const counters = document.querySelectorAll(".stat-num[data-target]");
  if (!counters.length) return;

  const suffixMap = { 5000: "+", 99: "%", 24: " Jam", 100: " Mbps" };

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = suffixMap[target] || "";
    let current = 0;
    const step  = Math.max(1, Math.ceil(target / 70));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString("id-ID") + suffix;
      if (current >= target) clearInterval(timer);
    }, 28);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        counters.forEach(el => animateCounter(el));
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.getElementById("stats");
  if (statsSection) obs.observe(statsSection);
}

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
function initLightbox() {
  const lb    = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbClose = document.getElementById("lightbox-close");
  if (!lb) return;

  document.querySelectorAll(".gallery-item[data-src]").forEach(item => {
    item.addEventListener("click", () => {
      lbImg.src = item.dataset.src;
      lbImg.alt = item.dataset.caption || "";
      lb.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lb.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => { lbImg.src = ""; }, 300);
  }

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
}

/* ============================================================
   GSAP PARALLAX + SCROLL ANIMATIONS
   ============================================================ */
function initGSAP() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero visual parallax
  gsap.to(".hero-visual", {
    yPercent: 14,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });

  // Floating wifi icons drift on scroll
  gsap.to(".floating-wifi", {
    yPercent: -45,
    ease: "none",
    stagger: 0.3,
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true }
  });

  // Package cards stagger
  gsap.utils.toArray(".package-card").forEach((card, i) => {
    gsap.from(card, {
      y: 40, opacity: 0, duration: 0.7, delay: i * 0.1, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 85%" }
    });
  });
}

/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   ============================================================ */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    navLinks.forEach(l => {
      const href = l.getAttribute("href");
      l.classList.toggle("active", href === "#" + current || href === current + ".html");
    });
  });
}

/* ============================================================
   CONTACT FORM SUBMIT
   ============================================================ */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn = form.querySelector("[type=submit]");
    btn.innerHTML = '<i class="fas fa-check me-2"></i>Pesan Terkirim!';
    btn.style.cssText = "background:linear-gradient(135deg,#1B8C5A,#00E5A0);color:#fff;border-color:transparent;";
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Kirim Pesan';
      btn.style.cssText = "";
      form.reset();
    }, 3500);
  });
}

/* ============================================================
   GLOBAL UTILITIES (used inline in HTML)
   ============================================================ */
window.ArizkaApp = {
  openWA(msg) {
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, "_blank");
  }
};
