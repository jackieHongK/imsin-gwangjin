# 광진구 임신·출산 가이드

서울 광진구 임산부·배우자를 위한 정적 정보 사이트. 공신력 출처(보건복지부·질병관리청·식약처·서울시·광진구청 등) 기반, 2025~2026년 데이터.

순수 HTML/CSS/JS + **자체 트래픽 분석 도구**(GA 미사용, Python 표준 라이브러리만).

---

## 1. 실행

### 트래픽 수집까지 포함해 실행 (권장)
```bash
python analytics_server.py        # http://localhost:5500
# 포트 지정: python analytics_server.py 8080
```
- 사이트: <http://localhost:5500/>
- 대시보드: <http://localhost:5500/dashboard.html>

### 콘텐츠만 빠르게 미리보기 (수집 없음)
```bash
python -m http.server 5500
```
> 이 경우 `analytics.js`의 `/collect` 전송은 조용히 실패하며, 사이트 표시는 정상입니다.

### 📱 같은 와이파이에서 휴대폰으로 보기
`analytics_server.py`(또는 http.server)는 `0.0.0.0`으로 열리므로, **PC와 휴대폰이 같은 와이파이**면 바로 접속됩니다.
1. PC에서 서버 실행: `python analytics_server.py`
2. PC의 LAN IP 확인(Windows): `ipconfig` → IPv4 주소 (예: `192.168.75.139`)
3. 휴대폰 브라우저에서: **`http://<PC-IP>:5500/`** (예: `http://192.168.75.139:5500/`)
- 처음 실행 시 Windows 방화벽 허용 창이 뜨면 **허용**. 안 뜨거나 막히면(관리자 PowerShell):
  ```powershell
  New-NetFirewallRule -DisplayName "imsin 5500" -Direction Inbound -Protocol TCP -LocalPort 5500 -Action Allow
  ```
- IP는 공유기 재접속 시 바뀔 수 있어요. **집 밖(외부 인터넷)에서** 접속하려면 `cloudflared tunnel --url http://localhost:5500` 같은 터널로 임시 공개 URL을 만들면 됩니다.

---

## 2. 배포 전 체크리스트 (SEO/GEO)

배포 도메인이 정해지면 **플레이스홀더 `jackiehongk.github.io/imsin-gwangjin` 를 실제 도메인으로 일괄 치환**하세요. 등장 위치:

| 파일 | 항목 |
|---|---|
| `index.html` | canonical, og:url, og:image, twitter:image, JSON-LD(@id·url·SearchAction) |
| `robots.txt` | Sitemap 주소 |
| `sitemap.xml` | 모든 `<loc>`, `<lastmod>` 날짜 |
| `llms.txt` | 섹션 URL |

적용된 SEO/GEO 풀세트:
- **기본**: 키워드형 title/description, keywords, canonical, robots(`max-image-preview:large`), theme-color
- **지역(Local) SEO**: `geo.region/geo.placename/geo.position/ICBM`(광진구 좌표), 제목·키워드에 광진구·자양동·구의동·산후조리원·출산지원금 타겟
- **공유 미리보기**: Open Graph + Twitter Card (`og-image.svg`)
- **구조화 데이터(JSON-LD)**: `WebSite`(+SearchAction) · `MedicalWebPage` · `ItemList`(광진구 산후조리원 3곳 주소·전화) · `FAQPage`(6문항, 본문 FAQ와 1:1 일치 → 리치결과)
- **GEO(생성형 답변엔진)**: 본문 FAQ, `llms.txt`(AI 인용용 사실 요약), `robots.txt`에서 GPTBot·PerplexityBot·ClaudeBot 등 허용
- **사이트맵/로봇**: `sitemap.xml`, `robots.txt`(네이버 Yeti·다음 Daumoa 포함)
- **PWA 기초**: `site.webmanifest`, `favicon.svg`

> 권장: 배포 후 **네이버 서치어드바이저**·**구글 서치콘솔**에 사이트 등록 + 사이트맵 제출. OG 이미지는 호환성을 위해 `og-image.svg`를 1200×630 **PNG**로도 내보내 함께 두는 것을 추천.

---

## 3. 자체 트래픽 분석 도구

GA 없이 직접 수집·분석합니다. **쿠키 없음, 원본 IP 미저장**(일자별 솔트 해시 8자), Do Not Track 존중.

```
analytics.js          # 클라이언트 트래커 (페이지뷰·스크롤·섹션노출·전환클릭·체류시간·유입/검색어)
analytics_server.py   # 수집+API+정적서빙 (표준 라이브러리만)
dashboard.html/.js    # 대시보드 (외부 차트 라이브러리 없이 SVG)
analytics/events.ndjson  # 수집 데이터 (1줄=1이벤트, 외부 접근 403 차단)
```

수집 항목: 페이지뷰·고유 방문자·세션·평균 체류·평균 스크롤, 일별 추이, **유입 소스/검색어**(네이버·구글·다음 organic 자동 분류), **광진구 지역 검색 키워드 별도 집계**, 인기 페이지·섹션, 기기·브라우저, 전환 클릭(전화·지도·레시피).

### 광진구 트래픽 "접수"
대시보드 상단의 **광진구 지역 검색 유입 키워드** 패널은 검색 유입 중 `광진/산후조리/자양/구의/지원금/교통비/임산부` 등 지역 의도 키워드만 따로 보여줍니다. (검색엔진이 키워드를 넘기는 경우에 한해 표시)

### 배포 시 주의
- GitHub Pages·Netlify 같은 **순수 정적 호스팅에는 Python 수집 서버가 돌지 않습니다.** 트래픽 수집을 운영하려면:
  1. **VPS/서버**에서 `analytics_server.py`를 사이트와 함께 구동(가장 단순), 또는
  2. 정적 사이트는 그대로 두고 `analytics.js`의 `ENDPOINT`를 **별도 수집 서버 도메인**으로 지정, 또는
  3. 서버리스 함수(Cloudflare Workers/Vercel)로 `/collect`·`/api/stats`를 포팅.
- 운영 시 `dashboard.html`은 인증(베이직 오스 등) 뒤에 두는 것을 권장(robots에서 noindex 처리됨).

---

## 4. 면책
본 정보는 일반적 참고용이며 개인별 의학적 판단을 대체하지 않습니다. 복지 금액·조건은 변동될 수 있으니 신청 전 공식 출처에서 확인하세요.
