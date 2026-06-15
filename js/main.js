/**
 * Switch Power Co: site interactions
 * Set WHATSAPP_NUMBER to your full international number (no +), e.g. 966501234567
 */
(function () {
  var WHATSAPP_NUMBER = "966501234567";
  var WHATSAPP_DEFAULT_TEXT = "Hello Switch Power Co, I would like to inquire about your products.";

  function waLink(message) {
    var text = encodeURIComponent(message || WHATSAPP_DEFAULT_TEXT);
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    var msg = el.getAttribute("data-whatsapp-message");
    el.setAttribute("href", waLink(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  var parts = window.location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  var last = parts[parts.length - 1];
  var path = !last || last.indexOf(".") === -1 ? "index.html" : last;

  document.querySelectorAll(".nav-desktop a, .nav-sidebar a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    if (href === path || (path === "index.html" && href === "index.html")) {
      link.classList.add("is-active");
    }
  });

  var toggle = document.querySelector(".menu-toggle");
  var sidebar = document.querySelector(".nav-sidebar");
  var overlay = document.querySelector(".nav-overlay");

  function closeMenu() {
    if (!toggle || !sidebar || !overlay) return;
    toggle.setAttribute("aria-expanded", "false");
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!toggle || !sidebar || !overlay) return;
    toggle.setAttribute("aria-expanded", "true");
    sidebar.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  if (toggle && sidebar && overlay) {
    toggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    overlay.addEventListener("click", closeMenu);
    sidebar.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Spotlight carousel: pixel slide width so each slide fills the viewport */
  var spotRoot = document.getElementById("spotlight-carousel");
  if (spotRoot) {
    var track = spotRoot.querySelector(".spotlight-track");
    var dots = Array.prototype.slice.call(spotRoot.querySelectorAll(".spotlight-dot"));
    var prevBtn = spotRoot.querySelector(".spotlight-nav--prev");
    var nextBtn = spotRoot.querySelector(".spotlight-nav--next");
    var viewport = spotRoot.querySelector(".spotlight-viewport");
    var slides = track ? track.querySelectorAll(".spotlight-slide") : [];
    if (track && dots.length && viewport && slides.length) {
      var n = slides.length;
      var idx = 0;
      var ms = parseInt(spotRoot.getAttribute("data-spotlight-interval") || "5000", 10);
      if (ms < 2500) ms = 2500;
      var timer = null;

      /* clientWidth is integer and matches inner layout width (no viewport border). */
      function slideWidth() {
        var cw = viewport.clientWidth;
        if (cw > 0) return cw;
        return Math.max(0, Math.round(viewport.getBoundingClientRect().width));
      }

      function layoutSlides() {
        var w = slideWidth();
        if (w <= 0) return;
        var offset = Math.round(idx * w);
        slides.forEach(function (s) {
          s.style.flex = "0 0 " + w + "px";
          s.style.width = w + "px";
          s.style.minWidth = w + "px";
          s.style.maxWidth = w + "px";
        });
        track.style.width = w * n + "px";
        track.style.transform = "translate3d(" + -offset + "px,0,0)";
      }

      function renderDots() {
        dots.forEach(function (d, j) {
          if (j >= n) return;
          var on = j === idx;
          d.classList.toggle("is-active", on);
          d.setAttribute("aria-selected", on ? "true" : "false");
        });
      }

      function render() {
        layoutSlides();
        renderDots();
      }

      function go(to) {
        idx = (to + n) % n;
        render();
      }

      function start() {
        stop();
        timer = setInterval(function () {
          go(idx + 1);
        }, ms);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (d, j) {
        d.addEventListener("click", function () {
          if (j >= n) return;
          go(j);
          start();
        });
      });

      if (prevBtn) prevBtn.addEventListener("click", function () { go(idx - 1); start(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { go(idx + 1); start(); });

      spotRoot.addEventListener("mouseenter", stop);
      spotRoot.addEventListener("mouseleave", start);

      var sx = 0;
      viewport.addEventListener(
        "touchstart",
        function (e) {
          sx = e.changedTouches[0].screenX;
        },
        { passive: true }
      );
      viewport.addEventListener(
        "touchend",
        function (e) {
          var dx = e.changedTouches[0].screenX - sx;
          if (dx < -45) {
            go(idx + 1);
            start();
          } else if (dx > 45) {
            go(idx - 1);
            start();
          }
        },
        { passive: true }
      );

      var ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(function () {
          render();
        });
        ro.observe(viewport);
        ro.observe(spotRoot);
      } else {
        window.addEventListener("resize", function () {
          render();
        });
      }

      window.addEventListener(
        "orientationchange",
        function () {
          setTimeout(render, 250);
        },
        false
      );

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          render();
          start();
        });
      });
    }
  }
})();
