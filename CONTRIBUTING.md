# Maintaining the profile

Keep the three surfaces distinct:

- **README:** the entrance. A short introduction, selected work, and one clear link to each website.
- **GitHub Pages:** the engineering portfolio. Project details, implementation decisions, professional experience, and where I can help. Its source is `index.html`, `style.css`, `script.js`, and `i18n.js`.
- **Field Notes:** photography, everyday life, and the personal lab at [profile.mingzhe.uk](https://profile.mingzhe.uk/). This separate site is not maintained in this repository.

Use concrete project behavior and public evidence. Keep professional project results separate from open-source project claims. Update English and Japanese copy together.

## Edit and preview

Edit `scripts/generate-readme-visuals.py`, then regenerate the SVGs. Do not patch generated artwork by hand.

```sh
python3 scripts/generate-readme-visuals.py
python3 scripts/verify.py
python3 scripts/preview-readme.py
```

The preview uses the GitHub Markdown API and requires an authenticated `gh` CLI (`gh auth status`). Open [the README preview](http://127.0.0.1:8765/readme) or [the engineering website](http://127.0.0.1:8765/). Add `--port 8766` if needed; stop the server with Ctrl+C.

To reuse a rendered response offline, save it once from the repository root:

```sh
gh api markdown -X POST -f mode=gfm -f context=workHMZ/workHMZ -F text=@README.md > /tmp/workhmz-readme.html
python3 scripts/preview-readme.py --rendered /tmp/workhmz-readme.html
```

Refresh that saved response after editing the README. The local shell approximates GitHub's layout; check the actual GitHub rendering before claiming visual parity.

## Check the change

`scripts/verify.py` uses Python's standard library, Node.js, and Git. It checks local references and anchors, safe SVG structure, generated artwork consistency, JavaScript syntax, and whitespace. There is no `package.json` or `npm run verify`; no package installation is needed.

For visual changes, inspect the affected sections in light and dark themes, English and Japanese, and narrow portrait and landscape layouts. Check text size, clipping, keyboard focus, and where each link goes. Update `og-card.html` and its rendered `og-card.png` together when the sharing card changes.

A simulated iPhone viewport checks layout. Desktop Safari checks that browser. Neither is a real iPhone Safari check; report the device and browser actually used.
