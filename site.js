(function () {
  const LOGO_SHRINK_DISTANCE = 80;

  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const iconOpen = document.querySelector("[data-menu-icon-open]");
  const iconClose = document.querySelector("[data-menu-icon-close]");
  const logo = document.querySelector(".site-logo");
  const headerBar = document.querySelector("[data-header-bar]");
  let mobileMenuOpen = false;

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileMenuOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(mobileMenuOpen));
      if (iconOpen && iconClose) {
        iconOpen.hidden = mobileMenuOpen;
        iconClose.hidden = !mobileMenuOpen;
      }
      applyLogoTransform();
    });
  }

  document.querySelectorAll("[data-scroll-top]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const normalizedPage = currentPage === "" ? "index.html" : currentPage;

  document.querySelectorAll("[data-nav-link]").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === normalizedPage) {
      link.classList.add("is-active");
    }
  });

  function getLogoScaleEnd() {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      return 72 / 128;
    }
    if (window.matchMedia("(min-width: 1024px)").matches) {
      return 64 / 120;
    }
    return 48 / 72;
  }

  function applyLogoTransform() {
    if (!logo || !headerBar) return;

    const barRect = headerBar.getBoundingClientRect();
    const main = document.querySelector("main");
    const mainTop = main ? main.getBoundingClientRect().top : barRect.bottom;
    const scrolled = Math.max(0, barRect.bottom - mainTop);
    const progress = mobileMenuOpen
      ? 1
      : Math.min(1, Math.max(0, scrolled / LOGO_SHRINK_DISTANCE));
    const scale = 1 + (getLogoScaleEnd() - 1) * progress;
    const top = barRect.bottom - barRect.height * 0.5 * progress;

    logo.style.top = top + "px";
    logo.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  function initLogoShrink() {
    if (!logo || !headerBar) return;

    let rafId = 0;

    const onScroll = function () {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(applyLogoTransform);
    };

    applyLogoTransform();

    [window, document, document.documentElement, document.body].forEach(function (target) {
      target.addEventListener("scroll", onScroll, { passive: true, capture: true });
    });

    window.addEventListener("resize", onScroll, { passive: true });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", applyLogoTransform);
    window.matchMedia("(min-width: 1280px)").addEventListener("change", applyLogoTransform);
  }

  initLogoShrink();
})();
