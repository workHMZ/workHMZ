# README typography

Space Grotesk (400 / 700) and IBM Plex Mono (400 / 700), distributed under their included SIL Open Font Licenses.

Sources:
- https://github.com/google/fonts/tree/main/ofl/spacegrotesk
- https://github.com/google/fonts/tree/main/ofl/ibmplexmono

`outlines.json` contains ASCII glyph geometry generated from these bundled font files. The README SVG generator uses this atlas so GitHub does not need installed fonts, embedded font data, or network font requests. The SVG title, description, and labelled text groups retain text equivalents.

Normal artwork generation and verification still use only Python's standard library. To rebuild the atlas after intentionally updating the fonts, use a temporary virtual environment with `fonttools==4.60.1`, then run `python scripts/build-font-outlines.py`.
