/* =============================================
   CONFIGURACAO - edite estes valores
   ============================================= */

const WHATSAPP_NUMBER = "5537988014115";
const WHATSAPP_MESSAGE = "Ol\u00e1! Gostaria de saber mais sobre as aulas de dire\u00e7\u00e3o.";
const WHATSAPP_MESSAGES = {
  fear: "Ol\u00e1! Tenho medo de dirigir e gostaria de agendar uma aula para ganhar mais confian\u00e7a.",
};
const INSTAGRAM_URL = "https://www.instagram.com/";
const LOCATION_URL = "https://www.google.com/maps/search/?api=1&query=Divinopolis+MG";

// Numero exibido na animacao de alunos aprovados
const APPROVED_STUDENTS = 500;

/* =============================================
   WhatsApp
   ============================================= */

function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function setupWhatsAppLinks() {
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    const key = link.dataset.messageKey;
    const message = (key && WHATSAPP_MESSAGES[key]) || link.dataset.message || WHATSAPP_MESSAGE;
    const url = buildWhatsAppUrl(message);
    link.setAttribute("href", url);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function setupExternalLinks() {
  const instagram = document.getElementById("instagram-link");
  const location = document.getElementById("location-link");
  if (instagram) instagram.href = INSTAGRAM_URL;
  if (location) location.href = LOCATION_URL;
}

/* =============================================
   Header + menu mobile
   ============================================= */

const header = document.getElementById("header");
const nav = document.getElementById("nav");
const toggle = document.getElementById("nav-toggle");
const overlay = document.getElementById("nav-overlay");

function setMenuState(open) {
  nav.classList.toggle("is-open", open);
  toggle.classList.toggle("is-open", open);
  overlay.classList.toggle("is-open", open);
  overlay.hidden = !open;
  header.classList.toggle("is-menu-open", open);
  document.body.classList.toggle("nav-locked", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

function setupNavigation() {
  toggle.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("is-open"));
  });

  overlay.addEventListener("click", () => setMenuState(false));

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* =============================================
   Animacoes de scroll
   ============================================= */

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll(".timeline__item").forEach((item, index) => {
    item.style.setProperty("--i", String(index));
  });

  elements.forEach((el) => observer.observe(el));
}

/* =============================================
   Contadores animados
   ============================================= */

function formatCounter(value, prefix, suffix) {
  return `${prefix}${value}${suffix}`;
}

function animateValue(el) {
  const target = Number(el.dataset.counter || 0);
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const duration = Number(el.dataset.duration || 1200);
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = formatCounter(value, prefix, suffix);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function setupCounters() {
  document.querySelectorAll("[data-stat='approved']").forEach((el) => {
    el.dataset.counter = String(APPROVED_STUDENTS);
  });

  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counters.forEach((el) => {
      el.textContent = formatCounter(
        el.dataset.counter,
        el.dataset.prefix || "",
        el.dataset.suffix || ""
      );
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target.closest(".stat-card");
        if (card) card.classList.add("is-counting");
        animateValue(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* =============================================
   Init
   ============================================= */

function setupGalleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  const triggers = Array.from(document.querySelectorAll(".gallery__trigger"));
  if (!lightbox || !image || !caption || !triggers.length) return;

  const items = triggers.map((trigger) => {
    const img = trigger.querySelector("img");
    const figcaption = trigger.closest("figure")?.querySelector("figcaption");
    return {
      src: img?.currentSrc || img?.src || "",
      alt: img?.alt || "",
      caption: figcaption?.textContent || "",
    };
  });

  let index = 0;
  let lastFocus = null;

  function render() {
    const item = items[index];
    if (!item) return;
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.caption;
  }

  function open(nextIndex) {
    index = nextIndex;
    lastFocus = document.activeElement;
    render();
    lightbox.hidden = false;
    document.body.classList.add("nav-locked");
    lightbox.querySelector(".lightbox__close")?.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove("nav-locked");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function step(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  triggers.forEach((trigger, triggerIndex) => {
    trigger.addEventListener("click", () => open(triggerIndex));
  });

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", close);
  });
  lightbox.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => step(-1));
  lightbox.querySelector("[data-lightbox-next]")?.addEventListener("click", () => step(1));

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
}

document.getElementById("year").textContent = String(new Date().getFullYear());
setupWhatsAppLinks();
setupExternalLinks();
setupNavigation();
setupReveal();
setupCounters();
setupGalleryLightbox();
