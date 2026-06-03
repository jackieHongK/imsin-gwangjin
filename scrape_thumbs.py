#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
산후조리원 대표/서브 썸네일 스크래퍼 (best-effort)
- seoul-data.js 의 web URL을 방문해 og:image + 콘텐츠 사진을 수집
- 로고/아이콘은 '이미지 크기'로 필터(PIL), 실제 사진만 thumbs/<no>/ 에 저장
- 결과 매핑을 thumbs.js 로 저장 → 웹페이지가 사용
- 실패(봇차단/JS렌더/사진없음)한 곳은 자동 제외(웹에서 플레이스홀더 표시)
주의: 각 조리원 홈페이지의 사진 저작권은 해당 시설에 있습니다. 개인/미리보기 용도로만 사용하세요.

실행:  python scrape_thumbs.py
"""
import os, re, sys, json, ssl, io, time
import urllib.request
from urllib.parse import urljoin, urlparse

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

BASE = os.path.dirname(os.path.abspath(__file__))
THUMB_DIR = os.path.join(BASE, "thumbs")
os.makedirs(THUMB_DIR, exist_ok=True)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

# 로고/UI로 의심되는 파일명 패턴 → 후보에서 제외
BAD = re.compile(r"(logo|icon|btn|button|bullet|favicon|sprite|sns|share|kakao|naver|"
                 r"map|footer|header|top_|gnb|menu|arrow|loading|blank|spacer|bg_top|"
                 r"common|/img/default|profile|qr|badge|tel|phone|email)", re.I)
IMG_EXT = re.compile(r"\.(jpe?g|png|webp)(\?|$)", re.I)


def fetch(url, timeout=12, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": url})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "ignore")


def candidates(html, base_url):
    urls = []
    # og:image / twitter:image (대표 우선)
    for pat in [r'property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
                r'content=["\']([^"\']+)["\'][^>]+property=["\']og:image',
                r'name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)']:
        for m in re.findall(pat, html, re.I):
            urls.append(("og", m))
    # img src / lazy attrs
    for m in re.findall(r'<img[^>]+(?:data-src|data-original|src)=["\']([^"\']+)', html, re.I):
        urls.append(("img", m))
    # srcset
    for m in re.findall(r'srcset=["\']([^"\']+)', html, re.I):
        first = m.split(",")[0].strip().split(" ")[0]
        urls.append(("img", first))
    # background-image url(...)
    for m in re.findall(r'background(?:-image)?\s*:\s*url\((?:&quot;|["\']?)([^)"\'&]+)', html, re.I):
        urls.append(("bg", m))

    out, seen = [], set()
    for kind, u in urls:
        if not u or u.startswith("data:"):
            continue
        absu = urljoin(base_url, u.replace("&amp;", "&"))
        if not IMG_EXT.search(absu):
            continue
        if kind != "og" and BAD.search(absu):
            continue
        if absu in seen:
            continue
        seen.add(absu)
        out.append((kind, absu))
    # og 먼저, 그다음 img, bg
    rank = {"og": 0, "img": 1, "bg": 2}
    out.sort(key=lambda x: rank.get(x[0], 3))
    return out


def good_image(data):
    """PIL로 크기 검사 → 로고/아이콘(작거나 극단적 비율) 제외, 정사각 근처 사진만."""
    if not HAVE_PIL:
        return len(data) > 12000  # PIL 없으면 용량으로만
    try:
        im = Image.open(io.BytesIO(data))
        w, h = im.size
    except Exception:
        return False
    if w < 320 or h < 220:
        return False
    ar = w / float(h)
    if ar < 0.4 or ar > 3.2:   # 배너/띠 제외
        return False
    return True


def save_thumb(data, path, maxw):
    if not HAVE_PIL:
        with open(path, "wb") as f:
            f.write(data)
        return True
    try:
        im = Image.open(io.BytesIO(data)).convert("RGB")
        w, h = im.size
        if w > maxw:
            im = im.resize((maxw, int(h * maxw / w)), Image.LANCZOS)
        im.save(path, "JPEG", quality=82)
        return True
    except Exception:
        return False


def parse_centers():
    js = open(os.path.join(BASE, "seoul-data.js"), encoding="utf-8").read()
    rows = re.findall(r'\{no:(\d+),gu:"([^"]*)",name:"([^"]*)",.*?web:"([^"]*)"\}', js)
    return [{"no": int(n), "gu": g, "name": nm, "web": w} for n, g, nm, w in rows]


def normurl(w):
    w = (w or "").strip()
    if not w or "@" in w or " " in w:
        return None
    if re.search(r"[가-힣]", w):
        return None
    if not re.match(r"^https?://", w, re.I):
        w = "http://" + w
    return w


def process(c, want=6):
    url = normurl(c["web"])
    if not url:
        return None
    try:
        html = fetch(url)
    except Exception as e:
        return {"err": type(e).__name__}
    cands = candidates(html, url)
    saved = []
    outdir = os.path.join(THUMB_DIR, str(c["no"]))
    tries = 0
    for kind, iu in cands:
        if len(saved) >= want or tries >= 16:
            break
        tries += 1
        try:
            data = fetch(iu, timeout=10, binary=True)
        except Exception:
            continue
        if len(data) < 6000 or not good_image(data):
            continue
        os.makedirs(outdir, exist_ok=True)
        idx = len(saved)
        fname = "rep.jpg" if idx == 0 else "s%d.jpg" % idx
        path = os.path.join(outdir, fname)
        if save_thumb(data, path, 640 if idx == 0 else 420):
            saved.append("thumbs/%d/%s" % (c["no"], fname))
    if not saved:
        return {"err": "no-image", "cands": len(cands)}
    return {"rep": saved[0], "subs": saved[1:]}


def main():
    centers = parse_centers()
    print("대상 조리원:", len(centers), "| PIL:", HAVE_PIL)
    result = {}
    ok = fail = skip = 0
    for i, c in enumerate(centers, 1):
        r = process(c)
        if r is None:
            skip += 1
            tag = "skip(웹없음)"
        elif "rep" in r:
            result[str(c["no"])] = {"rep": r["rep"], "subs": r["subs"], "name": c["name"]}
            ok += 1
            tag = "OK %d장" % (1 + len(r["subs"]))
        else:
            fail += 1
            tag = "fail(%s)" % r.get("err")
        print("[%3d/%d] %-22s %s" % (i, len(centers), c["name"][:20], tag))
        # 증분 저장
        if i % 10 == 0 or i == len(centers):
            with open(os.path.join(BASE, "thumbs.js"), "w", encoding="utf-8") as f:
                f.write("/* 자동 생성: scrape_thumbs.py (조리원 홈페이지 사진, 개인/미리보기용) */\n")
                f.write("const SEOUL_THUMBS = " + json.dumps(result, ensure_ascii=False) + ";\n")
    print("\n완료 — 성공 %d · 실패 %d · 웹없음 %d (총 %d)" % (ok, fail, skip, len(centers)))
    print("저장: thumbs.js , 이미지: thumbs/<no>/")


if __name__ == "__main__":
    main()
