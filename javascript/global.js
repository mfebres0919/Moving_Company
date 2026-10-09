/* ==========================================================================
   Bayou City Movers — Global Scripts
   Shared behavior: top bar links, mobile menu, dropdowns, sticky navbar.
   ========================================================================== */

/* ---------- Loading screen: counts to 100% while the truck drives across ---------- */
(function () {
    const loader = document.getElementById("loader");
    if (!loader) {
        document.dispatchEvent(new Event("loader:done"));
        return;
    }

    const percentText = document.getElementById("loader-percent");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MIN_TIME = reduceMotion ? 0 : 1600; // keep it on screen long enough to read
    const start = performance.now();

    // Track the images needed straight away (lazy ones load later) plus the web fonts
    const images = [...document.images].filter((img) => img.loading !== "lazy");
    let total = images.length + 2; // + fonts + page load
    let done = 0;

    function tick() {
        done = Math.min(done + 1, total);
    }

    images.forEach((img) => {
        if (img.complete) {
            tick();
        } else {
            img.addEventListener("load", tick, { once: true });
            img.addEventListener("error", tick, { once: true });
        }
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(tick);
    } else {
        tick();
    }

    let pageLoaded = document.readyState === "complete";
    if (pageLoaded) {
        tick();
    } else {
        window.addEventListener("load", () => { pageLoaded = true; tick(); }, { once: true });
    }

    let shown = 0;

    function finish() {
        loader.classList.add("is-done");
        setTimeout(() => {
            loader.classList.add("is-hidden");
            document.dispatchEvent(new Event("loader:done"));
            setTimeout(() => loader.remove(), 700);
        }, reduceMotion ? 0 : 700);
    }

    function step() {
        const elapsed = performance.now() - start;
        const timeShare = MIN_TIME ? Math.min(elapsed / MIN_TIME, 1) : 1;
        const assetShare = done / total;
        // Never run ahead of real loading or the minimum time; ease the number toward the target
        const target = Math.min(timeShare, assetShare) * 100;
        shown += (target - shown) * 0.18;
        if (target - shown < 0.5) shown = target;

        const value = Math.floor(shown);
        percentText.textContent = value;
        loader.style.setProperty("--progress", (shown / 100).toFixed(3));

        if (value >= 100 && pageLoaded) {
            finish();
        } else {
            requestAnimationFrame(step);
        }
    }

    // Stop the CSS failsafe now that JavaScript is running the show
    loader.style.animation = "none";
    requestAnimationFrame(step);
})();

(function () {
    const header = document.getElementById("site-header");
    if (!header) return;

    const topbar = header.querySelector(".topbar");
    const topbarToggle = header.querySelector(".topbar-toggle");
    const menuToggle = document.getElementById("menu-toggle");
    const siteMenu = document.getElementById("site-menu");
    const dropdownItems = header.querySelectorAll(".has-dropdown");
    const desktopQuery = window.matchMedia("(min-width: 80rem)");

    /* ---------- Top bar "Useful links" (mobile) ---------- */
    topbarToggle.addEventListener("click", () => {
        const isOpen = topbar.classList.toggle("is-open");
        topbarToggle.setAttribute("aria-expanded", String(isOpen));
    });

    /* ---------- Dropdowns ---------- */
    function setDropdown(item, open) {
        item.classList.toggle("is-open", open);
        item.querySelector(".dropdown-toggle").setAttribute("aria-expanded", String(open));
    }

    function closeAllDropdowns(except) {
        dropdownItems.forEach((item) => {
            if (item !== except) setDropdown(item, false);
        });
    }

    dropdownItems.forEach((item) => {
        item.querySelector(".dropdown-toggle").addEventListener("click", () => {
            const willOpen = !item.classList.contains("is-open");
            closeAllDropdowns(item);
            setDropdown(item, willOpen);
        });
    });

    /* ---------- Mobile menu ---------- */
    function setMenu(open) {
        siteMenu.classList.toggle("is-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open && !desktopQuery.matches);
        if (!open) closeAllDropdowns();
    }

    menuToggle.addEventListener("click", () => {
        setMenu(!siteMenu.classList.contains("is-open"));
    });

    // Close everything after following a link
    siteMenu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const openDropdown = header.querySelector(".has-dropdown.is-open");
        if (openDropdown) {
            setDropdown(openDropdown, false);
            openDropdown.querySelector(".dropdown-toggle").focus();
        } else if (siteMenu.classList.contains("is-open")) {
            setMenu(false);
            menuToggle.focus();
        }
    });

    // Clicking outside the header closes any open menu or dropdown
    document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) setMenu(false);
    });

    // Reset mobile state when resizing up to desktop
    desktopQuery.addEventListener("change", () => setMenu(false));

    /* ---------- Sticky navbar once the top bar scrolls away ---------- */
    const observer = new IntersectionObserver(([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
    });
    observer.observe(topbar);
})();

