#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""전국 산후조리업 인허가 CSV(EUC-KR) → national-data.js 생성.
출처: 행정안전부 지방행정 인허가 데이터(file.localdata.go.kr, 산후조리업). 영업중만, 팩터 계산용 핵심필드.
실행: python build_national.py
"""
import csv, io, re, sys, json
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

RAW = "sanhujo_raw.bin"
OUT = "national-data.js"

# 컬럼 인덱스
C_STATE, C_NAME, C_NURSE, C_ASST, C_DIET = 4, 10, 12, 13, 26
C_ROAD, C_INF, C_MOM, C_TEL, C_JIBUN = 18, 29, 31, 32, 36
C_LICDATE = 2

SIDO_SHORT = {
    "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구", "인천광역시": "인천",
    "광주광역시": "광주", "대전광역시": "대전", "울산광역시": "울산", "세종특별자치시": "세종",
    "경기도": "경기", "강원특별자치도": "강원", "강원도": "강원", "충청북도": "충북",
    "충청남도": "충남", "전북특별자치도": "전북", "전라북도": "전북", "전라남도": "전남",
    "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주",
}


def clean(s):
    return re.sub(r"\s+", " ", (s or "").strip())


def to_int(s):
    s = (s or "").strip()
    return int(s) if s.isdigit() else 0


def fmt_tel(s):
    d = re.sub(r"\D", "", s or "")
    if not d:
        return ""
    if d.startswith("02"):
        rest = d[2:]
        if len(rest) == 8:
            return "02-" + rest[:4] + "-" + rest[4:]
        if len(rest) == 7:
            return "02-" + rest[:3] + "-" + rest[3:]
        return "02-" + rest
    if len(d) == 8:  # 1588 등
        return d[:4] + "-" + d[4:]
    if len(d) >= 10:
        return d[:3] + "-" + d[3:-4] + "-" + d[-4:]
    return d


def parse_region(road, jibun):
    addr = clean(road) or clean(jibun)
    if not addr:
        return None, None, ""
    parts = addr.split(" ")
    sido_full = parts[0]
    sido = SIDO_SHORT.get(sido_full, sido_full)
    if sido_full == "세종특별자치시":
        sigungu = "세종"
    else:
        sigungu = parts[1] if len(parts) > 1 else ""
    return sido, sigungu, addr


def main():
    raw = open(RAW, "rb").read()
    rows = list(csv.reader(io.StringIO(raw.decode("cp949", "replace"))))
    data = rows[1:]
    out = []
    for r in data:
        if len(r) < 40:
            continue
        if "영업" not in r[C_STATE]:  # 영업/정상만
            continue
        sido, sigungu, addr = parse_region(r[C_ROAD], r[C_JIBUN])
        if not sido or not sigungu:
            continue
        name = clean(r[C_NAME])
        if not name:
            continue
        lic = re.sub(r"\D", "", r[C_LICDATE] or "")
        year = lic[:4] if len(lic) >= 4 else ""
        out.append({
            "n": name,
            "sd": sido,
            "sg": sigungu,
            "a": addr,
            "t": fmt_tel(r[C_TEL]),
            "ns": to_int(r[C_NURSE]),     # 간호사수
            "na": to_int(r[C_ASST]),      # 간호조무사수
            "nd": to_int(r[C_DIET]),      # 영양사수
            "ci": to_int(r[C_INF]),       # 영유아(신생아) 정원
            "cm": to_int(r[C_MOM]),       # 임산부 정원
            "y": year,                     # 인허가 연도
        })
    # 시도 → 시군구 → 이름 순 정렬
    sido_order = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종",
                  "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]
    out.sort(key=lambda c: (sido_order.index(c["sd"]) if c["sd"] in sido_order else 99, c["sg"], c["n"]))

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* 전국 산후조리원 (영업중) — 출처: 행정안전부 지방행정 인허가 데이터(산후조리업), file.localdata.go.kr\n")
        f.write("   필드: n상호 sd시도 sg시군구 a주소 t전화 ns간호사 na간호조무사 nd영양사 ci영유아정원 cm임산부정원 y인허가연도\n")
        f.write("   ※ 간호인력 1인당 신생아 = ci/(ns+na). 가격은 별도(복지부 데이터). 자동 생성: build_national.py */\n")
        f.write("const NATIONAL_CENTERS = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")

    # 요약
    import collections
    by_sido = collections.Counter(c["sd"] for c in out)
    print("생성:", OUT, "| 총", len(out), "곳")
    print("시도별:", dict(by_sido))
    # 팩터 분포 샘플
    ratios = [c["ci"] / (c["ns"] + c["na"]) for c in out if (c["ns"] + c["na"]) > 0 and c["ci"] > 0]
    if ratios:
        print("간호인력 1인당 신생아 — 평균 %.2f, 최저 %.2f, 최고 %.2f" % (sum(ratios)/len(ratios), min(ratios), max(ratios)))


if __name__ == "__main__":
    main()
