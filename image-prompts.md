# 🎨 이미지 생성 가이드 & 프롬프트

이미지를 만들어 **`img/` 폴더**에 아래 **파일명 그대로** 넣어주시면 제가 사이트에 연결합니다.
(예: `K:\개발 프로젝트\PJ_after_delivery\img\hero-main.png`)

- 권장 도구: Midjourney / DALL·E 3 / Adobe Firefly / Ideogram 등 아무거나
- **글자(텍스트)는 이미지에 넣지 마세요** — 제목·문구는 웹에서 따로 얹습니다 (언어중립 + 재사용 위해)
- 스팟 일러스트(섹션용)는 **배경 투명 PNG**, 히어로/배너는 꽉 찬 배경 OK
- 우선순위: ★ 필수 / ○ 있으면 좋음

---

## 공통 아트 디렉션 (모든 이미지에 적용 — 프롬프트 끝에 붙이세요)

> **STYLE (복붙용):**
> *modern flat vector illustration, soft rounded organic shapes, gentle warm pastel palette (blush pink #ff9eb5 and rose #d96e85, sage green #7bae8e, warm cream #fdf9f6, soft lemon #ffe066, light sky blue #9ad7ff), airy soft lighting, lots of negative space, cozy and reassuring Korean parenting-brand mood, friendly minimal faces, inclusive Korean family, no hard black outlines, subtle soft shadows, clean and premium — NOT photorealistic, no text, no letters, no logos, no watermark, not clinical or sterile, no dark tones*

- 모든 이미지를 **같은 도구·같은 스타일**로 만들면 톤이 통일됩니다.
- 사람 묘사 시: 한국인 가족, 따뜻하고 편안한 표정, 과한 디테일 X.

---

## A. 히어로 / 배너

### ★ `img/hero-main.png` — 메인 첫화면 (현재 SVG 일러스트 대체)
- 크기: **1200×900** (4:3), 배경 있어도/투명도 OK
- 용도: index.html 첫 화면 우측
- alt: "임신부와 아기, 따뜻한 일러스트"
- **프롬프트:** `A serene pregnant Korean woman gently cradling her belly with both hands, soft smile, sitting by a sunlit window with a few green plants, a small floating calendar icon and tiny hearts drifting around her, warm and hopeful atmosphere of a 10-month journey toward meeting the baby. ` + STYLE

### ○ `img/hero-jorwon.png` — 전국 산후조리원 페이지 배너
- 크기: **1600×500** (와이드 배너)
- 용도: jorwon-national.html 상단
- alt: "산후조리원에서 휴식하는 산모와 신생아"
- **프롬프트:** `A bright clean cozy postpartum care room, a Korean mother resting peacefully on a comfy bed holding her newborn, soft pastel bedding, a caregiver nurse softly tending a baby crib in the background, plants and warm sunlight, calm premium wellness mood, wide horizontal composition with open space on the left. ` + STYLE

### ○ `img/hero-daycare.png` — 어린이집 페이지 배너
- 크기: **1600×500**
- 용도: gwangjin-daycare.html 상단
- alt: "어린이집에서 노는 아이들"
- **프롬프트:** `Cheerful daycare scene, happy Korean toddlers playing with wooden blocks and soft toys on a rug, a kind teacher smiling, colorful but soft pastel room, plants and round windows, warm friendly mood, wide horizontal composition with open space on one side. ` + STYLE

---

## B. 섹션 스팟 일러스트 (index.html 각 섹션 헤더 옆)
**모두 정사각 ~800×800, 배경 투명 PNG**, 하나의 오브젝트 중심으로 심플하게.

| 파일명 | 섹션 | 핵심 소재 | 우선 |
|---|---|---|:--:|
| `img/sec-timeline.png` | 시기별 체크리스트 | 임신 주차 여정 | ★ |
| `img/sec-food.png` | 음식(좋은·조심할) | 건강한 한 그릇 | ★ |
| `img/sec-supplements.png` | 엽산·철분 | 영양제+잎채소 | ○ |
| `img/sec-meds.png` | 약품 주의 | 약+부드러운 주의 | ○ |
| `img/sec-nausea.png` | 입덧 대응 | 생강차·레몬 | ★ |
| `img/sec-exercise.png` | 운동 | 임산부 요가 | ★ |
| `img/sec-husband-food.png` | 추천 음식·레시피 | 냄비·요리 | ○ |
| `img/sec-partner.png` | 남편 역할 | 곁을 지키는 남편 | ★ |
| `img/sec-welfare.png` | 복지·지원금 | 선물상자+동전+하트 | ★ |
| `img/sec-caution.png` | 임산부 주의사항 | 보호·하트 방패 | ○ |

**프롬프트 (각 항목 + STYLE 붙이기):**
- `sec-timeline`: `A gentle illustration of a pregnancy journey: three soft rounded silhouettes showing a belly growing over time, with a small calendar and tiny footprints, centered single composition on transparent background.`
- `sec-food`: `A wholesome healthy meal bowl for an expecting mother — leafy greens, salmon, tofu, fruit and grains arranged appetizingly, fresh and clean, centered single object on transparent background.`
- `sec-supplements`: `A friendly supplement bottle next to fresh leafy greens and a few iron/folate capsules, gentle and clean, centered single composition on transparent background.`
- `sec-meds`: `A pill blister pack and a single tablet with a soft gentle warning shield-heart, calm and reassuring (not scary), centered single object on transparent background.`
- `sec-nausea`: `A soothing cup of warm ginger tea with lemon slices and a few plain crackers, steam curling softly, comforting morning-sickness relief mood, centered on transparent background.`
- `sec-exercise`: `A pregnant Korean woman doing a calm prenatal yoga pose on a mat, serene and light, centered single figure on transparent background.`
- `sec-husband-food`: `A cozy cooking scene — a pot of nourishing soup, a ladle, fresh ingredients around it, warm homemade mood, centered composition on transparent background.`
- `sec-partner`: `A caring Korean husband gently supporting his pregnant wife with a hand on her shoulder / handing her a warm drink, tender supportive mood, centered duo on transparent background.`
- `sec-welfare`: `A friendly support concept — a gift box with a heart, a few gold coins and a benefit document/voucher, warm and generous mood, centered composition on transparent background.`
- `sec-caution`: `A gentle protective concept for expectant mothers — a soft shield with a heart, small icons of no-smoking and a seatbelt, calm and caring (not alarming), centered on transparent background.`

---

## C. 시기별 단계 아이콘 (4개) ○
- 크기: **500×500**, 배경 투명 PNG, 동그란 배지 느낌으로 통일
- 용도: 시기별 탭(초기/중기/후기/산후) 아이콘
- 파일명/프롬프트:
  - `img/stage-early.png` (초기): `A tiny sprout/seedling with a small heart inside a soft round pastel badge, symbolizing early pregnancy, transparent background.`
  - `img/stage-mid.png` (중기): `A blooming pastel flower with a gentle baby-bump silhouette inside a soft round badge, symbolizing mid pregnancy, transparent background.`
  - `img/stage-late.png` (후기): `A full sunflower with a ready-to-meet baby motif inside a soft round badge, symbolizing late pregnancy, transparent background.`
  - `img/stage-postpartum.png` (산후): `A mother gently holding a newborn inside a soft round badge, symbolizing postpartum, transparent background.`

---

## D. 공유 카드(OG 이미지) ○
### `img/og.png` — 카카오톡/페북 공유 미리보기
- 크기: **1200×630** (정확히)
- 용도: 링크 공유 시 썸네일 (글자는 제가 따로 얹거나, 비워두셔도 됨)
- alt: 자동
- **프롬프트:** `A warm horizontal brand key-visual: a happy Korean mother holding a newborn with a big soft heart and a calendar marked toward 10 months, generous empty space on the left third for a title overlay, cozy premium pastel mood. ` + STYLE

---

## 정리 — 최소부터 만들고 싶다면
1순위(★)만 먼저: `hero-main`, `sec-timeline`, `sec-food`, `sec-nausea`, `sec-exercise`, `sec-partner`, `sec-welfare`
→ 이것만 와도 메인 화면이 확 ‘이미지 사이트’처럼 바뀝니다. 나머지는 차차 추가하면 됩니다.

> 파일을 `img/` 폴더에 넣어 알려주시면, 각 위치에 반응형으로 연결하고 lazy-load·alt까지 세팅하겠습니다. (없는 이미지는 기존 이모지/일러스트로 자동 폴백되게 처리할게요.)
