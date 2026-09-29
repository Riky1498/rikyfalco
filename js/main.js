(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CASI = window.CASI || [];
  var STORIE = window.STORIE || [];

  /* ---------------- WhatsApp: tutti i pulsanti ---------------- */
  function waLink() {
    var num = String(SITE.whatsapp || "").replace(/\D/g, "");
    var msg = encodeURIComponent(SITE.messaggio || "");
    return "https://wa.me/" + num + (msg ? "?text=" + msg : "");
  }
  document.querySelectorAll(".wa").forEach(function (a) {
    a.href = waLink();
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll(".js-zona").forEach(function (el) {
    if (SITE.zona) el.textContent = SITE.zona;
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- Casi di successo ---------------- */
  var icoUser = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  var casesEl = document.getElementById("cases");
  casesEl.innerHTML = CASI.map(function (c) {
    var media = c.foto
      ? '<img src="' + esc(c.foto) + '" alt="' + esc(c.nome) + '" loading="lazy">'
      : '<div class="case__ph"><div>' + icoUser + "Foto in arrivo</div></div>";
    return (
      '<article class="case reveal">' +
        '<div class="case__media">' + media +
          '<div class="case__result"><strong>' + esc(c.risultato) + "</strong><span>" + esc(c.durata) + "</span></div>" +
        "</div>" +
        '<div class="case__body">' +
          '<h3 class="case__name">' + esc(c.nome) + "</h3>" +
          '<p class="case__info">' + esc(c.info) + "</p>" +
          '<p class="case__row"><b>Prima</b>' + esc(c.prima) + "</p>" +
          '<p class="case__row"><b>Dopo</b>' + esc(c.dopo) + "</p>" +
          (c.citazione ? '<p class="case__quote">“' + esc(c.citazione) + "”</p>" : "") +
        "</div>" +
      "</article>"
    );
  }).join("");

  /* ---------------- Galleria storie (foto / video) ---------------- */
  var galleryEl = document.getElementById("gallery");
  var icoCam = '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>';
  var icoPlay = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>';

  if (!STORIE.length) {
    galleryEl.innerHTML = [1, 2, 3].map(function () {
      return '<div class="story story--empty reveal"><div class="story__media"><div>' + icoCam +
        "Nuova storia in arrivo</div></div></div>";
    }).join("");
  } else {
    galleryEl.innerHTML = STORIE.map(function (s, i) {
      var media;
      if (s.tipo === "video") {
        media = (s.copertina
          ? '<img src="' + esc(s.copertina) + '" alt="' + esc(s.nome) + '" loading="lazy">'
          : '<video src="' + esc(s.file) + '#t=0.5" muted playsinline preload="metadata"></video>') +
          '<button class="story__play" data-video="' + i + '" aria-label="Guarda la storia di ' + esc(s.nome) + '">' + icoPlay + "</button>";
      } else {
        media = '<img src="' + esc(s.file) + '" alt="' + esc(s.nome) + '" loading="lazy">';
      }
      return (
        '<article class="story reveal">' +
          '<div class="story__media">' + media + "</div>" +
          '<div class="story__body"><h3>' + esc(s.nome) + '</h3><p class="t">' + esc(s.titolo) + "</p><p>" + esc(s.storia) + "</p></div>" +
        "</article>"
      );
    }).join("");
  }

  var lb = document.getElementById("lightbox");
  var lbBody = document.getElementById("lightboxBody");
  function closeLb() { lb.hidden = true; lbBody.innerHTML = ""; }
  galleryEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-video]");
    if (!btn) return;
    var s = STORIE[+btn.getAttribute("data-video")];
    lbBody.innerHTML = '<video src="' + esc(s.file) + '" controls autoplay playsinline></video>';
    lb.hidden = false;
  });
  document.getElementById("lightboxClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  /* ---------------- Reveal on scroll ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* Video "chi sono": parte solo quando è visibile */
  var aboutVideo = document.querySelector(".about__video");
  if (aboutVideo) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { aboutVideo.play().catch(function () {}); } else { aboutVideo.pause(); }
      });
    }, { threshold: 0.3 }).observe(aboutVideo);
  }

  /* ---------------- Hero: video che avanza con lo scroll ---------------- */
  var FRAME_COUNT = 120;
  var section = document.getElementById("scrolly");
  var canvas = document.getElementById("scrollyCanvas");
  var ctx = canvas.getContext("2d");
  var bar = document.getElementById("scrollyBar");
  var loaderBar = document.querySelector("#scrollyLoader span");
  var panels = Array.prototype.slice.call(section.querySelectorAll(".scrolly__panel"));
  var nav = document.getElementById("nav");
  var fab = document.querySelector(".fab");

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var size = window.innerWidth * dpr > 1100 ? "lg" : "sm";
  var frames = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var current = 0;
  var target = 0;
  var lastDrawn = -1;
  var ready = false;

  function src(i) {
    var n = String(i + 1);
    while (n.length < 3) n = "0" + n;
    return "assets/frames/" + size + "/f" + n + ".webp";
  }

  // Ordine di caricamento: prima un frame ogni 8, poi ogni 4, poi tutti
  var order = [];
  [8, 4, 2, 1].forEach(function (step) {
    for (var i = 0; i < FRAME_COUNT; i += step) if (order.indexOf(i) === -1) order.push(i);
  });

  function loadNext(queue) {
    if (!queue.length) return;
    var i = queue.shift();
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      frames[i] = img;
      loadedCount++;
      loaderBar.style.transform = "scaleX(" + loadedCount / FRAME_COUNT + ")";
      if (i === 0 && !ready) { ready = true; section.classList.add("is-ready"); }
      if (Math.abs(i - Math.round(current)) < 8) lastDrawn = -1;
      loadNext(queue);
    };
    img.onerror = function () { loadedCount++; loadNext(queue); };
    img.src = src(i);
  }
  // 4 caricamenti in parallelo
  var q = order.slice();
  for (var k = 0; k < 4; k++) loadNext(q);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    lastDrawn = -1;
  }

  function nearestLoaded(i) {
    if (frames[i]) return frames[i];
    for (var d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  function draw(i) {
    var img = nearestLoaded(i);
    if (!img) return;
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var w = iw * scale, h = ih * scale;
    // su schermi verticali segue Riccardo nelle tre scene (accoglienza, consulenza, allenamento)
    var focusX = 0.5;
    if (cw < ch) focusX = i < 36 ? 0.5 : i < 72 ? 0.66 : 0.42;
    var x = (cw - w) * focusX, y = (ch - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  }

  function progress() {
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / total));
  }

  var activePanel = null;
  function onScroll() {
    var p = progress();
    target = p * (FRAME_COUNT - 1);
    bar.style.transform = "scaleX(" + p + ")";
    section.classList.toggle("is-scrolled", p > 0.02);

    var next = null;
    panels.forEach(function (el) {
      var from = parseFloat(el.getAttribute("data-from"));
      var to = parseFloat(el.getAttribute("data-to"));
      if (p >= from && p < to) next = el;
    });
    if (next !== activePanel) {
      panels.forEach(function (el) { el.classList.toggle("is-active", el === next); });
      section.setAttribute("data-side", next && next.classList.contains("scrolly__panel--right") ? "right" : "left");
      activePanel = next;
    }

    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    fab.classList.toggle("is-visible", window.scrollY > section.offsetHeight - window.innerHeight * 0.5);
  }

  function tick() {
    current += (target - current) * 0.18;
    if (Math.abs(target - current) < 0.01) current = target;
    var f = Math.round(current);
    if (f !== lastDrawn && ready) { draw(f); lastDrawn = f; }
    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { resize(); onScroll(); });
  resize();
  onScroll();
  requestAnimationFrame(tick);
})();
