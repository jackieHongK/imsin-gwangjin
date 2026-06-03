#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
자체 트래픽 분석 서버 (GA 대체 · 외부 의존성 0 · Python 표준 라이브러리만)

기능
  1) 정적 사이트 서빙 (index.html, dashboard.html 등)  →  http://localhost:5500/
  2) POST /collect      : analytics.js 가 보내는 이벤트 수집 → analytics/events.ndjson
  3) GET  /api/stats    : 집계 통계 JSON (대시보드가 사용)
  4) 대시보드           : http://localhost:5500/dashboard.html

실행
  python analytics_server.py            # 포트 5500
  python analytics_server.py 8080       # 포트 지정

개인정보
  - 쿠키 미사용, 원본 IP 저장 안 함(일자별 솔트 해시 8자만 보관)
  - Do Not Track 존중(클라이언트에서 차단)
"""
import sys, os, json, threading, hashlib, datetime, secrets
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from collections import Counter, defaultdict

# Windows 콘솔(cp949) 등에서 한글/특수문자 출력 깨짐·예외 방지
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "analytics")
EVENTS = os.path.join(DATA_DIR, "events.ndjson")
SALT_FILE = os.path.join(DATA_DIR, ".salt")
LOCK = threading.Lock()

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(SALT_FILE):
    with open(SALT_FILE, "w") as f:
        f.write(secrets.token_hex(16))
with open(SALT_FILE) as f:
    SECRET = f.read().strip()


def anon_ip(ip):
    """원본 IP 대신 일자별 솔트 해시 8자만 — 같은 날 같은 IP 식별만 가능."""
    day = datetime.date.today().isoformat()
    return hashlib.sha256((ip + day + SECRET).encode()).hexdigest()[:8]


# 광진구 지역 트래픽으로 분류할 키워드 패턴
LOCAL_HINTS = ["광진", "산후조리", "자양", "구의", "화양", "능동", "중곡",
               "출산지원", "출산축하", "지원금", "교통비", "산후조리경비", "임산부"]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, *a):  # 콘솔 소음 줄이기
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        if urlparse(self.path).path != "/collect":
            self.send_response(404); self._cors(); self.end_headers(); return
        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length else b"{}"
            event = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            self.send_response(400); self._cors(); self.end_headers(); return

        ip = (self.headers.get("X-Forwarded-For", "") or self.client_address[0]).split(",")[0].strip()
        event["_ip"] = anon_ip(ip)
        event["_ua"] = self.headers.get("User-Agent", "")[:200]
        event["_recv"] = datetime.datetime.now().isoformat()

        with LOCK:
            with open(EVENTS, "a", encoding="utf-8") as f:
                f.write(json.dumps(event, ensure_ascii=False) + "\n")

        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        # 원시 로그/솔트/서버 소스 직접 접근만 차단 (analytics.js 등 정적 자산은 허용)
        blocked = parsed.path.startswith("/analytics/") or parsed.path == "/analytics_server.py"
        if blocked:
            self.send_response(403); self._cors(); self.end_headers()
            self.wfile.write(b"forbidden"); return
        if parsed.path == "/api/stats":
            return self._stats(parse_qs(parsed.query))
        return super().do_GET()

    # ---------- 집계 ----------
    def _stats(self, qs):
        days = int(qs.get("days", ["30"])[0])
        cutoff = datetime.datetime.now() - datetime.timedelta(days=days)

        pv = 0
        visitors, sessions = set(), set()
        pages, sources, mediums = Counter(), Counter(), Counter()
        keywords, local_keywords = Counter(), Counter()
        devices, browsers, langs = Counter(), Counter(), Counter()
        sections = Counter()
        clicks_kind, clicks_label = Counter(), Counter()
        daily_views = defaultdict(int)
        daily_visitors = defaultdict(set)
        durations, scrolls = [], []

        for ev in self._read_events():
            ts = ev.get("ts") or ev.get("_recv") or ""
            try:
                t = datetime.datetime.fromisoformat(ts.replace("Z", "").split("+")[0])
            except Exception:
                t = datetime.datetime.now()
            if t < cutoff:
                continue
            typ = ev.get("type")
            if typ == "pageview":
                pv += 1
                if ev.get("vid"): visitors.add(ev["vid"])
                if ev.get("sid"): sessions.add(ev["sid"])
                pages[ev.get("path", "/")] += 1
                medium = ev.get("medium", "none")
                mediums[medium] += 1
                if medium != "internal":
                    sources[ev.get("source", "direct")] += 1
                kw = (ev.get("keyword") or "").strip()
                if kw:
                    keywords[kw] += 1
                    if any(h in kw for h in LOCAL_HINTS):
                        local_keywords[kw] += 1
                devices[ev.get("device", "?")] += 1
                browsers[ev.get("browser", "?")] += 1
                if ev.get("lang"): langs[ev["lang"]] += 1
                day = t.date().isoformat()
                daily_views[day] += 1
                if ev.get("vid"): daily_visitors[day].add(ev["vid"])
            elif typ == "section_view":
                sections[ev.get("section", "?")] += 1
            elif typ == "click":
                clicks_kind[ev.get("kind", "?")] += 1
                clicks_label[ev.get("label", "?")[:40]] += 1
            elif typ == "engagement":
                if isinstance(ev.get("duration"), (int, float)): durations.append(ev["duration"])
                if isinstance(ev.get("max_scroll"), (int, float)): scrolls.append(ev["max_scroll"])

        timeline = [{"date": d, "views": daily_views[d], "visitors": len(daily_visitors[d])}
                    for d in sorted(daily_views)]

        def top(counter, n=12):
            return [{"name": k, "count": v} for k, v in counter.most_common(n)]

        result = {
            "range_days": days,
            "summary": {
                "pageviews": pv,
                "visitors": len(visitors),
                "sessions": len(sessions),
                "avg_seconds": round(sum(durations) / len(durations), 1) if durations else 0,
                "avg_scroll": round(sum(scrolls) / len(scrolls), 1) if scrolls else 0,
                "total_clicks": sum(clicks_kind.values()),
            },
            "timeline": timeline,
            "top_pages": top(pages),
            "sources": top(sources),
            "mediums": top(mediums),
            "keywords": top(keywords, 20),
            "local_keywords": top(local_keywords, 20),
            "devices": top(devices),
            "browsers": top(browsers),
            "sections": top(sections, 20),
            "clicks_by_kind": top(clicks_kind),
            "top_clicks": top(clicks_label, 15),
        }
        body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self._cors()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_events(self):
        if not os.path.exists(EVENTS):
            return
        with open(EVENTS, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except Exception:
                    continue


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("=" * 56)
    print("  광진구 임신·출산 가이드 — 자체 분석 서버")
    print("=" * 56)
    print(f"  사이트     : http://localhost:{port}/")
    print(f"  대시보드   : http://localhost:{port}/dashboard.html")
    print(f"  수집 엔드  : POST http://localhost:{port}/collect")
    print(f"  통계 API   : http://localhost:{port}/api/stats?days=30")
    print(f"  데이터     : {EVENTS}")
    print("  종료: Ctrl+C")
    print("=" * 56)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n종료합니다.")
        httpd.shutdown()


if __name__ == "__main__":
    main()
