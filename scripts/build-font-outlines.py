#!/usr/bin/env python3
"""Build a portable ASCII glyph atlas; requires fonttools==4.60.1 only here."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'assets' / 'fonts'
atlas = {}
for key, filename, weight in [
    ('sans-regular', 'SpaceGrotesk.ttf', 400),
    ('sans-bold', 'SpaceGrotesk.ttf', 700),
    ('mono-regular', 'IBMPlexMono-Regular.ttf', None),
    ('mono-bold', 'IBMPlexMono-Bold.ttf', None),
]:
    font = TTFont(FONTS / filename)
    if weight:
        font = instantiateVariableFont(font, {'wght': weight})
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    item = {'units': font['head'].unitsPerEm, 'glyphs': {}}
    for code in range(32, 127):
        glyph = glyphs[cmap[code]]
        pen = SVGPathPen(glyphs, ntos=lambda n: format(n, '.3f').rstrip('0').rstrip('.') if n else '0')
        glyph.draw(pen)
        item['glyphs'][chr(code)] = [glyph.width, pen.getCommands()]
    atlas[key] = item
(FONTS / 'outlines.json').write_text(json.dumps(atlas, separators=(',', ':')) + '\n')
print('Built portable glyph outlines for Space Grotesk and IBM Plex Mono.')
