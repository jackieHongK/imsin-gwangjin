/* =========================================================
   임신 가이드 — script.js
   탭 전환 · 모바일 내비게이션
   (지도는 네이버 지도 주소 하이퍼링크로 연동 — 별도 SDK/키 불필요)
   ========================================================= */

/* ---------- 탭 전환 ---------- */
function initTabs() {
  document.querySelectorAll(".tabs").forEach((group) => {
    const buttons = group.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        // 같은 그룹 내 버튼만 제어
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // 이 탭 그룹이 제어하는 패널만 토글
        const scope = group.closest(".wrap") || document;
        scope.querySelectorAll(".tab-panel").forEach((panel) => {
          if (panel.id === targetId) {
            panel.classList.add("active");
          } else if (isControlledBy(panel.id, buttons)) {
            panel.classList.remove("active");
          }
        });
      });
    });
  });
}

function isControlledBy(panelId, buttons) {
  return Array.from(buttons).some((b) => b.dataset.tab === panelId);
}

/* ---------- 모바일 내비게이션 ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initNav();
});
