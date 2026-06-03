/* =========================================================
   자체 트래픽 분석 트래커 (GA 아님 · 외부 전송 없음 · 쿠키 없음)
   - 같은 도메인의 수집 서버(analytics_server.py)로만 데이터 전송
   - 수집 서버가 없으면 조용히 무시(정적 호스팅에서도 사이트는 정상)
   - Do Not Track 존중, 개인정보(원본 IP 등) 미수집
   ========================================================= */
(function () {
  "use strict";

  // 수집 엔드포인트(같은 출처). 별도 도메인 사용 시 절대주소로 교체.
  var ENDPOINT = "/collect";

  // Do Not Track 이면 추적 안 함
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  /* ---- 익명 방문자/세션 ID (쿠키 없이 스토리지) ---- */
  function uid() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return "x" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  var visitorId;
  try {
    visitorId = localStorage.getItem("_ag_vid");
    if (!visitorId) { visitorId = uid(); localStorage.setItem("_ag_vid", visitorId); }
  } catch (e) { visitorId = uid(); }

  var sessionId;
  try {
    sessionId = sessionStorage.getItem("_ag_sid");
    if (!sessionId) { sessionId = uid(); sessionStorage.setItem("_ag_sid", sessionId); }
  } catch (e) { sessionId = uid(); }

  /* ---- 기기/유입 분류 ---- */
  function deviceType() {
    var ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPod/i.test(ua) && !/iPad|Tablet/i.test(ua)) return "mobile";
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
    return "desktop";
  }
  function browserName() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return "Edge";
    if (/SamsungBrowser/.test(ua)) return "Samsung";
    if (/Whale/.test(ua)) return "Whale";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Safari\//.test(ua)) return "Safari";
    return "기타";
  }

  // 유입 소스 + 검색 키워드 분류 (광진구 트래픽 추적 핵심)
  function classifyReferral() {
    var qs = new URLSearchParams(location.search);
    var utmSource = qs.get("utm_source");
    var utmMedium = qs.get("utm_medium");
    var utmCampaign = qs.get("utm_campaign");
    var utmTerm = qs.get("utm_term");

    var ref = document.referrer || "";
    var refHost = "";
    try { refHost = ref ? new URL(ref).hostname : ""; } catch (e) {}

    var source = "direct", medium = "none", keyword = utmTerm || "";

    if (utmSource) {
      source = utmSource; medium = utmMedium || "campaign";
    } else if (refHost) {
      var engines = [
        { h: "naver.", n: "네이버", q: ["query", "q"] },
        { h: "google.", n: "구글", q: ["q"] },
        { h: "daum.", n: "다음", q: ["q"] },
        { h: "bing.", n: "빙", q: ["q"] },
        { h: "search.naver", n: "네이버", q: ["query"] }
      ];
      var hit = engines.find(function (e) { return refHost.indexOf(e.h) !== -1; });
      if (hit) {
        source = hit.n; medium = "organic";
        try {
          var rq = new URL(ref).searchParams;
          for (var i = 0; i < hit.q.length; i++) {
            if (rq.get(hit.q[i])) { keyword = rq.get(hit.q[i]); break; }
          }
        } catch (e) {}
      } else if (/(instagram|facebook|youtube|tiktok|t\.co|twitter|x\.com|threads|cafe\.naver|band\.us|kakao)/.test(refHost)) {
        source = refHost.replace(/^www\./, ""); medium = "social";
      } else if (refHost.indexOf(location.hostname) === -1) {
        source = refHost.replace(/^www\./, ""); medium = "referral";
      } else {
        return null; // 내부 이동은 유입으로 보지 않음
      }
    }
    return { source: source, medium: medium, keyword: keyword,
             utm_campaign: utmCampaign || "", referrer_host: refHost };
  }

  var startTime = Date.now();
  var maxScroll = 0;

  /* ---- 전송 ---- */
  function send(payload) {
    payload.vid = visitorId;
    payload.sid = sessionId;
    payload.path = location.pathname + location.hash;
    payload.ts = new Date().toISOString();
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      } else {
        fetch(ENDPOINT, { method: "POST", body: body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(function () {});
      }
    } catch (e) {}
  }

  /* ---- 페이지뷰 ---- */
  var ref = classifyReferral();
  send({
    type: "pageview",
    title: document.title,
    referrer: document.referrer || "",
    source: ref ? ref.source : "internal",
    medium: ref ? ref.medium : "internal",
    keyword: ref ? ref.keyword : "",
    utm_campaign: ref ? ref.utm_campaign : "",
    device: deviceType(),
    browser: browserName(),
    screen: screen.width + "x" + screen.height,
    lang: navigator.language || ""
  });

  /* ---- 스크롤 깊이 ---- */
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
  function onScroll() {
    var h = document.documentElement;
    var pct = Math.min(100, Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100));
    if (pct > maxScroll) maxScroll = pct;
    [25, 50, 75, 100].forEach(function (m) {
      if (pct >= m && !scrollMarks[m]) { scrollMarks[m] = true; send({ type: "scroll", depth: m }); }
    });
  }
  window.addEventListener("scroll", throttle(onScroll, 400), { passive: true });

  /* ---- 섹션 노출(어떤 콘텐츠가 실제로 읽히는지) ---- */
  if ("IntersectionObserver" in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.target.id && !seen[en.target.id]) {
          seen[en.target.id] = true;
          send({ type: "section_view", section: en.target.id });
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("section.block[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---- 아웃바운드/전환 클릭 (산후조리원·복지·레시피·전화) ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var kind = null, label = (a.textContent || "").trim().slice(0, 40);
    if (href.indexOf("10000recipe.com") !== -1) kind = "recipe";
    else if (href.indexOf("map.naver.com") !== -1) kind = "map";
    else if (href.indexOf("tel:") === 0) kind = "phone";
    else if (/^https?:/.test(href) && href.indexOf(location.hostname) === -1) kind = "outbound";
    if (kind) send({ type: "click", kind: kind, label: label, href: href });
  }, true);

  /* ---- 체류시간(이탈 시) ---- */
  function sendEngagement() {
    send({ type: "engagement", duration: Math.round((Date.now() - startTime) / 1000), max_scroll: maxScroll });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sendEngagement();
  });
  window.addEventListener("pagehide", sendEngagement);

  function throttle(fn, wait) {
    var last = 0, t;
    return function () {
      var now = Date.now();
      if (now - last >= wait) { last = now; fn(); }
      else { clearTimeout(t); t = setTimeout(function () { last = Date.now(); fn(); }, wait); }
    };
  }
})();
