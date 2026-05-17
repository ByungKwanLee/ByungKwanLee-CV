# Byung-Kwan Lee — Personal Homepage (GitHub Pages)

Personal academic homepage built from CV, designed in a soft sage/teal pastel palette.

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

The "CV" download button in the top-right corner of the site points to
`docs/Byung-Kwan-Lee-CV.pdf`. This file is regenerated automatically by the
GitHub Action defined in `.github/workflows/build-cv.yml` whenever
`main.tex`, `latexmkrc`, or the header images at repo root are pushed.

The action compiles `main.tex` with `pdflatex` inside a TeX Live container,
copies the resulting PDF into `docs/`, and commits it back to the same branch
with the message `ci: rebuild CV PDF [skip ci]`.

To trigger a manual rebuild without changing anything, go to
**Actions → Build CV PDF → Run workflow**.

## Customization

All colors are defined as CSS variables at the top of `styles.css` (under `:root`). Change one HEX value to recolor the entire site.

| Token | Default | Purpose |
|---|---|---|
| `--primary`     | `#2D3E40` | headings, name |
| `--accent`      | `#A8C5BF` | accent lines, borders |
| `--accent-dark` | `#4F8077` | links, hyperlinks |
| `--nvidia`      | `#76B900` | NVIDIA brand color |
