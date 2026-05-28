# ByungKwanLee-CV

Personal homepage + LaTeX CV in one repo.

**Live site:** https://byungkwanlee.github.io/ByungKwanLee-CV/

## Daily update (one push)

1. Edit `main.tex` and/or `docs/index.html` (and paper thumbnails under `docs/assets/papers/` if needed).
2. `git add -A && git commit -m "..." && git push`
3. Wait ~2 minutes, then open the live site (or **View CV** on the site). No `git pull` needed.

GitHub Actions rebuilds `docs/Byung-Kwan-Lee-CV.pdf` from `main.tex` and updates the CV link cache buster automatically.

Details: [docs/README.md](docs/README.md)
