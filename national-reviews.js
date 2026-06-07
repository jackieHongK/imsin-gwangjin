/* 비서울 지역 인기 산후조리원 특징·후기 (웹 리서치 2026.6, 맘카페·블로그·공식·뉴스 종합)
   - 실제 확인된 표현만. 별점 수치 미인용. 일부는 '추가 확인 권장' 표기.
   - 서울은 seoul-reviews.js(구별 비교 페이지)에서 제공. */
const NATIONAL_REVIEWS = [
  {name:"연세산후조리원", sido:"경기", area:"수원시 영통", features:"영통·광교권 병원 연계형(같은 건물 산부인과). 대학병원 간호사 출신 원장, 황달측정기·신생아 모니터링 구비, 합리적 가격대.", review:"맘카페에서 ‘저렴하면서 전문적인 케어’ 가성비형으로 인기. 모유수유 관리 만족 후기 반복. 초프리미엄 시설을 기대하면 규모·인테리어는 아쉽다는 평.", sources:["http://www.sanhujoriwon.co.kr/","https://community.mmtalk.kr/community/article/226591"]},
  {name:"플로라산후조리원", sido:"경기", area:"성남 분당", features:"율동공원 인근 북유럽 리조트 컨셉의 프리미엄으로 알려짐.", review:"분당 맘카페에서 ‘율동공원 뷰 고급 리조트형’으로 검색량 많은 프리미엄. ※공식 도메인 만료로 운영 상태 별도 확인 필요.", sources:["https://www.teamblind.com/kr/post/JPqpjsKY"]},
  {name:"분당차여성병원 산후조리원", sido:"경기", area:"성남 분당", features:"분당차병원 계열 병원 연계형. 분만·소아과 응급 연계 가능한 종합병원급 백업이 강점.", review:"분당권에서 ‘병원 연계 안정성’ 우선 산모가 선택하는 대표 옵션. 안전성은 높으나 객실·부대시설 분위기는 호불호.", sources:["https://bundangwoman.chamc.co.kr/obstetrics/postpartumCare_appoint.cha"]},
  {name:"이자르 산후조리원 일산점", sido:"경기", area:"고양 일산", features:"일산권 프랜차이즈(이자르) 지점.", review:"일산 맘카페·인기순위에서 대표 후보로 반복 노출. 직원 친절도·신생아 케어 전문성이 인기 요인으로 언급.", sources:["http://izarilsan.co.kr/"]},
  {name:"히즈메디수산후조리원", sido:"경기", area:"고양 일산", features:"히즈메디병원 계열 일산권 병원 연계형.", review:"일산 인기순위 상위 후보. 병원 연계 신생아 케어와 서비스 질이 추천 사유.", sources:["http://www.soonwidot.com/rank/detail.php?id=17072366"]},
  {name:"크래들 산후조리원", sido:"경기", area:"용인 기흥", features:"죽전·보정 인근 단독건물·녹지 입지. 원장 직접 상담·유방 케어, 특실 2주 약 400만원대 프리미엄.", review:"블라인드·블로그에서 ‘조용하고 단독건물·주차 편함’, ‘원장 직접 케어·신생아실 만족’ 강추 반복. 가격대 높은 편이 단점.", sources:["https://cledle.co.kr/","https://www.teamblind.com/kr/post/TrFoPsyN"]},
  {name:"동탄제일프리미엄산후조리원", sido:"경기", area:"화성 동탄", features:"동탄제일병원 연계형 프리미엄. NICU 연계 응급대응, 소아청소년과 주 5회 회진, ‘7성급 호텔 기자재’ 고가 포지셔닝.", review:"동탄권 비교글 상위. 병원 연계 안정성·프리미엄 시설이 선택 사유로 자주 언급, 가격대 높음.", sources:["https://dtpremium.kr/FACILITY"]},
  {name:"노블아이 산후조리원", sido:"경기", area:"화성 동탄", features:"동탄권 사설 조리원.", review:"동탄/용인기흥/수원영통 통합 비교글에서 최종 후보로 자주 거론. 상세 후기는 제한적.", sources:["https://www.threads.com/@paternity_journal/post/DGDPVPnP2g8"]},
  {name:"W산후조리센터 송도점", sido:"인천", area:"연수구 송도", features:"W여성병원 계열 병원 연계형(본점·송도점). 송도 신도시권 산전~산후 원스톱.", review:"인천·송도 맘카페에서 송도권 대표 병원 연계로 문의 많음. 예약 경쟁이 있는 편.", sources:["http://xn--w-3y2f35in2fw6a.com/index.php/html/201"]},
  {name:"아인산후조리원", sido:"인천", area:"미추홀구", features:"아인병원 연계형. 24시간 전문간호사·베베캠·감염관리, ‘호텔서비스+고품격 케어’ 고급형.", review:"인천권에서 호텔급 객실·병원 연계 신생아 케어가 장점으로 언급되는 프리미엄. 가격대 높음.", sources:["https://www.ainwh.co.kr/care/"]},
  {name:"퀸즈힐 산후조리원", sido:"부산", area:"해운대구", features:"해운대권 스칸디나비아풍 프리미엄. 5성급 호텔 수준 시설·분야별 전문 의료진.", review:"부산 추천·비교에서 해운대 프리미엄 대표격. 고급 시설·인테리어 장점, 가격대 높음.", sources:["http://qpark.kr/html/hill01.php","https://sconelove.com/408"]},
  {name:"미래여성병원 산후조리원", sido:"부산", area:"부산진구 개금", features:"부산 최다분만급 미래여성병원 부설. 소아과 회진·24시간 간호 기록·자연채광 신생아실, 2주 일반실 200만원대 후반 가성비.", review:"블로그에서 ‘믿고 맡길 가성비’, ‘친절·식사 만족·매일 방청소’ 반복. 서울 대비 합리적 가격이 장점.", sources:["https://www.miraeobgy.com/theme/hp003/page/mirae_14.php"]},
  {name:"좋은문화병원 산후조리원", sido:"부산", area:"부산진구", features:"좋은문화병원 부설. 응급 시 병원 연계 진료 가능이 강점.", review:"‘병원 연계 안정성’ 중시 산모가 거론하는 대표 후보.", sources:["https://www.moonhwa.or.kr/facilities/postpartum-care-center"]},
  {name:"김혜정 산후조리원 수성점", sido:"대구", area:"수성구", features:"수성·달서점 운영. 모유수유클리닉·통곡마사지·신생아 케어 전문, 보건복지부장관상 이력.", review:"대구 인기순위 수성구 1순위급. ‘모유수유·신생아 관리 전문성’과 편안한 분위기가 장점으로 반복.", sources:["http://kimsmom.co.kr/"]},
  {name:"엘리자벳 산후조리원", sido:"대구", area:"수성구", features:"수성구 사설 조리원, 산모·신생아 관리 프로그램 운영.", review:"대구 수성구 추천·인기순위에서 김혜정·시엘과 함께 상위 후보.", sources:["http://elizb.co.kr/"]},
  {name:"시엘 산후조리원", sido:"대구", area:"수성구", features:"수성구권 사설 조리원.", review:"수성구 추천 정리에서 김혜정·엘리자벳과 함께 반복 거론되는 인기 후보.", sources:["http://www.cielmom.co.kr/"]},
  {name:"미즈제일산후조리원", sido:"대전", area:"서구 둔산", features:"둔산동 대표 조리원(둔산권 중심 입지).", review:"대전 인기순위에서 둔산권 대표 후보. 접근성 강점, 공개 상세 후기는 제한적.", sources:["http://www.soonwidot.co.kr/rank/search.php"]},
  {name:"라온산부인과 산후조리원", sido:"대전", area:"서구", features:"라온산부인과 부설 병원 연계형. 이벤트·문화 프로그램 운영.", review:"대전권 병원 연계형 대표 후보. 산전~산후 연계 편의가 장점.", sources:["http://www.raonobgy.com/sub/sub0301.php"]},
  {name:"빛고을여성병원 산후조리원", sido:"광주", area:"광산구", features:"광주/전남 다분만 병원 빛고을여성병원 부설 병원 연계형.", review:"‘분만 병원 연계 안정성’ 중시 산모가 자주 거론. 의료 연계·신생아 케어가 선택 사유.", sources:["https://shinelady.co.kr/73"]},
  {name:"더엘 산후조리원", sido:"광주", area:"광주", features:"광주권 ‘프리미엄’ 표방 사설 조리원.", review:"광주 추천에서 프리미엄 대표 후보. ※공식 홈페이지 인증서 오류로 세부 사양 추가 확인 권장.", sources:["http://www.thelcenter.co.kr/"]},
  {name:"미즈산후조리원", sido:"광주", area:"광주", features:"객실 내 아기침대·젖병소독기·유축기 등 비품 폭넓게 구비, 산모·신생아 종합 케어.", review:"광주권에서 ‘비품 구비·신생아 관리 충실’이 장점으로 언급.", sources:["http://www.imizpia.co.kr/"]},
  {name:"울산 북구 공공산후조리원", sido:"울산", area:"북구", features:"울산 북구 운영 공공 조리원. 민간 대비 저렴한 공공형 요금이 핵심.", review:"민간 가격 부담이 큰 울산에서 ‘가성비’ 대안으로 문의 많음. 가격 메리트가 가장 큰 장점, 공공 특성상 예약 경쟁.", sources:["http://bkmomcare.n-c.co.kr/"]},
  {name:"퀸스산부인과 산후조리원", sido:"충남", area:"천안", features:"천안 서북구 퀸스산부인과 부설(산부인과·소아과·내과) 종합 여성병원형.", review:"천안권에서 ‘가격 대비 시설·서비스 만족’, 담당의 설명이 세심해 신뢰가 간다는 평. 병원 연계 편의가 장점.", sources:["https://www.queensmd.co.kr/"]},
  {name:"모란산후조리원", sido:"경남", area:"창원", features:"창원 모란병원 연계형(같은 건물 분만실·소아과). 의료 연계가 강점인 규모 있는 조리원.", review:"‘첫째·둘째 모두 모란’ 재이용 후기 확인. 분만·소아과 연계 안정성이 선택 사유로 반복, 지역 대표 인지도.", sources:["http://moranhosp.co.kr/"]},
  {name:"세인트포레 산후조리원", sido:"전북", area:"전주", features:"전주권 대표 사설. 출산 150일 전 조기예약 할인·산전산후 마사지 패키지 제공.", review:"전주 후기에서 디럭스룸 시설·식사·프로그램 만족 다수. 조기예약 혜택이 장점으로 자주 언급되는 인기 조리원.", sources:["http://www.saintfore.com/"]},
  {name:"마더힐 산후조리원", sido:"전북", area:"전주", features:"전주·광주·순천 거점 마더힐 브랜드. 호텔급 객실·고품격 식단·회복 프로그램 ‘토탈 케어’.", review:"전주권 호텔형 프리미엄 대표 후보. 객실·식단·프로그램 시설형 강점이 언급.", sources:["http://www.themotherhill.com/"]},
  {name:"프리티가든 산후조리원", sido:"강원", area:"원주", features:"원주시 영랑길, 우리산부인과 연계형.", review:"원주권에서 다올·미즈·연세순풍과 함께 대표 후보. 산부인과 연계 편의가 강점, 상세 후기는 제한적.", sources:["http://wooriobgy.com/"]}
];
