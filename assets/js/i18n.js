/* =====================================================================
 *  AIEYES — 다국어(국문/영문) 토글 엔진
 *  - 기본: 한국어. 우측 상단 버튼으로 EN 전환 (localStorage 저장)
 *  - 정적 텍스트: 요소에 data-en / data-en-html / data-en-ph 속성만 달면 자동 전환
 *      · data-en       : textContent 교체
 *      · data-en-html  : innerHTML 교체 (<br>, <span> 등 포함 문구)
 *      · data-en-ph    : placeholder 교체
 *  - 동적 콘텐츠(솔루션 모달·챗봇): window.AIEYES_LANG 참조 + 'aieyes:langchange' 이벤트
 * ===================================================================== */
(function () {
  "use strict";
  var KEY = "aieyes_lang";
  function getLang() { try { return localStorage.getItem(KEY) || "ko"; } catch (e) { return "ko"; } }
  function store(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  window.AIEYES_LANG = getLang();
  // JS에서 국/영문 값을 고를 때 쓰는 헬퍼
  window.t = function (ko, en) { return (window.AIEYES_LANG === "en" && en != null) ? en : ko; };

  function apply(lang) {
    window.AIEYES_LANG = lang;
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "ko");

    var els = document.querySelectorAll("[data-en]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__ko === undefined) el.__ko = el.textContent;
      el.textContent = (lang === "en") ? (el.getAttribute("data-en") || el.__ko) : el.__ko;
    }
    var elsH = document.querySelectorAll("[data-en-html]");
    for (var j = 0; j < elsH.length; j++) {
      var e2 = elsH[j];
      if (e2.__koHtml === undefined) e2.__koHtml = e2.innerHTML;
      e2.innerHTML = (lang === "en") ? (e2.getAttribute("data-en-html") || e2.__koHtml) : e2.__koHtml;
    }
    var elsP = document.querySelectorAll("[data-en-ph]");
    for (var k = 0; k < elsP.length; k++) {
      var e3 = elsP[k];
      if (e3.__koPh === undefined) e3.__koPh = e3.getAttribute("placeholder") || "";
      e3.setAttribute("placeholder", (lang === "en") ? (e3.getAttribute("data-en-ph") || e3.__koPh) : e3.__koPh);
    }

    updateToggle(lang);
    document.dispatchEvent(new CustomEvent("aieyes:langchange", { detail: { lang: lang } }));
  }

  function updateToggle(lang) {
    var b = document.getElementById("langToggle");
    if (b) {
      b.textContent = (lang === "ko") ? "EN" : "한";
      b.setAttribute("aria-label", (lang === "ko") ? "Switch to English" : "한국어로 전환");
      b.setAttribute("title", (lang === "ko") ? "English" : "한국어");
    }
  }

  function setLang(l) { store(l); apply(l); }
  window.AIEYES_I18N = { get: getLang, set: setLang, apply: function () { apply(getLang()); } };

  function boot() {
    var btn = document.getElementById("langToggle");
    if (btn) btn.addEventListener("click", function () { setLang(getLang() === "ko" ? "en" : "ko"); });
    apply(getLang());
  }
  // main.js(동적 렌더) 이후에 한 번 더 적용되도록 살짝 지연 + 즉시 1회
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  // 동적으로 추가되는 요소(모달 채널 등) 반영 위해 짧게 재적용
  setTimeout(function () { apply(getLang()); }, 300);
})();
