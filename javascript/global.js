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
