(() => {
  "use strict";

  /*
   * SRIJAN HOSPITAL
   * Frontend interaction layer
   *
   * Features:
   * - Sticky header
   * - Scroll progress
   * - Mobile navigation
   * - Speciality dropdown
   * - Scroll reveal animations
   * - Animated counters
   * - Hero parallax
   * - FAQ accordion
   * - Responsive state cleanup
   */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector)
  ];

  const body = document.body;
  const header = $(".main-nav");
  const menuButton = $(".menu-toggle");
  const navPanel = $(".nav-panel");
  const dropdown = $(".nav-dropdown");
  const dropdownTrigger = $(".nav-dropdown-trigger");
  const scrollProgress = $(".scroll-progress");

  /*
   * ---------------------------------------------------------
   * SCROLL / HEADER
   * ---------------------------------------------------------
   */

  let scrollTicking = false;

  function updateScrollUI() {
    const scrollY = window.scrollY || window.pageYOffset || 0;

    /*
     * Shrink the navigation after scrolling.
     */
    if (header) {
      header.classList.toggle("scrolled", scrollY > 25);
    }

    /*
     * Scroll progress indicator.
     */
    if (scrollProgress) {
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      let percentage = 0;

      if (documentHeight > 0) {
        percentage = (scrollY / documentHeight) * 100;
      }

      scrollProgress.style.width =
        `${Math.min(100, Math.max(0, percentage))}%`;
    }

    scrollTicking = false;
  }

  function requestScrollUpdate() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScrollUI);
    }
  }

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate,
    { passive: true }
  );

  updateScrollUI();


  /*
   * ---------------------------------------------------------
   * MOBILE NAVIGATION
   * ---------------------------------------------------------
   */

  function closeMobileNavigation() {
    if (menuButton) {
      menuButton.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }

    if (navPanel) {
      navPanel.classList.remove("open");
    }

    if (dropdown) {
      dropdown.classList.remove("open");
    }

    if (dropdownTrigger) {
      dropdownTrigger.setAttribute("aria-expanded", "false");
    }

    body.classList.remove("nav-open");
  }

  if (menuButton && navPanel) {
    menuButton.addEventListener("click", () => {
      const isOpen = !navPanel.classList.contains("open");

      menuButton.classList.toggle("open", isOpen);
      navPanel.classList.toggle("open", isOpen);

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      body.classList.toggle("nav-open", isOpen);
    });
  }


  /*
   * ---------------------------------------------------------
   * SPECIALITIES DROPDOWN
   * ---------------------------------------------------------
   */

  if (dropdownTrigger && dropdown) {
    dropdownTrigger.addEventListener("click", (event) => {

      /*
       * On desktop, hover handles the dropdown.
       * Click is only needed for mobile/tablet.
       */
      if (window.innerWidth > 980) {
        return;
      }

      event.preventDefault();

      const isOpen = !dropdown.classList.contains("open");

      dropdown.classList.toggle("open", isOpen);

      dropdownTrigger.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }


  /*
   * Close navigation when a mobile navigation link is clicked.
   */

  $$(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 980) {
        closeMobileNavigation();
      }
    });
  });


  /*
   * Close dropdown when clicking outside it.
   */

  document.addEventListener("click", (event) => {
    if (!dropdown) {
      return;
    }

    if (
      window.innerWidth > 980 &&
      !dropdown.contains(event.target)
    ) {
      dropdown.classList.remove("open");

      if (dropdownTrigger) {
        dropdownTrigger.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    }
  });


  /*
   * Close mobile navigation when resizing back to desktop.
   */

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeMobileNavigation();
    }
  });


  /*
   * ---------------------------------------------------------
   * SCROLL REVEAL
   * ---------------------------------------------------------
   *
   * Elements with:
   *
   * .reveal
   * .reveal-left
   * .reveal-right
   *
   * start hidden and become visible when they enter the viewport.
   */

  const revealElements = $$(".reveal");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  if (reducedMotion) {

    /*
     * Accessibility:
     * Never hide content for users who prefer reduced motion.
     */
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

  } else if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    /*
     * Older-browser fallback.
     */
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }


  /*
   * ---------------------------------------------------------
   * ANIMATED NUMBER COUNTERS
   * ---------------------------------------------------------
   *
   * Example:
   *
   * <strong data-count="20">0</strong>
   */

  const counters = $$("[data-count]");

  function animateCounter(element) {

    if (element.dataset.counterStarted === "true") {
      return;
    }

    element.dataset.counterStarted = "true";

    const target = Number(element.dataset.count || 0);

    if (!Number.isFinite(target)) {
      return;
    }

    const duration = 1300;
    const startTime = performance.now();

    function updateCounter(currentTime) {

      const elapsed = currentTime - startTime;

      const rawProgress = Math.min(
        1,
        elapsed / duration
      );

      /*
       * Ease-out quartic.
       * Starts quickly and slows naturally.
       */
      const easedProgress =
        1 - Math.pow(1 - rawProgress, 4);

      const currentValue =
        Math.round(target * easedProgress);

      element.textContent = currentValue.toString();

      if (rawProgress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toString();
      }
    }

    requestAnimationFrame(updateCounter);
  }


  if ("IntersectionObserver" in window) {

    const counterObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          animateCounter(entry.target);

          observer.unobserve(entry.target);
        });

      },
      {
        threshold: 0.6
      }
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });

  } else {

    counters.forEach((counter) => {
      animateCounter(counter);
    });
  }


  /*
   * ---------------------------------------------------------
   * HERO IMAGE PARALLAX
   * ---------------------------------------------------------
   *
   * Only runs on devices with a mouse/pointer.
   * Disabled on touch devices and reduced-motion setups.
   */

  const heroImage = $("[data-parallax]");

  const coarsePointer = window.matchMedia(
    "(pointer: coarse)"
  ).matches;


  if (
    heroImage &&
    !reducedMotion &&
    !coarsePointer
  ) {

    let parallaxTicking = false;

    function updateParallax() {

      const rect =
        heroImage.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight;

      /*
       * Don't calculate when the image isn't visible.
       */
      if (
        rect.bottom > 0 &&
        rect.top < viewportHeight
      ) {

        const imageCenter =
          rect.top + rect.height / 2;

        const viewportCenter =
          viewportHeight / 2;

        const distance =
          viewportCenter - imageCenter;

        const offset =
          distance * -0.025;

        heroImage.style.transform =
          `translate3d(0, ${offset}px, 0) scale(1.015)`;
      }

      parallaxTicking = false;
    }

    function requestParallax() {

      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(updateParallax);
      }
    }

    window.addEventListener(
      "scroll",
      requestParallax,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestParallax,
      { passive: true }
    );

    updateParallax();
  }


  /*
   * ---------------------------------------------------------
   * SPECIALITY SEARCH
   * ---------------------------------------------------------
   *
   * Works if the page contains:
   *
   * #specialtySearch
   * #specialtyGrid
   *
   * and cards contain:
   *
   * data-name="cardiology"
   */

  const specialtySearch =
    $("#specialtySearch");

  if (specialtySearch) {

    const specialtyCards =
      $$(".specialty-card");

    specialtySearch.addEventListener(
      "input",
      () => {

        const query =
          specialtySearch.value
            .trim()
            .toLowerCase();

        specialtyCards.forEach((card) => {

          const name =
            (card.dataset.name || "")
              .toLowerCase();

          const description =
            card.textContent.toLowerCase();

          const matches =
            !query ||
            name.includes(query) ||
            description.includes(query);

          card.hidden = !matches;
        });
      }
    );
  }


  /*
   * ---------------------------------------------------------
   * FAQ ACCORDION
   * ---------------------------------------------------------
   *
   * Uses native <details>.
   * Only one FAQ item stays open at a time.
   */

  const faqItems =
    $$(".faq-list details");

  faqItems.forEach((item) => {

    item.addEventListener(
      "toggle",
      () => {

        if (!item.open) {
          return;
        }

        faqItems.forEach((otherItem) => {

          if (otherItem !== item) {
            otherItem.open = false;
          }

        });
      }
    );

  });


  /*
   * ---------------------------------------------------------
   * SMOOTH HASH NAVIGATION
   * ---------------------------------------------------------
   */

  $$('a[href^="#"]').forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const id =
          link.getAttribute("href");

        if (!id || id === "#") {
          return;
        }

        const target = $(id);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: reducedMotion
            ? "auto"
            : "smooth",
          block: "start"
        });
      }
    );

  });


  /*
   * ---------------------------------------------------------
   * MOUSE MICRO-INTERACTION FOR HERO
   * ---------------------------------------------------------
   *
   * Gives the hero image a very subtle response to the mouse.
   * It is intentionally restrained.
   */

  const heroVisual =
    $(".hero-visual");

  if (
    heroVisual &&
    !reducedMotion &&
    !coarsePointer
  ) {

    heroVisual.addEventListener(
      "pointermove",
      (event) => {

        const rect =
          heroVisual.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
          rect.width;

        const y =
          (event.clientY - rect.top) /
          rect.height;

        const rotateX =
          (0.5 - y) * 2;

        const rotateY =
          (x - 0.5) * 2;

        heroVisual.style.transform =
          `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }
    );

    heroVisual.addEventListener(
      "pointerleave",
      () => {
        heroVisual.style.transform = "";
      }
    );
  }


  /*
   * ---------------------------------------------------------
   * PAGE LOAD
   * ---------------------------------------------------------
   *
   * Small class for any CSS intro effects.
   */

  requestAnimationFrame(() => {
    document.documentElement.classList.add("page-ready");
  });


  /*
   * ---------------------------------------------------------
   * DEBUG
   * ---------------------------------------------------------
   *
   * Remove this later if you want a completely silent console.
   */

  console.log(
    "%cSrijan Hospital",
    "font-size:18px;font-weight:700;color:#087f91;"
  );

  console.log(
    "Frontend interaction layer loaded successfully."
  );

})();