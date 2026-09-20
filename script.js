/* =========================================================
   PORTFOLIO — Harisson Ford • script.js (v3)
   ========================================================= */
(() => {
    "use strict";

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    /* ---------- Thème clair / sombre ---------- */
    const root = document.documentElement;
    const themeBtn = $("#theme-toggle");
    const themeMeta = $('meta[name="theme-color"]');

    const applyTheme = (theme, save) => {
        root.setAttribute("data-theme", theme);
        if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f4f6fc" : "#0b1020");
        if (themeBtn) {
            themeBtn.setAttribute(
                "aria-label",
                theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"
            );
        }
        if (save) {
            try { localStorage.setItem("theme", theme); } catch (e) { /* stockage indisponible */ }
        }
    };

    applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            root.classList.add("theme-anim");
            applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
            setTimeout(() => root.classList.remove("theme-anim"), 450);
        });
    }

    /* ---------- Barre de navigation : état au scroll ---------- */
    const header = $("#header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Menu mobile ---------- */
    const toggle = $("#nav-toggle");
    const menu = $("#nav-links");

    const setMenu = (open) => {
        menu.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
        toggle.innerHTML = open
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    };

    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("#nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".navbar")) setMenu(false);
    });

    /* ---------- Lien actif selon la section visible ---------- */
    const links = $$(".nav-link");
    const sections = $$("main section[id]");

    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    links.forEach((l) =>
                        l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id)
                    );
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Slider de captures ---------- */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    $$("[data-slider]").forEach((slider) => {
        const slides = $$(".slide", slider);
        if (slides.length < 2) return;

        // Crée les points automatiquement s'ils ne sont pas dans le HTML
        const dotsWrap = $(".slider-dots", slider);
        let dots = $$(".dot", slider);
        if (dotsWrap && dots.length !== slides.length) {
            dotsWrap.innerHTML = "";
            slides.forEach((s, n) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "dot" + (n === 0 ? " active" : "");
                b.setAttribute("aria-label", "Capture " + (n + 1) + " : " + (s.dataset.caption || ""));
                dotsWrap.appendChild(b);
            });
            dots = $$(".dot", slider);
        }

        let index = 0;
        let timer = null;

        const caption = $(".slide-caption", slider);

        const show = (i) => {
            index = (i + slides.length) % slides.length;
            slides.forEach((s, n) => s.classList.toggle("active", n === index));
            dots.forEach((d, n) => d.classList.toggle("active", n === index));
            if (caption) caption.textContent = slides[index].dataset.caption || "";
        };

        const start = () => {
            if (reduceMotion) return;
            stop();
            timer = setInterval(() => show(index + 1), 4500);
        };
        const stop = () => clearInterval(timer);

        dots.forEach((d, n) =>
            d.addEventListener("click", () => {
                show(n);
                start();
            })
        );

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        slider.addEventListener("focusin", stop);
        slider.addEventListener("focusout", start);
        start();
    });

    /* ---------- Agrandissement des captures ---------- */
    const lightbox = $("#lightbox");
    const lightboxImg = lightbox ? $("img", lightbox) : null;

    const closeLightbox = () => {
        lightbox.hidden = true;
        lightboxImg.src = "";
        document.body.style.overflow = "";
    };

    if (lightbox) {
        $$("[data-zoom]").forEach((img) =>
            img.addEventListener("click", () => {
                lightboxImg.src = img.currentSrc || img.src;
                lightboxImg.alt = img.alt;
                lightbox.hidden = false;
                document.body.style.overflow = "hidden";
            })
        );
        lightbox.addEventListener("click", (e) => {
            if (e.target !== lightboxImg) closeLightbox();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
        });
    }

    /* ---------- Formulaire de contact (ouvre l'application mail) ---------- */
    const form = $("#contact-form");
    const status = $("#form-status");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const fields = [
                { el: $("#cf-first"), ok: (v) => v.length >= 2 },
                { el: $("#cf-last"), ok: (v) => v.length >= 2 },
                { el: $("#cf-email"), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
                { el: $("#cf-message"), ok: (v) => v.length >= 5 },
            ];

            let valid = true;
            fields.forEach(({ el, ok }) => {
                const good = ok(el.value.trim());
                el.parentElement.classList.toggle("error", !good);
                if (!good) valid = false;
            });

            status.classList.remove("ok");
            if (!valid) {
                status.textContent = "Veuillez remplir correctement tous les champs obligatoires.";
                return;
            }

            const name = $("#cf-first").value.trim() + " " + $("#cf-last").value.trim();
            const email = $("#cf-email").value.trim();
            const phone = $("#cf-phone").value.trim();
            const message = $("#cf-message").value.trim();

            const subject = encodeURIComponent("Contact depuis le portfolio — " + name);
            const body = encodeURIComponent(
                message + "\n\n— " + name + " (" + email + (phone ? ", " + phone : "") + ")"
            );

            window.location.href = "mailto:hehueni@gmail.com?subject=" + subject + "&body=" + body;

            status.textContent = "Votre application mail va s'ouvrir pour envoyer le message.";
            status.classList.add("ok");
            form.reset();
        });
    }
})();
