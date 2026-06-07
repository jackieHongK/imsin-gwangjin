/* 공통 GNB 동작: 모바일 햄버거 + 드롭다운 토글 (데스크톱은 CSS hover) */
(function () {
  "use strict";
  var toggle = document.querySelector(".nav-toggle");
  var gnb = document.querySelector(".gnb");
  if (toggle && gnb) {
    toggle.addEventListener("click", function () { gnb.classList.toggle("open"); });
  }
  var groups = document.querySelectorAll(".gnb-group");
  groups.forEach(function (g) {
    var top = g.querySelector(".gnb-top");
    if (!top) return;
    top.addEventListener("click", function (e) {
      e.preventDefault();
      var willOpen = !g.classList.contains("open");
      groups.forEach(function (o) { if (o !== g) { o.classList.remove("open"); var t = o.querySelector(".gnb-top"); if (t) t.setAttribute("aria-expanded", "false"); } });
      g.classList.toggle("open", willOpen);
      top.setAttribute("aria-expanded", String(willOpen));
    });
  });
  // 메뉴 링크 클릭 시 모바일 메뉴 닫기
  document.querySelectorAll(".gnb-menu a").forEach(function (a) {
    a.addEventListener("click", function () { gnb && gnb.classList.remove("open"); groups.forEach(function (o) { o.classList.remove("open"); }); });
  });
  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".gnb-group")) {
      groups.forEach(function (o) { o.classList.remove("open"); var t = o.querySelector(".gnb-top"); if (t) t.setAttribute("aria-expanded", "false"); });
    }
  });
})();