/* ---------- Back to top button: shows after the first screen ---------- */
(function () {
    const button = document.getElementById("back-to-top");
    if (!button) return;

    function update() {
        button.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
})();

/* ---------- Footer year stays current ---------- */
(function () {
    const year = document.getElementById("footer-year");
    if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Highlight the nav link for the section on screen ---------- */
(function () {
    const links = [...document.querySelectorAll(".nav-list .nav-link[href^='#']")];
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
    if (!sections.length) return;

    let ticking = false;

    function update() {
        ticking = false;
        // The active section is the last one whose top has passed 40% of the screen
        const line = window.innerHeight * 0.4;
        let active = sections[0];
        sections.forEach((section) => {
            if (section.getBoundingClientRect().top <= line) active = section;
        });
        // At the very bottom of the page, the last section wins
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            active = sections[sections.length - 1];
        }

        const id = "#" + active.id;
        links.forEach((link) => {
            const isActive = link.getAttribute("href") === id;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
})();

/* ---------- Scroll reveal: fade sections in as they enter the screen ---------- */
(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // [selector, direction, stagger in seconds between matches]
    const groups = [
        [".hero-eyebrow, .hero-title, .hero-text, .hero-actions, .hero-badges, .hero-controls", "up", 0.12],
        // Animate the wrapper, not the card: moving the card itself would lift its red glow (::before) on top of it
        [".quote > .container", "up", 0],
        [".services-intro > *", "left", 0.1],
        [".services-carousel", "right", 0],
        [".areas-intro > *", "left", 0.08],
        [".map-card", "right", 0],
        [".communities-header", "up", 0],
        [".communities-track", "up", 0],
        [".process-header > *", "up", 0.1],
        [".process-details, .process-cta", "left", 0.15],
        [".process-showcase", "zoom", 0],
        [".process-stats", "up", 0],
        [".final-cta-visual", "left", 0],
        [".final-cta-content > *", "right", 0.1],
        [".contact-info", "left", 0],
        [".contact-form-wrap", "right", 0.1],
        [".footer-grid > *", "up", 0.08],
    ];

    const targets = [];
    groups.forEach(([selector, direction, stagger]) => {
        document.querySelectorAll(selector).forEach((element, i) => {
            element.dataset.reveal = direction;
            element.style.setProperty("--reveal-delay", `${i * stagger}s`);
            targets.push(element);
        });
    });

    document.documentElement.classList.add("reveal-ready");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            element.classList.add("is-revealed");

            // Once finished, drop the reveal styles so the element's own transitions work normally
            element.addEventListener("transitionend", function cleanup(event) {
                if (event.target !== element || event.propertyName !== "opacity") return;
                element.removeEventListener("transitionend", cleanup);
                element.removeAttribute("data-reveal");
                element.classList.remove("is-revealed");
                element.style.removeProperty("--reveal-delay");
            });
        });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    // Make sure the hidden state is applied before anything reveals
    void document.body.offsetHeight;

    // Start once the loading screen is gone, so the hero animates in right as the site appears
    const loader = document.getElementById("loader");
    function start() {
        targets.forEach((element) => observer.observe(element));
    }
    if (loader) {
        document.addEventListener("loader:done", start, { once: true });
    } else {
        start();
    }
})();
