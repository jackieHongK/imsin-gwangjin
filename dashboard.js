/* 대시보드 렌더러 — /api/stats 를 불러와 SVG/막대로 표시 (외부 라이브러리 없음) */
(function () {
  "use strict";
  var days = 30;

  function el(id) { return document.getElementById(id); }

  function fetchStats() {
    fetch("/api/stats?days=" + days, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        el("summary").innerHTML =
          '<div class="stat"><div class="label">수집 서버 미동작</div>' +
          '<div class="num" style="font-size:1rem">analytics_server.py 를 실행하세요</div></div>';
      });
  }

  function render(d) {
    var s = d.summary;
    el("summary").innerHTML = [
      card("페이지뷰", s.pageviews),
      card("방문자(고유)", s.visitors, true),
      card("세션", s.sessions, true),
      card("평균 체류", s.avg_seconds + "초"),
      card("평균 스크롤", s.avg_scroll + "%"),
      card("전환 클릭", s.total_clicks)
    ].join("");

    drawTimeline(d.timeline);
    bars("local_keywords", d.local_keywords, "gold");
    bars("sources", d.sources, "sage");
    bars("mediums", d.mediums, "sage");
    bars("keywords", d.keywords);
    bars("top_pages", d.top_pages);
    bars("sections", d.sections, "sage");
    bars("devices", d.devices, "sage");
    bars("browsers", d.browsers, "sage");
    bars("clicks_by_kind", d.clicks_by_kind);
    bars("top_clicks", d.top_clicks);

    el("updated").textContent = "갱신: " + new Date().toLocaleString("ko-KR");
  }

  function card(label, num, sage) {
    return '<div class="stat"><div class="label">' + label + '</div><div class="num' +
      (sage ? " sage" : "") + '">' + num + "</div></div>";
  }

  function bars(id, list, color) {
    var box = el(id);
    if (!list || !list.length) { box.innerHTML = '<div class="empty">데이터 없음</div>'; return; }
    var max = Math.max.apply(null, list.map(function (x) { return x.count; })) || 1;
    box.innerHTML = list.map(function (x) {
      var pct = Math.round((x.count / max) * 100);
      return '<div class="bar-row"><span class="name" title="' + esc(x.name) + '">' + esc(x.name) +
        '</span><span class="track"><span class="fill ' + (color || "") + '" style="width:' + pct +
        '%"></span></span><span class="val">' + x.count + "</span></div>";
    }).join("");
  }

  function drawTimeline(tl) {
    var svg = el("timeline");
    if (!tl || !tl.length) { svg.innerHTML = '<text x="20" y="90" fill="#999">데이터 없음</text>'; return; }
    var W = 1000, H = 170, pad = 24, n = tl.length;
    var maxV = Math.max.apply(null, tl.map(function (t) { return t.views; })) || 1;
    var bw = (W - pad * 2) / n;
    var parts = [];
    // 격자
    for (var g = 0; g <= 4; g++) {
      var gy = pad + ((H - pad * 2) * g / 4);
      parts.push('<line x1="' + pad + '" y1="' + gy + '" x2="' + (W - pad) + '" y2="' + gy +
        '" stroke="#eee" stroke-width="1"/>');
    }
    function y(v) { return H - pad - (v / maxV) * (H - pad * 2); }
    // 페이지뷰 막대
    tl.forEach(function (t, i) {
      var x = pad + i * bw, bh = (t.views / maxV) * (H - pad * 2);
      parts.push('<rect x="' + (x + bw * 0.2) + '" y="' + (H - pad - bh) + '" width="' + (bw * 0.6) +
        '" height="' + bh + '" rx="2" fill="#d96e85" opacity="0.85"><title>' + t.date + " · " +
        t.views + "PV / " + t.visitors + "명</title></rect>");
    });
    // 방문자 선
    var line = tl.map(function (t, i) {
      return (pad + i * bw + bw / 2) + "," + y(t.visitors);
    }).join(" ");
    parts.push('<polyline points="' + line + '" fill="none" stroke="#5e9272" stroke-width="2.5"/>');
    // 처음/끝 날짜 라벨
    parts.push('<text x="' + pad + '" y="' + (H - 4) + '" font-size="11" fill="#999">' + tl[0].date + "</text>");
    parts.push('<text x="' + (W - pad) + '" y="' + (H - 4) + '" font-size="11" fill="#999" text-anchor="end">' +
      tl[tl.length - 1].date + "</text>");
    svg.innerHTML = parts.join("");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // 기간 버튼
  el("ranges").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    days = parseInt(b.dataset.days, 10);
    [].forEach.call(this.querySelectorAll("button"), function (x) { x.classList.remove("active"); });
    b.classList.add("active");
    fetchStats();
  });

  fetchStats();
  setInterval(fetchStats, 30000); // 30초마다 자동 새로고침
})();
