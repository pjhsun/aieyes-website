/* =====================================================================
 *  AIEYES 홈페이지 - 메인 인터랙션 스크립트
 *  - config.js 의 AIEYES_CONFIG 값을 화면에 렌더
 *  - GNB / 페이드인 / 발광카드 / 모달 / 챗봇 / 히어로 네트워크 등
 * ===================================================================== */
(function () {
  "use strict";

  var CFG = window.AIEYES_CONFIG || {};
  var C = CFG.company || {};
  var P = CFG.primary || {};
  var CONTACTS = CFG.contacts || [];

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  function telHref(phone) { return "tel:" + String(phone || "").replace(/[^\d+]/g, ""); }

  /* ---------------------------------------------------------------
   * 1) Config → DOM 렌더 (연락처/회사정보 동적 출력)
   * ------------------------------------------------------------- */
  function renderConfig() {
    setText(".js-company-name", C.nameKo);
    setText(".js-address", C.address);
    setText(".js-hours", C.businessHours);

    $$(".js-email").forEach(function (el) {
      el.textContent = P.email || "";
      el.setAttribute("href", "mailto:" + (P.email || ""));
    });
    $$(".js-phone-link").forEach(function (el) {
      el.textContent = P.phone || "";
      el.setAttribute("href", telHref(P.phone));
    });
    // 대표 문의메일 (help@) — 폼 발송 대상과 동일
    $$(".js-help-email").forEach(function (el) {
      var he = C.helpEmail || (CFG.inquiryMail && CFG.inquiryMail.to) || "";
      el.textContent = he;
      el.setAttribute("href", "mailto:" + he);
    });
    // 대표 유선번호 (설치 전이면 링크 비활성)
    $$(".js-landline").forEach(function (el) {
      el.textContent = C.landline || "";
      if (C.landlineActive && el.tagName === "A") el.setAttribute("href", telHref(C.landline));
    });
    $$(".js-website").forEach(function (el) {
      el.textContent = C.website || "";
      el.setAttribute("href", C.websiteUrl || "#");
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
    // 지도(길찾기) 링크 — 주소 기반 네이버 지도 검색
    var mapUrl = "https://map.naver.com/p/search/" + encodeURIComponent(C.address || "가산디지털단지역 6번출구");
    $$(".js-map-link").forEach(function (el) {
      el.setAttribute("href", mapUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    // 문서 타이틀/설명 보정
    if (C.nameKo) {
      document.title = C.nameKo + " " + (C.nameEn || "") + " — AI · 빅데이터 · 로봇 자동화 전문기업";
    }

    // 모달: 대표 연락 채널 카드 렌더
    var wrap = $("#contactChannels");
    if (wrap) {
      var html = "";
      // 대표 문의메일 (help@) — 최상단
      var helpEmail = C.helpEmail || (CFG.inquiryMail && CFG.inquiryMail.to);
      if (helpEmail) {
        html +=
          '<a class="contact-channel" href="mailto:' + esc(helpEmail) + '">' +
            '<span class="cc-ico">' + icoMail() + "</span>" +
            "<span>" +
              '<span class="cc-label">대표 문의메일</span><br>' +
              '<span class="cc-value">' + esc(helpEmail) + "</span>" +
            "</span>" +
          "</a>";
      }
      // 대표 연락처(현재 박재형 휴대폰) — landlineActive면 클릭 시 전화
      if (C.landline) {
        var llLabel = C.landlineLabel || "대표 유선번호";
        if (C.landlineActive) {
          html +=
            '<a class="contact-channel" href="' + telHref(C.landline) + '">' +
              '<span class="cc-ico">' + icoPhone() + "</span>" +
              "<span>" +
                '<span class="cc-label">' + esc(llLabel) + "</span><br>" +
                '<span class="cc-value">' + esc(C.landline) + "</span>" +
              "</span>" +
            "</a>";
        } else {
          html +=
            '<div class="contact-channel">' +
              '<span class="cc-ico">' + icoPhone() + "</span>" +
              "<span>" +
                '<span class="cc-label">' + esc(llLabel) + "</span><br>" +
                '<span class="cc-value">' + esc(C.landline) + "</span>" +
              "</span>" +
            "</div>";
        }
      }
      // (담당자 개인 연락처 카드는 팝업에서 표시하지 않음 — 대표 채널만 노출)
      wrap.innerHTML = html;
    }
  }

  function setText(sel, val) {
    $$(sel).forEach(function (el) { if (val) el.textContent = val; });
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function icoPhone() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>';
  }
  function icoMail() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>';
  }

  /* ---------------------------------------------------------------
   * 2) GNB 스크롤 상태 + 모바일 드로어
   * ------------------------------------------------------------- */
  function initNav() {
    var gnb = $("#gnb");
    var toggle = $("#menuToggle");
    var drawer = $("#mobileDrawer");

    window.addEventListener("scroll", function () {
      gnb.classList.toggle("scrolled", window.scrollY > 24);
      var tt = $("#toTop");
      if (tt) tt.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });

    if (toggle && drawer) {
      toggle.addEventListener("click", function () {
        var open = drawer.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$("a, .btn", drawer).forEach(function (el) {
        el.addEventListener("click", function () {
          drawer.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var tt = $("#toTop");
    if (tt) tt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------------
   * 3) 스크롤 페이드인 (IntersectionObserver)
   * ------------------------------------------------------------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------
   * 4) 발광 카드 - 마우스 좌표 추적 (--x / --y)
   * ------------------------------------------------------------- */
  function initGlowCards() {
    $$(".glow-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--x", (e.clientX - r.left) + "px");
        card.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------------------------------------------------------------
   * 5) 문의 모달 + 전화 버튼
   * ------------------------------------------------------------- */
  function initModal() {
    var modal = $("#contactModal");
    if (!modal) return;
    var closeBtn = $("#closeModal");
    var form = $("#contactForm");
    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      var first = $(".form-control", modal);
      if (first) setTimeout(function () { first.focus(); }, 250);
    }
    function close() {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    $$(".js-open-contact").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) close();
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var name = ($("#cName") || {}).value || "";
        var manager = ($("#cManager") || {}).value || "";
        var email = ($("#cEmail") || {}).value || "";
        var phone = ($("#cPhone") || {}).value || "";
        var msg = ($("#cMsg") || {}).value || "";

        // 발송 대상: help@ (참조: 김명건·박재형)
        var MAIL = CFG.inquiryMail || {};
        var to = MAIL.to || (P.email || "");
        var cc = (MAIL.cc || []).join(",");
        var subject = (MAIL.subjectPrefix || "[AIEYES 문의]") + (name ? " - " + name : "");
        var body = [
          "▣ 제품 및 솔루션 문의",
          "",
          "· 기업/기관명 : " + name,
          "· 담당자      : " + manager,
          "· 이메일      : " + email,
          "· 연락처      : " + phone,
          "",
          "· 문의 내용 :",
          msg,
          "",
          "───────────────",
          "본 메일은 AIEYES 홈페이지 문의 폼에서 작성되었습니다.",
        ].join("\n");

        var href = "mailto:" + to +
          "?cc=" + cc +
          "&subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        window.location.href = href;

        alert(
          "메일 작성 창이 열립니다.\n" +
          "받는사람: " + to + "\n참조: " + cc + "\n\n" +
          "내용 확인 후 [보내기]를 눌러주세요.\n(추후 MS365 연동 시 자동 발송으로 전환 가능합니다.)"
        );
        form.reset();
        close();
      });
    }

    // 전화 상담 버튼
    $$(".js-phone").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = telHref(P.phone);
      });
    });
  }

  /* ---------------------------------------------------------------
   * 6) 에코시스템 무한 롤링용 트랙 복제
   * ------------------------------------------------------------- */
  function initMarquee() {
    var track = $("#marqueeTrack");
    if (!track) return;
    track.innerHTML += track.innerHTML; // 2배 복제 → -50% 이동 시 seamless
  }

  /* ---------------------------------------------------------------
   * 7) 히어로 배경 - AI 네트워크 캔버스 애니메이션
   *    (Spline 로봇이 로드되지 않아도 비주얼이 비지 않도록)
   * ------------------------------------------------------------- */
  function initHeroNet() {
    var canvas = $("#heroNet");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var raf, w, h, dpr;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(18, Math.round((w * h) / 12000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.strokeStyle = "rgba(47,123,255," + (0.16 * (1 - dist / 110)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,190,255,0.75)";
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduce) { frame(); cancelAnimationFrame(raf); } // 1프레임만
    else frame();
  }

  /* ---------------------------------------------------------------
   * 8) AI 챗봇 (시뮬레이션 응답 + 파티클 배경)
   * ------------------------------------------------------------- */
  function initChatbot() {
    var fab = $("#chatFab");
    var panel = $("#chatPanel");
    var body = $("#chatBody");
    var input = $("#chatInput");
    var send = $("#chatSend");
    var quick = $("#chatQuick");
    if (!fab || !panel || !body) return;

    var greeted = false;
    var label = $("#chatFabLabel");

    function toggle() {
      var open = panel.classList.toggle("open");
      fab.classList.toggle("open", open);
      if (label) label.classList.add("hide"); // 한 번 열면 안내 라벨 숨김
      if (open && !greeted) {
        greeted = true;
        botSay("안녕하세요! 👋 AIEYES AI 상담 봇입니다.\n솔루션·성능·연락처 등 궁금하신 점을 물어보세요.");
        startParticles();
      }
      if (open) setTimeout(function () { input && input.focus(); }, 200);
    }

    function addMsg(text, who) {
      var el = document.createElement("div");
      el.className = "msg " + who;
      el.innerHTML = String(text).replace(/\n/g, "<br>");
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }
    function botSay(text) { addMsg(text, "ai"); }

    function botTyping() {
      var t = document.createElement("div");
      t.className = "chat-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(t);
      body.scrollTop = body.scrollHeight;
      return t;
    }

    // 간단 규칙 기반 응답
    function answer(q) {
      var s = q.toLowerCase();
      if (/sqream|성능|속도|쿼리|dbms/.test(s))
        return "SQREAM GPU 기반 빅데이터 솔루션은 원본 대비 <b>데이터 90%↑ 압축</b>, <b>쿼리 최대 100x</b>, <b>처리량 20x</b>를 제공합니다. 표준 ANSI SQL을 지원해 도입 부담이 적습니다.";
      if (/로봇|amr|자동화|휴머노이드|사족/.test(s))
        return "AMR·사족보행 로봇·휴머노이드를 통합 관제하고, 정밀 비전 AI 검사와 무인 적재·이송 자동화를 제공합니다. 공정 현황을 알려주시면 맞춤 구성을 제안드려요.";
      if (/플랫폼|ontology|온톨로지|agent|에이전트|ae/.test(s))
        return "AE 플랫폼은 Data Fabric · AI Ontology · AI Agent를 결합한 기업 맞춤형 지식공유·AX 플랫폼입니다.";
      if (/정부|과제|컨소시엄|지원|r&d|국책/.test(s))
        return "중기부·산자부·과기부 국책 과제 기획부터 최적 컨소시엄 구성까지 지원합니다. 관심 분야를 알려주세요.";
      if (/연락처|전화|이메일|상담|문의|contact/.test(s))
        return "대표 연락처는 <b>" + esc(P.phone) + "</b> · <b>" + esc(P.email) +
          "</b> 입니다.<br>바로 <a href='#' class='js-open-contact-inline'>문의하기 폼</a>을 열어드릴까요?";
      if (/솔루션|서비스|뭐|무엇|소개|어떤/.test(s))
        return "AIEYES는 ① GPU 빅데이터(SQREAM) ② AI 플랫폼(AE) ③ 로봇 무인 자동화 ④ 정부사업 컨소시엄, 4대 솔루션을 제공합니다. 어떤 영역이 궁금하세요?";
      if (/안녕|hi|hello|하이/.test(s))
        return "반갑습니다! 무엇을 도와드릴까요? 솔루션·성능·연락처 중에서 물어보셔도 좋아요.";
      return "문의 감사합니다. 자세한 상담은 <b>" + esc(P.email) +
        "</b> 또는 문의하기 폼으로 연결해드릴게요. 담당 아키텍트가 신속히 회신드립니다.";
    }

    function handle(q) {
      q = (q || "").trim();
      if (!q) return;
      addMsg(esc(q), "user");
      if (input) input.value = "";
      var typing = botTyping();
      setTimeout(function () {
        typing.remove();
        botSay(answer(q));
        // 챗봇 응답 내 인라인 '문의하기' 링크 연결
        $$(".js-open-contact-inline", body).forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var t = $$(".js-open-contact")[0];
            if (t) t.click();
          });
        });
      }, 800 + Math.random() * 500);
    }

    fab.addEventListener("click", toggle);
    if (send) send.addEventListener("click", function () { handle(input.value); });
    if (input) input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handle(input.value);
    });
    if (quick) $$("button", quick).forEach(function (b) {
      b.addEventListener("click", function () { handle(b.getAttribute("data-q")); });
    });

    // 파티클 배경
    function startParticles() {
      var canvas = $("#chatCanvas");
      if (!canvas || canvas._on) return;
      canvas._on = true;
      var ctx = canvas.getContext("2d");
      var parts = [], w, h;
      function rs() {
        w = canvas.width = panel.clientWidth;
        h = canvas.height = panel.clientHeight;
      }
      rs();
      for (var i = 0; i < 26; i++) {
        parts.push({ x: Math.random() * w, y: Math.random() * h, s: Math.random() * 1.5 + 0.5, v: Math.random() * 0.4 + 0.15 });
      }
      (function loop() {
        ctx.clearRect(0, 0, w, h);
        parts.forEach(function (p) {
          p.y -= p.v;
          if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(47,123,255,0.22)";
          ctx.fill();
        });
        if (panel.classList.contains("open")) requestAnimationFrame(loop);
        else canvas._on = false;
      })();
      window.addEventListener("resize", rs);
    }
  }

  /* ---------------------------------------------------------------
   * 8-b) 솔루션 카드 → 세부 소개 모달
   * ------------------------------------------------------------- */
  function initSolutionDetail() {
    var modal = $("#solutionModal");
    if (!modal || !window.AIEYES_SOLUTIONS) return;
    var SOL = window.AIEYES_SOLUTIONS;
    var order = ["sqream", "ae-platform", "robot", "gov"];
    var body = $("#solBody");
    var lastFocused = null;

    function renderBody(d) {
      var h = "";
      if (d.desc) h += '<p class="sol-desc">' + esc(d.desc) + "</p>";
      if (d.metrics && d.metrics.length) {
        h += '<div class="sol-metrics">';
        d.metrics.forEach(function (m) {
          h += '<div class="sol-metric"><div class="sm-n">' + esc(m.n) + '</div><div class="sm-l">' + esc(m.l) + "</div></div>";
        });
        h += "</div>";
      }
      if (d.chips && d.chips.length) {
        h += '<div class="sol-chips">';
        d.chips.forEach(function (c) { h += '<span class="sol-chip">' + esc(c) + "</span>"; });
        h += "</div>";
      }
      if (d.quote) h += '<div class="sol-quote">“' + esc(d.quote) + "”</div>";
      if (d.lists && d.lists.length) {
        h += '<div class="sol-lists">';
        d.lists.forEach(function (l) {
          h += '<div class="sol-list"><h5>' + esc(l.h) + "</h5><ul>";
          (l.items || []).forEach(function (it) { h += "<li>" + esc(it) + "</li>"; });
          h += "</ul></div>";
        });
        h += "</div>";
      }
      if (d.references) {
        h += '<div class="sol-refs"><div class="sr-label">REFERENCES</div><div class="sr-body">' + esc(d.references) + "</div></div>";
      }
      if (d.images && d.images.length) {
        h += '<div class="sol-figures">';
        d.images.forEach(function (im) {
          h += '<figure class="sol-figure' + (im.wide ? "" : " narrow") + '" data-full="' + esc(im.src) + '" data-cap="' + esc(im.cap || "") + '">' +
               '<span class="zoom-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg> 크게 보기</span>' +
               '<img src="' + esc(im.src) + '" alt="' + esc(im.cap || "") + '" loading="lazy">' +
               (im.cap ? "<figcaption>" + esc(im.cap) + "</figcaption>" : "") +
               "</figure>";
        });
        h += "</div>";
      }
      return h;
    }

    function openSol(key) {
      var d = SOL[key];
      if (!d) return;
      $("#solTag").textContent = d.tag || "";
      $("#solTitle").textContent = d.title || "";
      $("#solSubtitle").textContent = d.subtitle || "";
      body.innerHTML = renderBody(d);
      // 다이어그램 클릭 → 라이트박스 확대
      $$(".sol-figure", body).forEach(function (fig) {
        fig.addEventListener("click", function () {
          openLightbox(fig.getAttribute("data-full"), fig.getAttribute("data-cap"));
        });
      });
      lastFocused = document.activeElement;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      var card = modal.querySelector(".modal-card");
      if (card) card.scrollTop = 0;
    }
    function closeSol() {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // 4개 솔루션 카드에 클릭/키보드/‘자세히 보기’ 부여 (DOM 순서 = order)
    $$(".glow-card").forEach(function (card, i) {
      var key = card.getAttribute("data-sol") || order[i];
      if (!SOL[key]) return;
      card.classList.add("clickable");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", (SOL[key].title || "솔루션") + " 상세 보기");
      var more = document.createElement("div");
      more.className = "card-more";
      more.innerHTML = '자세히 보기 <span aria-hidden="true">→</span>';
      card.appendChild(more);
      card.addEventListener("click", function () { openSol(key); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSol(key); }
      });
    });

    var xBtn = $("#closeSolModal"), cBtn = $("#solCloseBtn");
    if (xBtn) xBtn.addEventListener("click", closeSol);
    if (cBtn) cBtn.addEventListener("click", closeSol);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeSol(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("active")) closeSol();
    });
    // ‘이 솔루션 문의하기’: 상세 모달만 닫고 문의 모달은 기존 핸들러가 오픈
    var scb = $("#solContactBtn");
    if (scb) scb.addEventListener("click", function () { modal.classList.remove("active"); });
  }

  /* ---------------------------------------------------------------
   * 8-c) 이미지 라이트박스(확대 보기)
   * ------------------------------------------------------------- */
  function openLightbox(src, cap) {
    var lb = $("#lightbox");
    if (!lb || !src) return;
    $("#lbImg").setAttribute("src", src);
    $("#lbImg").setAttribute("alt", cap || "");
    $("#lbCap").textContent = cap || "";
    lb.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function initLightbox() {
    var lb = $("#lightbox");
    if (!lb) return;
    function close() {
      lb.classList.remove("active");
      // 솔루션 모달이 아직 열려 있으면 스크롤 잠금 유지
      if (!document.querySelector(".modal.active")) document.body.style.overflow = "";
    }
    $("#lbClose").addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.id === "lbImg") close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("active")) close();
    });
  }

  /* ---------------------------------------------------------------
   * 부팅
   * ------------------------------------------------------------- */
  function boot() {
    renderConfig();
    initNav();
    initReveal();
    initGlowCards();
    initModal();
    initSolutionDetail();
    initLightbox();
    initMarquee();
    initHeroNet();
    initChatbot();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
