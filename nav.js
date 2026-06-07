/* 공통 GNB: 메뉴를 단일 소스로 생성·주입 + 단일 오픈 제어
   - '임신·출산 정보'는 3열 메가메뉴(시기별 가이드/건강·식이/지원·생활) + 하단 별도 메뉴(남편 역할·FAQ)
   - 하나 열리면 다른 하나는 닫힘(동시 오픈 방지). 데스크톱=hover, 모바일=클릭+햄버거 */
(function () {
  "use strict";
  var gnb = document.querySelector(".gnb");
  if (!gnb) return;

  // 현재 페이지가 index면 같은 페이지 앵커(#...), 아니면 index.html#...
  var f = location.pathname.split("/").pop();
  var P = (f === "" || f === "index.html") ? "" : "index.html";

  gnb.innerHTML =
    '<div class="gnb-group">' +
      '<button class="gnb-top" aria-expanded="false" aria-haspopup="true">임신·출산 정보 <span class="chev">▾</span></button>' +
      '<div class="gnb-menu mega">' +
        '<div class="mega-cols">' +
          '<div class="mcol"><span class="mlabel">🗓️ 시기별 가이드</span>' +
            '<a href="' + P + '#timeline">주차별 체크리스트</a>' +
            '<a href="' + P + '#caution">임산부 주의사항</a></div>' +
          '<div class="mcol"><span class="mlabel">🍽️ 건강·식이</span>' +
            '<a href="' + P + '#food">음식 (좋은·조심할)</a>' +
            '<a href="' + P + '#supplements">엽산·철분 복용</a>' +
            '<a href="' + P + '#meds">약품 주의</a>' +
            '<a href="' + P + '#nausea">입덧 대응</a>' +
            '<a href="' + P + '#exercise">운동</a>' +
            '<a href="' + P + '#husband-food">추천 음식·레시피</a></div>' +
          '<div class="mcol"><span class="mlabel">💰 지원·생활</span>' +
            '<a href="' + P + '#welfare">복지정책 (국가·서울·광진)</a>' +
            '<a href="gwangjin-daycare.html">어린이집 입소대기</a></div>' +
        '</div>' +
        '<div class="mega-foot">' +
          '<a href="' + P + '#partner">👨‍👩‍👧 남편 역할</a>' +
          '<a href="' + P + '#faq">❓ 자주 묻는 질문</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="gnb-group cmp">' +
      '<button class="gnb-top" aria-expanded="false" aria-haspopup="true">산후조리원 비교 <span class="chev">▾</span></button>' +
      '<div class="gnb-menu">' +
        '<a href="jorwon-national.html">🇰🇷 전국 산후조리원</a>' +
        '<a href="seoul-sanhujoriwon.html">서울 전체 목록</a>' +
        '<a href="seoul-compare.html">서울 구별 비교·후기</a>' +
      '</div>' +
    '</div>';

  var toggle = document.querySelector(".nav-toggle");
  if (toggle) toggle.addEventListener("click", function () { gnb.classList.toggle("open"); });

  var groups = [].slice.call(gnb.querySelectorAll(".gnb-group"));
  function setOpen(g, on) {
    g.classList.toggle("open", on);
    var t = g.querySelector(".gnb-top");
    if (t) t.setAttribute("aria-expanded", String(on));
  }
  function openOnly(g) { groups.forEach(function (o) { setOpen(o, o === g); }); }  // 단일 오픈 보장
  function closeAll() { groups.forEach(function (o) { setOpen(o, false); }); }

  var hoverable = !window.matchMedia || window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  groups.forEach(function (g) {
    var top = g.querySelector(".gnb-top");
    top.addEventListener("click", function (e) {
      e.preventDefault();
      g.classList.contains("open") ? setOpen(g, false) : openOnly(g);
    });
    if (hoverable) {
      g.addEventListener("mouseenter", function () { openOnly(g); });
      g.addEventListener("mouseleave", function () { setOpen(g, false); });
    }
  });

  // 메뉴 항목 클릭 시 닫기(모바일)
  gnb.querySelectorAll(".gnb-menu a").forEach(function (a) {
    a.addEventListener("click", function () { gnb.classList.remove("open"); closeAll(); });
  });
  // 바깥 클릭 시 닫기
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".gnb-group") && !e.target.closest(".nav-toggle")) closeAll();
  });
})();
