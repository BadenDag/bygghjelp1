(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const iconOpen = document.querySelector("[data-menu-icon-open]");
  const iconClose = document.querySelector("[data-menu-icon-close]");
  let mobileMenuOpen = false;

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileMenuOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(mobileMenuOpen));
      if (iconOpen && iconClose) {
        iconOpen.hidden = mobileMenuOpen;
        iconClose.hidden = !mobileMenuOpen;
      }
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
})();
