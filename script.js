/* =========================================================
   PORTFOLIO — Harisson Ford • script.js (v4.1)
   ========================================================= */
(() => {
    "use strict";

    const doc = document;
    const root = doc.documentElement;

    const $ = (sel, ctx = doc) => (ctx ? ctx.querySelector(sel) : null);
    const $$ = (sel, ctx = doc) => (ctx ? Array.from(ctx.querySelectorAll(sel)) : []);
    const isEscape = (e) => e.key === "Escape" || e.key === "Esc";

    /* Un module qui échoue ne doit jamais bloquer les autres. */
    const run = (name, fn) => {
        try {
            fn();
        } catch (err) {
            if (window.console && console.error) console.error("[portfolio] " + name + " :", err);
        }
    };

    /* ---------- Préférence « réduire les animations » (lue en direct) ---------- */
    const motionQuery = typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const reducedMotion = () => Boolean(motionQuery && motionQuery.matches);
    const onMotionChange = (fn) => {
        if (!motionQuery) return;
        if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", fn);
        else if (typeof motionQuery.addListener === "function") motionQuery.addListener(fn);
    };

    /* =========================================================
       THÈME CLAIR / SOMBRE
       ========================================================= */
    function initTheme() {
        const themeBtn = $("#theme-toggle");
        const themeMeta = $('meta[name="theme-color"]');

        const readSaved = () => {
            try {
                const v = window.localStorage.getItem("theme");
                return v === "light" || v === "dark" ? v : null;
            } catch (e) {
                return null; // stockage indisponible
            }
        };
        const save = (theme) => {
            try {
                window.localStorage.setItem("theme", theme);
            } catch (e) {
                /* stockage indisponible : le thème reste appliqué pour cette visite */
            }
        };

        const apply = (theme, persist) => {
            root.setAttribute("data-theme", theme);
            if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f4f6fc" : "#0b1020");
            if (themeBtn) {
                themeBtn.setAttribute(
                    "aria-label",
                    theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"
                );
            }
            if (persist) save(theme);
        };

        const current = root.getAttribute("data-theme");
        apply(current === "light" || current === "dark" ? current : readSaved() || "dark", false);

        if (themeBtn) {
            themeBtn.addEventListener("click", () => {
                if (!reducedMotion()) {
                    root.classList.add("theme-anim");
                    window.setTimeout(() => root.classList.remove("theme-anim"), 450);
                }
                apply(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
            });
        }

        /* Synchronise les onglets ouverts en même temps */
        window.addEventListener("storage", (e) => {
            if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) apply(e.newValue, false);
        });
    }

    /* =========================================================
       BARRE DE NAVIGATION, PROGRESSION, RETOUR EN HAUT
       ========================================================= */
    function initScrollUI() {
        const header = $("#header");
        const bar = $("#scroll-progress");
        const topBtn = $("#to-top");
        let ticking = false;

        const update = () => {
            ticking = false;
            const y = window.pageYOffset || root.scrollTop || 0;

            if (header) header.classList.toggle("scrolled", y > 20);

            if (bar) {
                const max = root.scrollHeight - window.innerHeight;
                const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
                bar.style.width = pct + "%";
            }

            if (topBtn) {
                const visible = y > 700;
                topBtn.classList.toggle("show", visible);
                topBtn.tabIndex = visible ? 0 : -1;
                topBtn.setAttribute("aria-hidden", visible ? "false" : "true");
            }
        };

        const request = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        };

        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        update();

        if (topBtn) {
            topBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
            });
        }
    }

    /* =========================================================
       MENU MOBILE
       ========================================================= */
    function initMenu() {
        const toggle = $("#nav-toggle");
        const menu = $("#nav-links");
        if (!toggle || !menu) return;

        const icon = $("i", toggle);
        const isOpen = () => menu.classList.contains("open");

        const setMenu = (open) => {
            menu.classList.toggle("open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
            if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
        };

        setMenu(false); // état initial cohérent (aria-expanded="false")

        toggle.addEventListener("click", () => setMenu(!isOpen()));

        $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

        doc.addEventListener("keydown", (e) => {
            if (!isEscape(e) || !isOpen()) return;
            const focusInside = menu.contains(doc.activeElement) || doc.activeElement === toggle;
            setMenu(false);
            if (focusInside) toggle.focus();
        });

        doc.addEventListener("click", (e) => {
            if (isOpen() && !e.target.closest(".navbar")) setMenu(false);
        });

        /* Le menu repasse en barre horizontale au-dessus de 960 px : on referme l'état mobile */
        window.addEventListener("resize", () => {
            const desktop = typeof window.matchMedia === "function"
                ? window.matchMedia("(min-width: 961px)").matches
                : window.innerWidth > 960;
            if (desktop && isOpen()) setMenu(false);
        });
    }

    /* =========================================================
       LIEN ACTIF SELON LA SECTION VISIBLE
       ========================================================= */
    function initScrollSpy() {
        if (!("IntersectionObserver" in window)) return;
        const links = $$(".nav-link");
        const sections = $$("main section[id]");
        if (links.length === 0 || sections.length === 0) return;

        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    links.forEach((l) => {
                        const active = l.getAttribute("href") === "#" + entry.target.id;
                        l.classList.toggle("active", active);
                        if (active) l.setAttribute("aria-current", "true");
                        else l.removeAttribute("aria-current");
                    });
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        sections.forEach((s) => spy.observe(s));
    }

    /* =========================================================
       DIAPORAMAS DE CAPTURES
       ========================================================= */
    function initSliders() {
        const controllers = [];

        $$("[data-slider]").forEach((slider) => {
            const slides = $$(".slide", slider);
            if (slides.length < 2) return;

            const caption = $(".slide-caption", slider);
            const dotsWrap = $(".slider-dots", slider);
            let dots = dotsWrap ? $$(".dot", dotsWrap) : [];

            // Crée les points automatiquement s'ils ne correspondent pas aux images
            if (dotsWrap && dots.length !== slides.length) {
                dotsWrap.innerHTML = "";
                slides.forEach((s, n) => {
                    const b = doc.createElement("button");
                    b.type = "button";
                    b.className = "dot";
                    b.setAttribute("aria-label", "Capture " + (n + 1) + " : " + (s.dataset.caption || ""));
                    dotsWrap.appendChild(b);
                });
                dots = $$(".dot", dotsWrap);
            }

            let index = Math.max(0, slides.findIndex((s) => s.classList.contains("active")));
            let timer = null;
            let hovering = false;
            let focusedByKeyboard = false;

            const show = (i) => {
                index = (i + slides.length) % slides.length;
                slides.forEach((s, n) => {
                    s.classList.toggle("active", n === index);
                    s.setAttribute("aria-hidden", n === index ? "false" : "true");
                });
                dots.forEach((d, n) => {
                    d.classList.toggle("active", n === index);
                    if (n === index) d.setAttribute("aria-current", "true");
                    else d.removeAttribute("aria-current");
                });
                if (caption) caption.textContent = slides[index].dataset.caption || "";
            };

            const stop = () => {
                if (timer !== null) {
                    window.clearInterval(timer);
                    timer = null;
                }
            };
            const canPlay = () => !reducedMotion() && !hovering && !focusedByKeyboard && !doc.hidden;
            const play = () => {
                stop();
                if (canPlay()) timer = window.setInterval(() => show(index + 1), 4500);
            };

            dots.forEach((d, n) =>
                d.addEventListener("click", () => {
                    show(n);
                    play();
                })
            );

            /* Pause au survol (souris uniquement : un appui tactile ne doit pas bloquer le défilement) */
            const enterEvt = window.PointerEvent ? "pointerenter" : "mouseenter";
            const leaveEvt = window.PointerEvent ? "pointerleave" : "mouseleave";
            slider.addEventListener(enterEvt, (e) => {
                if (e.pointerType === "touch") return;
                hovering = true;
                stop();
            });
            slider.addEventListener(leaveEvt, (e) => {
                if (e.pointerType === "touch") return;
                hovering = false;
                play();
            });

            /* Pause quand la navigation se fait au clavier à l'intérieur du diaporama */
            slider.addEventListener("focusin", (e) => {
                try {
                    focusedByKeyboard = e.target.matches(":focus-visible");
                } catch (err) {
                    focusedByKeyboard = true;
                }
                if (focusedByKeyboard) stop();
            });
            slider.addEventListener("focusout", (e) => {
                if (slider.contains(e.relatedTarget)) return;
                focusedByKeyboard = false;
                play();
            });

            show(index);
            play();
            controllers.push(play);
        });

        if (controllers.length > 0) {
            const refreshAll = () => controllers.forEach((play) => play());
            onMotionChange(refreshAll);
            doc.addEventListener("visibilitychange", refreshAll);
        }
    }

    /* =========================================================
       AGRANDISSEMENT DES CAPTURES
       ========================================================= */
    function initLightbox() {
        const lightbox = $("#lightbox");
        const lightboxImg = lightbox ? $("img", lightbox) : null;
        if (!lightbox || !lightboxImg) return;

        const closeBtn = $("#lightbox-close") || $(".lightbox-close", lightbox);
        let lastFocus = null;

        const isOpen = () => !lightbox.hidden;

        const open = (img) => {
            const src = img.currentSrc || img.getAttribute("src");
            if (!src) return;
            lastFocus = doc.activeElement;
            lightboxImg.src = src;
            lightboxImg.alt = img.alt || "";
            lightbox.setAttribute("role", "dialog");
            lightbox.setAttribute("aria-modal", "true");
            lightbox.setAttribute("aria-label", "Agrandissement de la capture");
            lightbox.hidden = false;
            doc.body.style.overflow = "hidden";
            if (closeBtn) closeBtn.focus();
        };

        const close = () => {
            if (!isOpen()) return;
            lightbox.hidden = true;
            lightboxImg.removeAttribute("src");
            lightboxImg.alt = "";
            doc.body.style.overflow = "";
            if (lastFocus && typeof lastFocus.focus === "function" && doc.contains(lastFocus)) lastFocus.focus();
            lastFocus = null;
        };

        /* Dans un diaporama, les images sont empilées : on agrandit toujours la capture affichée */
        $$("[data-slider]").forEach((slider) => {
            slider.addEventListener("click", (e) => {
                if (e.target.closest(".slider-dots")) return;
                const img = $(".slide.active[data-zoom]", slider) || $(".slide[data-zoom]", slider);
                if (img) open(img);
            });
        });

        /* Images agrandissables hors diaporama */
        $$("[data-zoom]").forEach((img) => {
            if (img.closest("[data-slider]")) return;
            img.addEventListener("click", () => open(img));
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target !== lightboxImg) close();
        });
        lightboxImg.addEventListener("error", () => {
            if (isOpen() && lightboxImg.getAttribute("src")) close();
        });
        doc.addEventListener("keydown", (e) => {
            if (!isOpen()) return;
            if (isEscape(e)) {
                close();
            } else if (e.key === "Tab") {
                e.preventDefault(); // seul le bouton de fermeture est utilisable
                if (closeBtn) closeBtn.focus();
            }
        });
    }

    /* =========================================================
       FORMULAIRE DE CONTACT
       Le formulaire ouvre la messagerie du visiteur (mailto:) avec un
       message prérempli. Il n'envoie RIEN lui-même.
       ========================================================= */
    function initContactForm() {
        const form = $("#contact-form");
        if (!form) return;

        const MAIL_TO = "hehueni@gmail.com";
        const MAILTO_MAX_LENGTH = 1900;
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let status = $("#form-status");
        if (!status) {
            status = doc.createElement("p");
            status.id = "form-status";
            status.className = "form-status";
            status.setAttribute("role", "status");
            const submitBtn = $('[type="submit"]', form);
            if (submitBtn && submitBtn.parentNode) submitBtn.parentNode.insertBefore(status, submitBtn);
            else form.appendChild(status);
        }

        const setStatus = (text, kind, withMailLink) => {
            status.classList.remove("ok", "info");
            status.style.color = "";
            status.textContent = text;
            if (kind === "info") {
                status.classList.add("info");
                status.style.color = "var(--soft)"; // message neutre (ni erreur, ni confirmation d'envoi)
            }
            if (withMailLink) {
                const link = doc.createElement("a");
                link.href = "mailto:" + MAIL_TO;
                link.textContent = MAIL_TO;
                link.style.textDecoration = "underline";
                status.appendChild(doc.createTextNode(" "));
                status.appendChild(link);
                status.appendChild(doc.createTextNode("."));
            }
        };

        const fields = [
            { id: "cf-first", ok: (v) => v.length >= 2 },
            { id: "cf-last", ok: (v) => v.length >= 2 },
            { id: "cf-email", ok: (v) => EMAIL_RE.test(v) },
            { id: "cf-message", ok: (v) => v.length >= 5 },
        ]
            .map((f) => ({ id: f.id, ok: f.ok, el: $("#" + f.id) }))
            .filter((f) => f.el);

        const markField = (el, invalid) => {
            if (el.parentElement) el.parentElement.classList.toggle("error", invalid);
            if (invalid) el.setAttribute("aria-invalid", "true");
            else el.removeAttribute("aria-invalid");
        };

        fields.forEach((f) => f.el.addEventListener("input", () => markField(f.el, false)));

        const value = (id) => {
            const el = $("#" + id);
            return el ?
