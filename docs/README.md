# Byung-Kwan Lee — Personal Homepage (GitHub Pages)

Personal academic homepage built from CV, designed in a soft sage/teal pastel palette.

## Daily update (one push) — 운영 루틴

**로컬에서 `git pull` 할 필요 없음.** push 한 번이면 웹사이트·CV PDF가 자동으로 맞춰짐.

1. 수정: `main.tex` (PDF 이력서), `docs/index.html` (홈페이지), 필요 시 `docs/assets/papers/`
2. 커밋 & push: `git add -A && git commit -m "..." && git push`
3. 1~2분 후 **라이브 URL**에서 확인  
   - 홈: https://byungkwanlee.github.io/ByungKwanLee-CV/  
   - CV: 상단 **View CV** 버튼 (또는 `.../Byung-Kwan-Lee-CV.pdf`)

`main.tex`를 push하면 GitHub Actions가 PDF를 다시 만들고, **View CV** 링크에 캐시 버스터(`?v=...`)를 붙여 브라우저가 예전 PDF를 물고 있지 않게 함.

| 확인 위치 | pull 필요? |
|---|---|
| GitHub Pages (위 URL) | 아니오 — push만 하면 됨 |
| 로컬 `docs/Byung-Kwan-Lee-CV.pdf` 파일 직접 열기 | 가끔 — CI 커밋이 늦게 들어올 수 있음. 웹에서 보면 pull 불필요 |

## File structure

```
docs/
├── index.html              # main page (single-file site)
├── styles.css              # sage/teal pastel theme
├── assets/
│   ├── profile.jpg         # hero photo
│   ├── nvidia.svg          # high-res NVIDIA logo (vector)
│   └── papers/             # paper teaser thumbnails (140×100 crop)
│       ├── vlsi.png
│       ├── genrecal.png
│       ├── ril.png
│       ├── rtap.png
│       ├── refinebench.png
│       ├── dstp.png
│       ├── phantom.png
│       ├── trol.png
│       ├── meteor.png
│       ├── moai.png
│       ├── collavo.png
│       ├── cus.png
│       ├── ddml.png
│       ├── cai.png
│       ├── mad.png
│       ├── aib.png
│       └── hbd.png
└── README.md
```

For papers without teaser images (Hide to See, MTRS, MultiVerse, C2Cap), the page
falls back to a stylish CSS gradient "venue card" showing the conference name + year.
To upgrade any of them, just drop a PNG/JPG into `assets/papers/{slug}.png` and
change the `<div class="pub-thumb venue-card …">` element to
`<div class="pub-thumb"><img src="assets/papers/{slug}.png" alt="…" /></div>`.

## How to deploy on GitHub Pages

### Option A: From the existing repo (`ByungKwanLee/ByungKwanLee-CV`)

1. Push the `docs/` folder to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick branch `master` (or `main`) and folder `/docs`. Save.
5. Wait ~1 minute. Site goes live at:
   `https://byungkwanlee.github.io/ByungKwanLee-CV/`

### Option B: Dedicated repo (recommended URL: `byungkwanlee.github.io`)

1. Create a new repo named exactly `byungkwanlee.github.io`.
2. Copy `index.html`, `styles.css`, and `assets/` to the repo root.
3. Push to `main` branch. Site is automatically published at:
   `https://byungkwanlee.github.io/`

## Local preview

```bash
cd docs
python -m http.server 8000
# open http://localhost:8000
```

## CV PDF auto-build

The **View CV** button points to `docs/Byung-Kwan-Lee-CV.pdf` (with a `?v=<git-sha>`
cache buster updated by CI). The PDF is regenerated automatically by
`.github/workflows/build-cv.yml` when you push changes to `main.tex`, `latexmkrc`,
or header images at repo root.

The action compiles `main.tex`, copies the PDF into `docs/`, bumps the cache buster
on the CV link in `index.html`, and commits both with `ci: rebuild CV PDF [skip ci]`.

Manual rebuild: **Actions → Build CV PDF → Run workflow**.

## Application buttons (Gmail compose)

The Collaboration / Application cards in `docs/index.html` open a pre-filled
Gmail compose window (`https://mail.google.com/mail/?view=cm&...`) addressed to
`byungkwanl@nvidia.com`. The visitor attaches their resume and sends it
themselves — no backend, API key, or server is required.

## Customization

All colors are defined as CSS variables at the top of `styles.css` (under `:root`). Change one HEX value to recolor the entire site.

| Token | Default | Purpose |
|---|---|---|
| `--primary`     | `#2D3E40` | headings, name |
| `--accent`      | `#A8C5BF` | accent lines, borders |
| `--accent-dark` | `#4F8077` | links, hyperlinks |
| `--nvidia`      | `#76B900` | NVIDIA brand color |
