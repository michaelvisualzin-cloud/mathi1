(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  function initLoader() {
    const loader = document.querySelector(".loader");
    if (!loader) return;

    const minTime = 1200;
    const start = Date.now();

    const hide = () => {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, minTime - elapsed);
      setTimeout(() => {
        loader.classList.add("hidden");
      }, delay);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
    }
  }

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initParticles() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h;
    const count = window.innerWidth < 768 ? 35 : 70;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const create = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 163, 255, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    create();
    window.addEventListener("resize", () => {
      resize();
      create();
    });
    draw();
  }

  function initCursorGlow() {
    if (prefersReducedMotion || isTouch) return;

    const cursor = document.querySelector(".cursor-glow");
    if (!cursor) return;

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;

    document.body.classList.add("custom-cursor");

    document.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      cursor.classList.add("active");
    });

    document.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
    });

    document.querySelectorAll("a, button, .btn, input, select, textarea, .filter-btn, .dot").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
    });

    const animate = () => {
      cx += (x - cx) * 0.15;
      cy += (y - cy) * 0.15;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(animate);
    };
    animate();
  }

  function initNav() {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        const open = navLinks.classList.contains("open");
        menuBtn.setAttribute("aria-expanded", open);
      });

      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => navLinks.classList.remove("open"));
      });
    }

    const page = window.location.pathname.split("/").pop() || "index.html";
    const currentPage = page === "" ? "index.html" : page;

    navLinks?.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const linkPage = href.split("#")[0] || "index.html";
      const isAbout =
        currentPage === "index.html" && href.includes("#about") && window.location.hash === "#about";

      if (linkPage === currentPage && !href.includes("#")) {
        link.classList.add("active");
      } else if (isAbout) {
        link.classList.add("active");
      }
    });

    const hash = window.location.hash;
    if (hash === "#about") {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  }

  function initReveals() {
    const reveals = document.querySelectorAll("[data-reveal]");
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach((el) => el.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((item) => observer.observe(item));
  }

  function initStats() {
    const statNumbers = document.querySelectorAll("[data-count]");
    if (!statNumbers.length) return;

    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => observer.observe(el));
  }

  function initTestimonials() {
    const track = document.querySelector(".testimonials-track");
    const dotsContainer = document.querySelector(".testimonial-dots");
    if (!track) return;

    const cards = [...track.querySelectorAll(".review-card")];
    if (!cards.length) return;

    let index = 0;
    let interval;
    const gap = 24;

    const getSlideWidth = () => {
      const card = cards[0];
      if (!card) return 0;
      return card.offsetWidth + gap;
    };

    const getVisibleCount = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };

    const maxIndex = () => Math.max(0, cards.length - getVisibleCount());

    const goTo = (i) => {
      index = Math.max(0, Math.min(i, maxIndex()));
      const offset = index * getSlideWidth();
      track.style.transform = `translateX(-${offset}px)`;
      dotsContainer?.querySelectorAll(".dot").forEach((dot, di) => {
        dot.classList.toggle("active", di === index);
      });
    };

    if (dotsContainer) {
      for (let i = 0; i <= maxIndex(); i++) {
        const dot = document.createElement("button");
        dot.className = "dot" + (i === 0 ? " active" : "");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", () => {
          goTo(i);
          resetInterval();
        });
        dotsContainer.appendChild(dot);
      }
    }

    const next = () => goTo(index >= maxIndex() ? 0 : index + 1);
    const prev = () => goTo(index <= 0 ? maxIndex() : index - 1);

    document.querySelector(".testimonial-prev")?.addEventListener("click", () => {
      prev();
      resetInterval();
    });
    document.querySelector(".testimonial-next")?.addEventListener("click", () => {
      next();
      resetInterval();
    });

    const resetInterval = () => {
      clearInterval(interval);
      if (!prefersReducedMotion) {
        interval = setInterval(next, 5000);
      }
    };

    const wrap = track.parentElement;
    wrap?.addEventListener("mouseenter", () => clearInterval(interval));
    wrap?.addEventListener("mouseleave", resetInterval);

    window.addEventListener("resize", () => goTo(Math.min(index, maxIndex())));

    resetInterval();
  }

  function initPortfolio() {
    const grid = document.querySelector(".portfolio-grid");
    if (!grid) return;

    const items = [...grid.querySelectorAll(".portfolio-item")];
    const filterBtns = document.querySelectorAll(".filter-btn");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;

        items.forEach((item) => {
          const match = filter === "all" || item.dataset.category === filter;
          item.classList.toggle("hidden-item", !match);
        });
      });
    });

    const loadVideo = (video) => {
      const src = video.dataset.src;
      if (!src || video.src) return;
      video.src = src;
      video.load();
    };

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            loadVideo(video);
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    items.forEach((item) => {
      const video = item.querySelector("video");
      if (video) videoObserver.observe(video);
    });
  }

  function initHeroVideo() {
    const video = document.querySelector(".hero-video");
    const fallback = document.querySelector(".hero-fallback");
    if (!video || !fallback) return;

    const showFallback = () => {
      video.style.display = "none";
      fallback.classList.add("active");
    };

    video.addEventListener("error", showFallback);

    if (video.readyState === 0) {
      video.addEventListener("loadeddata", () => {}, { once: true });
      setTimeout(() => {
        if (video.error || video.readyState === 0) showFallback();
      }, 4000);
    }
  }

  function getFormPayload(form) {
    return {
      fullName: form.fullName?.value?.trim() || "",
      mobile: form.mobile?.value?.trim() || "",
      whatsapp: form.whatsapp?.value?.trim() || "",
      email: form.email?.value?.trim() || "",
      instagram: form.instagram?.value?.trim() || "",
      city: form.city?.value?.trim() || "",
      company: form.company?.value?.trim() || "",
      editType: form.editType?.value || "",
      description: form.description?.value?.trim() || "",
      budget: form.budget?.value || "",
      deliveryDate: form.deliveryDate?.value || "",
    };
  }

  function showFormError(form, message) {
    let box = form.querySelector("#formErrorMessage");
    if (!box) {
      box = document.createElement("div");
      box.id = "formErrorMessage";
      box.className = "form-error-box";
      box.setAttribute("role", "alert");
      form.querySelector(".form-actions")?.before(box);
    }
    box.textContent = message;
    box.classList.remove("hidden");
  }

  function hideFormError(form) {
    form.querySelector("#formErrorMessage")?.classList.add("hidden");
  }

  async function submitBooking(payload) {
    const config = window.MV_CONFIG || {};
    const toEmail = (config.formSubmitEmail || config.email || "").trim();

    if (!toEmail) {
      throw new Error("Booking email is not configured in assets/site-config.js.");
    }

    const body = {
      _subject: "New booking — " + (payload.fullName || "Michael Visualz"),
      _template: "table",
      _captcha: "false",
      "Full Name": payload.fullName,
      Mobile: payload.mobile,
      WhatsApp: payload.whatsapp,
      Email: payload.email,
      Instagram: payload.instagram,
      City: payload.city,
      Company: payload.company,
      "Editing Type": payload.editType,
      Budget: payload.budget,
      "Delivery Date": payload.deliveryDate,
      "Project Description": payload.description,
    };

    const response = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(toEmail), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Could not send booking. Please try WhatsApp or call us.");
    }

    const result = await response.json().catch(() => ({}));
    if (result.success === false) {
      throw new Error("Booking could not be sent. Please contact us on WhatsApp.");
    }

    return result;
  }

  function initForm() {
    const form = document.querySelector("#bookingForm");
    if (!form) return;

    const successBox = form.querySelector("#successMessage");
    const submitBtn = form.querySelector("#submitBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideFormError(form);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = getFormPayload(form);
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        await submitBooking(payload);
        form.reset();
        successBox?.classList.remove("hidden");
        successBox?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (err) {
        showFormError(
          form,
          err.message || "Something went wrong. Please WhatsApp us at +91 81109 90660."
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Booking Request";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initScrollProgress();
    initParticles();
    initCursorGlow();
    initNav();
    initReveals();
    initStats();
    initTestimonials();
    initPortfolio();
    initHeroVideo();
    initForm();
  });
})();
