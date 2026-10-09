#!/usr/bin/env python3
"""Generate self-contained README artwork with no external fonts or dependencies."""
from html import escape
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / 'assets' / 'readme'
PAPER, INK, MUTED, LINE = '#f3f0e7', '#242522', '#616358', '#d2cfc3'
LIME, PURPLE, NIGHT = '#dafa78', '#b9a4e5', '#252825'
FONT, MONO = 'Arial, Helvetica, sans-serif', "'Courier New', monospace"


def text(x, y, value, size=24, fill=INK, weight=400, mono=False, spacing=0):
    return (f'<text x="{x}" y="{y}" font-family="{MONO if mono else FONT}" '
            f'font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'letter-spacing="{spacing}">{escape(value)}</text>')


def rect(x, y, w, h, fill, stroke=None, radius=0):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"' +
            (f' stroke="{stroke}"' if stroke else '') + '/>')


def rule(x, y, w, color=LINE):
    return f'<path d="M{x} {y}h{w}" stroke="{color}"/>'


def arrow(x, y, size=28, color=INK):
    return (f'<path d="M{x} {y+size}l{size}-{size}m-{size} 0h{size}v{size}" '
            f'fill="none" stroke="{color}" stroke-width="3"/>')


def star(x, y, size, color):
    paths = ''.join(f'<path d="M0 -{size}V{size}" transform="rotate({a})"/>' for a in [0, 45, 90, 135])
    return f'<g transform="translate({x} {y})" stroke="{color}" stroke-width="7">{paths}</g>'


def svg(w, h, title, description, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'role="img" aria-labelledby="title desc">\n<title id="title">{escape(title)}</title>\n'
            f'<desc id="desc">{escape(description)}</desc>\n' + '\n'.join(body) + '\n</svg>\n')


def cover(mobile):
    w, h = (640, 488) if mobile else (1200, 406)
    pad = 36 if mobile else 48
    body = [rect(1, 1, w-2, h-2, PAPER, LINE, 4), text(pad, 66, 'H.mz', 42, weight=800, spacing=-2), rect(pad+114, 53, 9, 9, PURPLE)]
    if mobile:
        body += [text(pad, 106, 'AKIRA / AI PLATFORM ENGINEER', 23, MUTED, mono=True), star(568, 61, 22, INK),
                 rule(pad, 133, w-pad*2), text(pad-2, 220, 'Build things.', 66, weight=800, spacing=-3),
                 rect(pad-2, 240, 570, 78, LIME), text(pad-2, 302, 'Make them work.', 66, weight=800, spacing=-3),
                 text(pad, 366, 'AI systems. Useful tools.', 27), text(pad, 405, 'And a little life outside the terminal.', 25),
                 rule(pad, 435, w-pad*2), text(pad, 465, 'CODE / CAMERA / CURIOSITY', 17, MUTED, mono=True)]
    else:
        body += [text(244, 59, 'AKIRA / AI PLATFORM ENGINEER', 19, MUTED, mono=True),
                 text(996, 59, 'BASED IN JAPAN', 17, MUTED, mono=True), rule(pad, 92, 1104),
                 text(44, 188, 'Build things.', 86, weight=800, spacing=-4), rect(44, 214, 741, 91, LIME),
                 text(44, 285, 'Make them work.', 86, weight=800, spacing=-4), '<g transform="rotate(7 1003 208)">',
                 rect(903, 127, 208, 179, INK), rect(895, 119, 208, 179, PURPLE, INK),
                 text(919, 169, 'CODE', 31, weight=700), text(919, 215, 'CAMERA', 31, weight=700),
                 text(919, 261, 'CURIOSITY', 25, weight=700), '</g>', rule(pad, 339, 1104),
                 text(pad, 375, 'AI systems. Useful tools. A little life outside the terminal.', 23), star(1122, 369, 15, INK)]
    return svg(w, h, 'H.mz — Akira, AI Platform Engineer in Japan', 'Build things. Make them work. Code, camera and curiosity.', body)


def entry(kind, mobile):
    work = kind == 'work'
    w, h = (640, 326) if mobile else (1200, 202)
    bg, fg, muted = (NIGHT, PAPER, '#c0c6b5') if work else (PAPER, INK, MUTED)
    pad = 36 if mobile else 48
    kicker = '01 / ENGINEERING' if work else '02 / FIELD NOTES'
    title = 'The work, in detail.' if work else 'Beyond the terminal.'
    domain = 'workhmz.github.io/workHMZ' if work else 'profile.mingzhe.uk'
    caption = 'Projects, systems & engineering expertise.' if work else 'Photos, everyday life & a personal lab.'
    body = [rect(1, 1, w-2, h-2, bg, '#4b5145' if work else LINE, 4),
            text(pad, 43, kicker, 17, LIME if work else MUTED, mono=True, spacing=1)]
    if mobile:
        body += [text(pad-1, 106, title, 43, fg, 700, spacing=-1.5), text(pad, 151, 'Projects, systems &' if work else 'Photos, everyday life', 28, muted),
                 text(pad, 189, 'engineering expertise.' if work else 'and a personal lab.', 28, muted),
                 rule(pad, 230, w-pad*2, '#4b5145' if work else LINE), text(pad, 282, domain, 23, muted, mono=True),
                 arrow(567, 257, 28, LIME if work else INK)]
    else:
        body += [text(pad-2, 101, title, 48, fg, 700, spacing=-1.5), text(pad, 145, caption, 24, muted),
                 text(806 if work else 870, 173, domain, 18, muted, mono=True)]
        if work:
            body += [rect(1063, 39, 90, 90, LIME), arrow(1093, 69, 30)]
        else:
            body += ['<g transform="rotate(-6 1095 78)">', rect(1056, 31, 98, 100, INK),
                     rect(1050, 25, 98, 100, LIME, INK), text(1067, 99, 'H*', 57, INK, 800), '</g>']
    return svg(w, h, title, f'{kicker}. {caption} Visit {domain}.', body)


