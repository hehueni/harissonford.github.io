/* =========================================================
   PORTFOLIO — Harisson Ford • script.js (v4.1)
   ========================================================= */
(() => {
    "use strict";

    const doc = document;
    const root = doc.documentElement;

    const $ = (sel, ctx = doc) => (ctx ? ctx.querySelector(sel) : null);
    const $$ = (sel, ctx = doc) => (ctx ? Array.from(ctx.querySelectorAll(sel)) : []);

    const on = (el, event, handler, options) => {
        if (el) el.addEventListener(event, handler, options);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================================================
       1. THÈME CLAIR / SOMBRE
       ========================================================= */
    function initTheme() {
        const themeToggle = $("#theme-toggle");
        const savedTheme = localStorage.getItem("portfolio-theme");

        if (savedTheme === "dark" || savedTheme === "light") {
            root.setAttribute("data-theme", savedTheme);
        }

        function updateThemeButton() {
            if (!themeToggle) return;

            const isDark = root.getAttribute("data-theme") === "dark";

            themeToggle.setAttribute("aria-label", isDark
                ? "Activer le thème clair"
                : "Activer le thème sombre");

            themeToggle.setAttribute("title", isDark
                ? "Thème clair"
                : "Thème sombre");

            const icon = $("i", themeToggle);
            if (icon) {
                icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
            }
        }

        on(themeToggle, "click", () => {
            const isDark = root.getAttribute("data-theme") === "dark";
            const nextTheme = isDark ? "light" : "dark";

            root.setAttribute("data-theme", nextTheme);
            localStorage.setItem("portfolio-theme", nextTheme);
            updateThemeButton();
        });

        updateThemeButton();
    }

    /* =========================================================
       2. MENU MOBILE
       ========================================================= */
    function initMobileMenu() {
        const toggle = $("#nav-toggle");
        const nav = $("#nav-links");

        if (!toggle || !nav) return;

        function closeMenu() {
            nav.classList.remove("open", "active");
            toggle.classList.remove("active");
            toggle.setAttribute("aria-expanded", "false");
            root.classList.remove("menu-open");
        }

        function openMenu() {
            nav.classList.add("open");
            toggle.classList.add("active");
            toggle.setAttribute("aria-expanded", "true");
            root.classList.add("menu-open");
        }

        on(toggle, "click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            expanded ? closeMenu() : openMenu();
        });

        $$(".nav-link", nav).forEach(link => {
            on(link, "click", closeMenu);
        });

        on(doc, "keydown", event => {
            if (event.key === "Escape") closeMenu();
        });

        on(doc, "click", event => {
            if (
                nav.classList.contains("open") &&
                !nav.contains(event.target) &&
                !toggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        on(window, "resize", () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    /* =========================================================
       3. BARRE DE PROGRESSION DU SCROLL
       ========================================================= */
    function initScrollProgress() {
        const progress = $("#scroll-progress");
        if (!progress) return;

        let ticking = false;

        function updateProgress() {
            const scrollTop = window.scrollY || root.scrollTop;
            const scrollHeight = root.scrollHeight - window.innerHeight;
            const percentage = scrollHeight > 0
                ? (scrollTop / scrollHeight) * 100
                : 0;

            progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
            ticking = false;
        }

        on(window, "scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        updateProgress();
    }

    /* =========================================================
       4. EN-TÊTE ET BOUTON RETOUR EN HAUT
       ========================================================= */
    function initScrollEffects() {
        const header = $("#header");
        const toTop = $("#to-top");

        function updateScrollState() {
            const scrollY = window.scrollY || 0;

            if (header) {
                header.classList.toggle("scrolled", scrollY > 30);
            }

            if (toTop) {
                toTop.classList.toggle("show", scrollY > 450);
                toTop.setAttribute(
                    "aria-hidden",
                    scrollY > 450 ? "false" : "true"
                );
            }
        }

        on(window, "scroll", updateScrollState, { passive: true });

        on(toTop, "click", () => {
            window.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth"
            });
        });

        updateScrollState();
    }

    /* =========================================================
       5. LIENS DE NAVIGATION ACTIFS
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
                    const active =
                        link.getAttribute("href") === `#${entry.target.id}`;

                    link.classList.toggle("active", active);

                    if (active) {
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
       ========================================================= */
    function initSliders() {
        $$("[data-slider]").forEach((slider, sliderIndex) => {
            const slides = $$(".slide", slider);
            const dotsContainer = $(".slider-dots", slider);
            const previousButton = $("[data-prev]", slider);
            const nextButton = $("[data-next]", slider);

            if (!slides.length) return;

            let currentIndex = slides.findIndex(slide =>
                slide.classList.contains("active")
            );

            if (currentIndex < 0) currentIndex = 0;

            let timer = null;

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
            }

            if (dotsContainer) {
                dotsContainer.innerHTML = "";

                slides.forEach((_, i) => {
                    const dot = doc.createElement("button");

                    dot.type = "button";
                    dot.className = "dot";
                    dot.setAttribute("aria-label", `Afficher l'image ${i + 1}`);

                    on(dot, "click", () => {
                        showSlide(i);
                        restartAutoplay();
                    });

                    dotsContainer.appendChild(dot);
                });
            }

            on(previousButton, "click", () => {
                showSlide(currentIndex - 1);
                restartAutoplay();
            });

            on(nextButton, "click", () => {
                showSlide(currentIndex + 1);
                restartAutoplay();
            });

            function stopAutoplay() {
                if (timer !== null) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            function startAutoplay() {
                stopAutoplay();

                if (
                    reduceMotion ||
                    slides.length < 2 ||
                    doc.hidden
                ) return;

                timer = window.setInterval(() => {
                    showSlide(currentIndex + 1);
                }, 5000);
            }

            function restartAutoplay() {
                startAutoplay();
            }

            on(slider, "mouseenter", stopAutoplay);
            on(slider, "mouseleave", startAutoplay);
            on(slider, "focusin", stopAutoplay);
            on(slider, "focusout", event => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            on(doc, "visibilitychange", () => {
                doc.hidden ? stopAutoplay() : startAutoplay();
            });

            slider.dataset.sliderInitialized = String(sliderIndex);

            showSlide(currentIndex);
            startAutoplay();
        });
    }

    /* =========================================================
       7. AGRANDISSEMENT DES IMAGES
       ========================================================= */
    function initLightbox() {
        const lightbox = $("#lightbox");
        if (!lightbox) return;

        const lightboxImage = $("img", lightbox);
        const closeButton = $("#lightbox-close") ||
            $(".lightbox-close", lightbox);

        if (!lightboxImage) return;

        let previousFocus = null;

        function openLightbox(image) {
            if (!image) return;

            const source = image.currentSrc || image.src;
            if (!source) return;

            previousFocus = doc.activeElement;

            lightboxImage.src = source;
            lightboxImage.alt = image.alt || "Image agrandie";

            lightbox.classList.add("open", "active");
            lightbox.setAttribute("aria-hidden", "false");
            root.classList.add("lightbox-open");

            if (closeButton) closeButton.focus();
        }

        function closeLightbox() {
            lightbox.classList.remove("open", "active");
            lightbox.setAttribute("aria-hidden", "true");
            root.classList.remove("lightbox-open");

            lightboxImage.removeAttribute("src");

            if (previousFocus && typeof previousFocus.focus === "function") {
                previousFocus.focus();
            }
        }

        $$("[data-zoom]").forEach(image => {
            on(image, "click", () => openLightbox(image));

            if (image.tagName === "IMG") {
                image.style.cursor = "zoom-in";
            }
        });

        on(closeButton, "click", closeLightbox);

        on(lightbox, "click", event => {
            if (event.target === lightbox) closeLightbox();
        });

        on(doc, "keydown", event => {
            if (
                event.key === "Escape" &&
                lightbox.classList.contains("open")
            ) {
                closeLightbox();
            }
        });
    }

    /* =========================================================
       8. FORMULAIRE DE CONTACT
       ========================================================= */
    function initContactForm() {
        const form = $("#contact-form");
        if (!form) return;

        const status = $("#form-status");

        function setStatus(message, type = "") {
            if (!status) return;

            status.textContent = message;
            status.className = "form-status";

            if (type) status.classList.add(type);
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");
        }

        on(form, "submit", event => {
            event.preventDefault();

            const firstName = $("#cf-first")?.value.trim() || "";
            const lastName = $("#cf-last")?.value.trim() || "";
            const email = $("#cf-email")?.value.trim() || "";
            const phone = $("#cf-phone")?.value.trim() || "";
            const message = $("#cf-message")?.value.trim() || "";

            if (!firstName || !lastName || !email || !message) {
                setStatus("Veuillez remplir tous les champs obligatoires.", "error");
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                setStatus("Veuillez saisir une adresse e-mail valide.", "error");
                $("#cf-email")?.focus();
                return;
            }

            if (message.length < 10) {
                setStatus("Votre message doit contenir au moins 10 caractères.", "error");
                $("#cf-message")?.focus();
                return;
            }

            const recipient = "hehueni@gmail.com";
            const subject = `Contact portfolio — ${firstName} ${lastName}`;

            const body = [
                `Nom : ${firstName} ${lastName}`,
                `E-mail : ${email}`,
                `Téléphone : ${phone || "Non renseigné"}`,
                "",
                "Message :",
                message
            ].join("\n");

            const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            setStatus(
                "Votre application de messagerie va s'ouvrir. Vérifiez le message puis envoyez-le.",
                "success"
            );

            window.location.href = mailto;
        });
    }

    /* =========================================================
       9. ANIMATIONS À L'APPARITION
       ========================================================= */
    function initReveal() {
        const elements = $$(
            "section, .project-card, .skill-card, .experience-card, .formation-card"
        );

        if (!elements.length) return;

        if (
            reduceMotion ||
            !("IntersectionObserver" in window)
        ) {
            elements.forEach(element => element.classList.add("in"));
            return;
        }

        elements.forEach(element => {
            if (!element.hasAttribute("data-reveal")) {
                element.setAttribute("data-reveal", "");
            }
        });

        root.classList.add("js");

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("in");
                obs.unobserve(entry.target);
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        });

        elements.forEach(element => observer.observe(element));
    }

    /* =========================================================
       10. LIENS EXTERNES SÉCURISÉS
       ========================================================= */
    function initExternalLinks() {
        $$("a[target='_blank']").forEach(link => {
            const rel = new Set(
                (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean)
            );

            rel.add("noopener");
            rel.add("noreferrer");

            link.setAttribute("rel", Array.from(rel).join(" "));
        });
    }

    /* =========================================================
       11. ANNÉE AUTOMATIQUE DU FOOTER
       ========================================================= */
    function initFooterYear() {
        const yearElements = $$("[data-current-year], #current-year");

        yearElements.forEach(element => {
            element.textContent = String(new Date().getFullYear());
        });
    }

    /* =========================================================
       12. INITIALISATION GÉNÉRALE
       ========================================================= */
    function init() {
        const modules = [
            initTheme,
            initMobileMenu,
            initScrollProgress,
            initScrollEffects,
            initActiveNavigation,
            initSliders,
            initLightbox,
            initContactForm,
            initReveal,
            initExternalLinks,
            initFooterYear
        ];

        modules.forEach(module => {
            try {
                module();
            } catch (error) {
                console.error(`Erreur dans ${module.name} :`, error);
            }
        });
    }

    if (doc.readyState === "loading") {
        doc.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
