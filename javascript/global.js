/* ==========================================================================
   Bayou City Movers — Global Scripts
   Shared behavior: top bar links, mobile menu, dropdowns, sticky navbar.
   ========================================================================== */

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