PROJECTS = {
    'vertex': dict(number='01', title='Vertex2OpenAI', category='AI / API COMPATIBILITY', accent=LIME,
                   lines=['Use Gemini from the tools', 'you already work with.'],
                   detail='Streaming, tool calls & credential rotation.', stack='TypeScript / Cloudflare Workers'),
    'rag': dict(number='02', title='RAG Delivery Lab', category='AI / RETRIEVAL & DELIVERY', accent=PURPLE,
                lines=['A RAG service, from search', 'to a repeatable release.'],
                detail='Local embeddings, hybrid search & citations.', stack='Python / Azure AI Search / Container Apps'),
    'filebox': dict(number='03', title='R2FileBox', category='PRODUCT / FILE SHARING', accent='#9bc8ba',
                    lines=['A file. A pickup code.', 'A simpler way to share.'],
                    detail='Resumable uploads. Expiring shares.', stack='Vue / Workers / R2 / D1'),
}


def project_detail(key, x, y, w, h):
    """Show implementation contracts, never fabricated application screenshots."""
    accent = PROJECTS[key]['accent']
    body = [f'<g transform="translate({x} {y})">', rect(0, 0, w, h, NIGHT, radius=3)]
    if key == 'vertex':
        body += [text(24, 34, 'ONE COMPATIBILITY LAYER', 15, accent, mono=True, spacing=.5), rule(24, 52, w-48, '#4b5145'),
                 text(24, 86, '/v1/chat/completions', 23, PAPER, mono=True), text(24, 121, '/v1/responses', 23, PAPER, mono=True),
                 '<path d="M34 143v26m-6-6 6 6 6-6" fill="none" stroke="#dafa78" stroke-width="2"/>',
                 text(58, 166, 'Vertex AI / Gemini', 22, LIME, 600), text(24, 210, 'Existing clients. A different backend.', 16, '#c0c6b5')]
    elif key == 'rag':
        body += [text(24, 34, 'RETRIEVAL + RELEASE', 15, PURPLE, mono=True, spacing=.5), rule(24, 52, w-48, '#4b5145')]
        for i, (label, value) in enumerate([('EMBED', 'ONNX / multilingual'), ('SEARCH', 'Hybrid + semantic ranking'),
                                           ('ANSWER', 'Structured output + citations'), ('SHIP', 'Canary + rollback')]):
            yy = 83 + i*40
            body += [text(24, yy, label, 15, PURPLE, mono=True), text(121, yy, value, 18, PAPER)]
    else:
        body += [text(24, 34, 'SMALL INTERFACE. REAL ENGINEERING.', 15, accent, mono=True), rule(24, 52, w-48, '#4b5145'),
                 text(24, 89, 'UPLOAD', 15, '#c0c6b5', mono=True), text(152, 91, 'Resume interrupted transfers', 19, PAPER),
                 text(24, 132, 'SHARE', 15, '#c0c6b5', mono=True), text(152, 134, 'A code, link or QR', 19, PAPER),
                 text(24, 175, 'STORE', 15, '#c0c6b5', mono=True), text(152, 177, 'Deduplicate the content', 19, PAPER),
                 text(24, 215, 'Independent shares. Automatic expiry.', 16, accent)]
    return body + ['</g>']


def project(key, mobile):
    p = PROJECTS[key]
    w, h = (640, 360) if mobile else (1200, 338)
    pad = 36 if mobile else 48
    body = [rect(1, 1, w-2, h-2, PAPER, LINE, 4), rect(1, 1, 6, h-2, p['accent']),
            text(pad, 42, f'{p["number"]} / {p["category"]}', 16, MUTED, mono=True, spacing=.3),
            text(pad-2, 97, p['title'], 42 if mobile else 44, INK, 700, spacing=-1.6), arrow(w-66, 23, 22)]
    if mobile:
        body += [text(pad, 141, p['lines'][0], 30), text(pad, 182, p['lines'][1], 30), text(pad, 225, p['detail'], 25, MUTED)]
        body += [rule(pad, 253, w-pad*2)]
        body += [text(pad, 290, p['stack'], 23, MUTED), text(pad, 330, 'EXPLORE THE REPOSITORY', 23, INK, 700, mono=True)]
    else:
        body += [text(pad, 145, p['lines'][0], 27), text(pad, 181, p['lines'][1], 27), text(pad, 221, p['detail'], 20, MUTED),
                 text(pad, 270, p['stack'], 18, MUTED), text(pad, 307, 'EXPLORE THE REPOSITORY', 16, INK, 700, mono=True)]
        body += project_detail(key, 651, 67, 501, 238)
    return svg(w, h, p['title'], ' '.join(p['lines'])+' '+p['detail']+' View the source on GitHub.', body)


def outputs():
    files = {}
    for mobile in [False, True]:
        suffix = '-mobile' if mobile else ''
        files[f'cover{suffix}.svg'] = cover(mobile)
        for kind in ['work', 'life']:
            files[f'entry-{kind}{suffix}.svg'] = entry(kind, mobile)
        for key in PROJECTS:
            files[f'project-{key}{suffix}.svg'] = project(key, mobile)
    return files


if __name__ == '__main__':
    ASSETS.mkdir(parents=True, exist_ok=True)
    for name, contents in outputs().items():
        (ASSETS / name).write_text(contents, encoding='utf-8')
    print('Generated 12 SVGs: desktop and mobile, one shared visual system.')
