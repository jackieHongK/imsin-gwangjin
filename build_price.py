#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""보건복지부 전국 산후조리원 현황 CSV(2023.12) → price-national.js
   전화번호/상호로 조인할 가격맵 생성. 단위 만원. 실행: python build_price.py <csv경로>"""
import csv, io, re, sys, json

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SRC = sys.argv[1] if len(sys.argv) > 1 else r"C:/Users/HJP/Downloads/보건복지부_전국 산후조리원 현황_20231231.csv"


def pdig(t):
    return re.sub(r"\D", "", t or "")


def pnorm(s):
    return re.sub(r"\s+", "", re.sub(r"\(.*?\)", "", re.sub(r"산후조리원", "", s or ""))).lower()


def clean_price(s):
    s = re.sub(r"[^0-9,]", "", (s or "").strip())
    return s if s else ""


def main():
    raw = open(SRC, "rb").read()
    rows = list(csv.reader(io.StringIO(raw.decode("cp949", "replace"))))
    hdr = rows[0]
    # 컬럼 인덱스: 번호,시도,시군구,운영주체,산후조리원,주소,전화번호,일반실,특실
    by_phone, by_name = {}, {}
    n = 0
    for r in rows[1:]:
        if len(r) < 9:
            continue
        sido, sigungu, oper, name, addr, tel, normal, special = r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]
        rec = {"n": clean_price(normal), "s": clean_price(special)}
        if not rec["n"] and not rec["s"]:
            continue
        d = pdig(tel)
        if d:
            by_phone[d] = rec
        key = pnorm(name) + "|" + sigungu.strip()
        by_name[key] = rec
        n += 1
    out = {"phone": by_phone, "name": by_name}
    with open("price-national.js", "w", encoding="utf-8") as f:
        f.write("/* 전국 산후조리원 가격 (출처: 보건복지부 전국 산후조리원 현황 2023.12, 단위 만원, 2주 기준)\n")
        f.write("   조인키: phone=전화번호 digits, name=정규화상호|시군구. 자동 생성: build_price.py */\n")
        f.write("const PRICE_2023 = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("생성: price-national.js | 가격행", n, "| by_phone", len(by_phone), "| by_name", len(by_name))


if __name__ == "__main__":
    main()
