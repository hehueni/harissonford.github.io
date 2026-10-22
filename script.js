/* =========================================================
   PORTFOLIO — Harisson Ford • script.js (v4.1)
   ========================================================= */
(() => {
    "use strict";

    const doc = document;
    const root = doc.documentElement;

    const $ = (sel, ctx = doc) => (ctx ? ctx.querySelector(sel) : null);
    const $$ = (sel, ctx = doc) => (ctx ? Array.from(ctx.querySelectorAll(sel)) : []);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================================================
       1. THÈME CLAIR / SOMBRE
       ========================================================= */
    function initTheme() {
        const themeToggle = $("#theme-toggle");
        const storageKey = "theme";

        function applyTheme(theme) {
            root.setAttribute("data-theme", theme);

            try {
                localStorage.setItem(storageKey, theme);
            } catch (error) {
                console.warn("Le thème ne peut pas être enregistré.", error);
            }

            if (themeToggle) {
                const isDark = theme === "dark";
                themeToggle.setAttribute(
                    "aria-label",
                    isDark ? "Passer en mode clair" : "Passer en mode sombre"
                );
                themeToggle.setAttribute("title", "Changer de thème");
            }
        }

        let savedTheme = "dark";

        try {
            savedTheme = localStorage.getItem(storageKey) === "light"
                ? "light"
                : "dark";
        } catch (error) {
            // Le thème sombre est utilisé par défaut.
        }

        applyTheme(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const currentTheme = root.getAttribute("data-theme");
                applyTheme(currentTheme === "dark" ? "light" : "dark");
            });
        }
    }

    /* =========================================================
       2. MENU DE NAVIGATION MOBILE
       ========================================================= */
    function initMobileMenu() {
        const toggle = $("#nav-toggle");
        const nav = $("#nav-links");

        if (!toggle || !nav) return;

        function closeMenu() {
            nav.classList.remove("open", "active");
            toggle.classList.remove("active");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Ouvrir le menu");
            root.classList.remove("menu-open");
        }

        function openMenu() {
            nav.classList.add("open");
            toggle.classList.add("active");
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Fermer le menu");
            root.classList.add("menu-open");
        }

        toggle.addEventListener("click", () => {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            isOpen ? closeMenu() : openMenu();
        });

        $$(".nav-link, .nav-cta", nav).forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMenu();
        });

        document.addEventListener("click", event => {
            if (
                nav.classList.contains("open") &&
                !nav.contains(event.target) &&
                !toggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) closeMenu();
        });
    }

    /* =========================================================
       3. BARRE DE PROGRESSION
       ========================================================= */
    function initScrollProgress() {
        const progress = $("#scroll-progress");
        if (!progress) return;

        function updateProgress() {
            const scrollTop = window.scrollY || root.scrollTop;
            const scrollableHeight = root.scrollHeight - window.innerHeight;
            const percentage = scrollableHeight > 0
                ? (scrollTop / scrollableHeight) * 100
                : 0;

            progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }

        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
        updateProgress();
    }

    /* =========================================================
       4. EN-TÊTE ET BOUTON RETOUR EN HAUT
       ========================================================= */
    function initScrollEffects() {
        const header = $("#header");
        const toTop = $("#to-top");

        function updateScroll() {
            const scrollY = window.scrollY || 0;

            if (header) {
                header.classList.toggle("scrolled", scrollY > 30);
            }

            if (toTop) {
                toTop.classList.toggle("show", scrollY > 400);
                toTop.setAttribute("aria-hidden", scrollY > 400 ? "false" : "true");
            }
        }

        window.addEventListener("scroll", updateScroll, { passive: true });

        if (toTop) {
            toTop.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: reduceMotion ? "auto" : "smooth"
                });
            });
        }

        updateScroll();
    }

    /* =========================================================
       5. LIEN ACTIF DANS LA NAVIGATION
       ========================================================= */
    function initActiveNavigation() {
        const links = $$(".nav-link[href^='#']");

        if (!links.length || !("IntersectionObserver" in window)) return;

        const sections = links
            .map(link => $(link.getAttribute("href")))
            .filter(Boolean);

        if (!sections.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                links.forEach(link => {
                    const isActive =
                        link.getAttribute("href") === `#${entry.target.id}`;

                    link.classList.toggle("active", isActive);

                    if (isActive) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, {
            rootMargin: "-30% 0px -60% 0px",
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }

    /* =========================================================
       6. CARROUSELS DES PROJETS
       Compatible avec le HTML fourni
       ========================================================= */
    function initSliders() {
        $$("[data-slider]").forEach(slider => {
            const slides = $$(".slide", slider);
            const dotsContainer = $(".slider-dots", slider);
            const caption = $(".slide-caption", slider);

            if (!slides.length) return;

            let currentIndex = slides.findIndex(slide =>
                slide.classList.contains("active")
            );

            if (currentIndex < 0) currentIndex = 0;

            let autoplayTimer = null;

            function updateCaption() {
                if (!caption) return;

                caption.textContent =
                    slides[currentIndex].dataset.caption ||
                    slides[currentIndex].alt ||
                    "";
            }

            function showSlide(index) {
                currentIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, i) => {
                    const active = i === currentIndex;

                    slide.classList.toggle("active", active);
                    slide.setAttribute("aria-hidden", active ? "false" : "true");

                    if ("inert" in slide) {
                        slide.inert = !active;
                    }
                });

                if (dotsContainer) {
                    $$(".dot", dotsContainer).forEach((dot, i) => {
                        const active = i === currentIndex;

                        dot.classList.toggle("active", active);
                        dot.setAttribute("aria-current", active ? "true" : "false");
                    });
                }

                updateCaption();
            }

            function createDots() {
                if (!dotsContainer) return;

                dotsContainer.innerHTML = "";

                slides.forEach((slide, index) => {
                    const dot = doc.createElement("button");

                    dot.type = "button";
                    dot.className = "dot";
                    dot.setAttribute(
                        "aria-label",
                        `Afficher l'image ${index + 1} : ${slide.dataset.caption || slide.alt || "capture"}`
                    );

                    dot.addEventListener("click", () => {
                        showSlide(index);
                        restartAutoplay();
                    });

                    dotsContainer.appendChild(dot);
                });
            }

            function stopAutoplay() {
                if (autoplayTimer !== null) {
                    window.clearInterval(autoplayTimer);
                    autoplayTimer = null;
                }
            }

            function startAutoplay() {
                stopAutoplay();

                if (reduceMotion || slides.length < 2 || doc.hidden) return;

                autoplayTimer = window.setInterval(() => {
                    showSlide(currentIndex + 1);
                }, 5000);
            }

            function restartAutoplay() {
                startAutoplay();
            }

            createDots();
            showSlide(currentIndex);
            startAutoplay();

            slider.addEventListener("mouseenter", stopAutoplay);
            slider.addEventListener("mouseleave", startAutoplay);
            slider.addEventListener("focusin", stopAutoplay);

            slider.addEventListener("focusout", event => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            doc.addEventListener("visibilitychange", () => {
                doc.hidden ? stopAutoplay() : startAutoplay();
            });
        });
    }

    /* =========================================================
       7. AGRANDISSEMENT DES IMAGES (LIGHTBOX)
       ========================================================= */
    function initLightbox() {
        const lightbox = $("#lightbox");
        const lightboxImage = lightbox ? $("img", lightbox) : null;
        const closeButton = $("#lightbox-close");

        if (!lightbox || !lightboxImage) return;

        let previousFocus = null;

        function openLightbox(image) {
            if (!image) return;

            const imageSource = image.currentSrc || image.src;
            if (!imageSource) return;

            previousFocus = doc.activeElement;

            lightboxImage.src = imageSource;
            lightboxImage.alt = image.alt || "Image agrandie";

            lightbox.hidden = false;
            lightbox.classList.add("open", "active");
            lightbox.setAttribute("aria-hidden", "false");
            root.classList.add("lightbox-open");

            if (closeButton) closeButton.focus();
        }

        function closeLightbox() {
            lightbox.classList.remove("open", "active");
            lightbox.setAttribute("aria-hidden", "true");
            root.classList.remove("lightbox-open");

            lightbox.hidden = true;
            lightboxImage.removeAttribute("src");

            if (previousFocus && typeof previousFocus.focus === "function") {
                previousFocus.focus();
            }
        }

        $$("[data-zoom]").forEach(image => {
            image.style.cursor = "zoom-in";
            image.setAttribute("tabindex", "0");
            image.setAttribute("role", "button");

            image.addEventListener("click", () => openLightbox(image));

            image.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(image);
                }
            });
        });

        if (closeButton) {
            closeButton.addEventListener("click", closeLightbox);
        }

        lightbox.addEventListener("click", event => {
            if (event.target === lightbox) closeLightbox();
        });

        doc.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                !lightbox.hidden
            ) {
                closeLightbox();
            }
        });
    }

    /* =========================================================
       8. FORMULAIRE DE CONTACT
       Ouvre le logiciel de messagerie de l'utilisateur
       ========================================================= */
    function initContactForm() {
        const form = $("#contact-form");
        if (!form) return;

        const status = $("#form-status");

        function setStatus(message, type = "") {
            if (!status) return;

            status.textContent = message;
            status.className = "form-status";

            if (type) status.classList.add(type
