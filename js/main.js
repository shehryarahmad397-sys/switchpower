/**
 * Switch Power Co: site interactions + i18n
 */
(function () {
  var WHATSAPP_NUMBER = "966501234567";
  var LANG_KEY = "sp-lang";
  var DEFAULT_LANG = "ar";

  function getLang() {
    var stored = localStorage.getItem(LANG_KEY);
    return stored === "en" || stored === "ar" ? stored : DEFAULT_LANG;
  }

  function getNested(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : undefined;
    }, obj);
  }

  function isRtl() {
    return document.documentElement.dir === "rtl";
  }

  function waLink(message) {
    var text = encodeURIComponent(message || "");
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  function bindWhatsAppLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      var msg = el.getAttribute("data-whatsapp-message") || "";
      el.setAttribute("href", waLink(msg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  function applyWhatsAppMessages(dict) {
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-wa");
      if (key) {
        var msg = getNested(dict, key);
        if (msg) el.setAttribute("data-whatsapp-message", msg);
      }
      var prodKey = el.getAttribute("data-i18n-wa-product");
      if (prodKey) {
        var name = getNested(dict, prodKey);
        var prefix = getNested(dict, "home.waProd");
        if (name && prefix) el.setAttribute("data-whatsapp-message", prefix + name + ".");
      }
    });
    bindWhatsAppLinks();
  }

  function applyLang(lang) {
    var dict = window.SP_I18N && window.SP_I18N[lang];
    if (!dict) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem(LANG_KEY, lang);

    var page = window.SP_PAGE || "home";
    var meta = getNested(dict, "meta." + page);
    if (meta) {
      if (meta.title) document.title = meta.title;
      var descEl = document.querySelector('meta[name="description"]');
      if (descEl && meta.description) descEl.setAttribute("content", meta.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && meta.title) ogTitle.setAttribute("content", meta.title);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && meta.description) ogDesc.setAttribute("content", meta.description);
    }

    var brandName = getNested(dict, "logo.name");
    if (brandName) {
      var ogSite = document.querySelector('meta[property="og:site_name"]');
      if (ogSite) ogSite.setAttribute("content", brandName);
    }

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var val = getNested(dict, el.getAttribute("data-i18n"));
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var val = getNested(dict, el.getAttribute("data-i18n-html"));
      if (val != null) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var val = getNested(dict, el.getAttribute("data-i18n-aria"));
      if (val != null) el.setAttribute("aria-label", val);
    });

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var slideWord = getNested(dict, "home.slide");
    if (slideWord) {
      document.querySelectorAll(".spotlight-dot").forEach(function (dot, i) {
        dot.setAttribute("aria-label", slideWord + " " + (i + 1));
      });
    }

    applyWhatsAppMessages(dict);
    window.dispatchEvent(new CustomEvent("sp:lang", { detail: { lang: lang } }));
  }

  function initLangSwitcher() {
    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang && lang !== getLang()) applyLang(lang);
      });
    });
  }

  applyLang(getLang());
  initLangSwitcher();

  var parts = window.location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  var last = parts[parts.length - 1];
  var path = !last || last.indexOf(".") === -1 ? "index.html" : last;

  document.querySelectorAll(".nav-desktop a, .nav-sidebar a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var base = href.split("#")[0];
    if (base === path || (path === "index.html" && base === "index.html")) {
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

      function stepForward() {
        go(idx + 1);
        start();
      }

      function stepBack() {
        go(idx - 1);
        start();
      }

      dots.forEach(function (d, j) {
        d.addEventListener("click", function () {
          if (j >= n) return;
          go(j);
          start();
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          stepBack();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          stepForward();
        });
      }

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
          var rtl = isRtl();
          if (rtl) {
            if (dx < -45) stepBack();
            else if (dx > 45) stepForward();
          } else {
            if (dx < -45) stepForward();
            else if (dx > 45) stepBack();
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
