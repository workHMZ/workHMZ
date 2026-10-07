#!/usr/bin/env python3
"""Generate the README's self-contained SVG capability and project cards."""
from html import escape
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / 'assets' / 'readme'
THEMES = {
    'dark': dict(bg='#151718', border='#303435', text='#f5f2ee', muted='#b5b8b3', rule='#333736', gold='#d6bf9f', blue='#9abbd6', teal='#8dc7b7', violet='#bcb1d5'),
    'light': dict(bg='#f6f3ed', border='#ded9cf', text='#242623', muted='#62685e', rule='#ded9cf', gold='#846448', blue='#366683', teal='#367261', violet='#72608f'),
}
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
MONO = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"


def text(x, y, value, size, fill, weight=400, anchor='start', mono=False, spacing=0):
    family = MONO if mono else FONT
    return f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}" letter-spacing="{spacing}">{escape(value)}</text>'


def icon(kind, x, y, color, scale=1):
    paths = {
        'documents': '<path d="M-14-13h23v31h-23zM-8-19h23v31M-8-4H3M-8 3H3M-8 10H0"/>',
        'search': '<circle cx="-3" cy="-3" r="12"/><path d="m6 6 12 12M-3-8v10M-8-3H2"/>',
        'answer': '<path d="M-18-15h36v25H-6l-8 7v-7h-4zM-10-6H10M-10 1H3"/>',
        'branch': '<circle cx="-9" cy="-13" r="4"/><circle cx="12" cy="-10" r="4"/><circle cx="-9" cy="14" r="4"/><path d="M-9-9v19M12-6v1C12 4-9 0-9 9"/>',
        'shield': '<path d="M0-19 16-13v13c0 10-9 17-16 21C-7 17-16 10-16 0v-13zM-8 0l6 6L9-7"/>',
        'release': '<path d="m0-18 18 10v21L0 23l-18-10V-8zM-18-8 0 2l18-10M0 2v21M-9-13 9-3v8"/>',
        'trace': '<path d="M-21 11h8V-9h13V3h12V-16h9"/><circle cx="-21" cy="11" r="2"/><circle cx="21" cy="-16" r="2"/>',
        'evaluate': '<path d="M-18-11h36M-18 2h36M-18 15h36"/><circle cx="-5" cy="-11" r="4"/><circle cx="9" cy="2" r="4"/><circle cx="-10" cy="15" r="4"/>',
        'improve': '<path d="M15-7A17 17 0 1 0 16 8M6-7h11V-18M-7 1l5 5 9-11"/>',
        'cloud': '<path d="M-14 14h28a10 10 0 0 0 3-20A17 17 0 0 0-16-3a9 9 0 0 0 2 17z"/>',
        'edge': '<path d="M-14-16h28v32h-28zM-7-8H7M-7 0H7M-7 8H2M-23 0h9M14 0h9"/>',
        'lab': '<path d="m-20-2 20-17 20 17M-14-6v25h28V-6M-5 19V6H5v13"/>',
        'code': '<path d="m-10-13-12 13 12 13m20-26 12 13-12 13M5-20-5 20"/>',
        'share-code': '<rect x="-16" y="-18" width="32" height="36" rx="5"/><path d="M-8-8h3m10 0h3M-8 1h3m10 0h3M-8 10h3m10 0h3"/>',
        'upload': '<path d="M0 9v-27m-9 9 9-9 9 9M-18 5v14h36V5"/>',
        'download': '<path d="M0-18V9m-9-9 9 9 9-9M-18 5v14h36V5"/>',
    }
    return f'<g transform="translate({x} {y}) scale({scale})" fill="none" stroke="{color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{paths[kind]}</g>'


def svg(width, height, title, desc, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title>
<desc id="desc">{escape(desc)}</desc>
{body}
</svg>
'''


FOCUS = [
    ('01', 'AI & RAG Platforms', 'Knowledge in. Useful answers out.', 'gold',
     ['documents', 'search', 'answer'], ['Documents', 'Retrieval', 'Answers'], 'Bedrock · Dify · OpenSearch'),
    ('02', 'CI/CD & DevSecOps', 'A repeatable path from code to release.', 'blue',
     ['branch', 'shield', 'release'], ['Commit', 'Scan & sign', 'Release'], 'GitHub Actions · Docker · Cosign'),
    ('03', 'Evaluation & Observability', 'See what happened. Find what to improve.', 'violet',
     ['trace', 'evaluate', 'improve'], ['Trace', 'Evaluate', 'Improve'], 'Langfuse · Datadog · Terraform'),
    ('04', 'Cloud & Edge Platforms', 'Connect services. Keep boundaries clear.', 'teal',
     ['cloud', 'edge', 'lab'], ['Cloud', 'Edge', 'Private lab'], 'AWS · Azure · GCP · Cloudflare'),
]


def focus_card(item, x, y, p):
    number, title, caption, hue, symbols, labels, tools = item
    color = p[hue]
    parts = [f'<g transform="translate({x} {y})">',
             f'<rect x="1" y="1" width="586" height="346" rx="12" fill="{p["bg"]}" stroke="{p["border"]}"/>',
             text(30, 46, number, 16, color, mono=True),
             text(72, 46, title, 27, p['text'], 600)]
    if number == '01':
        parts += [text(30, 108, '43% → 65%', 38, color, 600),
                  text(263, 104, 'search success', 21, p['muted'])]
    elif number == '02':
        parts += [text(30, 108, '~60%', 38, color, 600),
                  text(158, 104, 'less time to deploy', 21, p['muted'])]
    else:
        parts += [text(30, 89, caption, 21, p['muted'])]
    centers = [88, 294, 500]
    for a, b in zip(centers, centers[1:]):
        parts += [f'<path d="M{a+34} 176H{b-37}" stroke="{color}" stroke-width="1.6" fill="none"/>',
                  f'<path d="m{b-43} 171 6 5-6 5" stroke="{color}" stroke-width="1.6" fill="none"/>']
    for cx, symbol, label in zip(centers, symbols, labels):
        parts += [f'<rect x="{cx-35}" y="141" width="70" height="70" rx="18" fill="{color}" fill-opacity=".09" stroke="{color}" stroke-opacity=".45"/>',
                  icon(symbol, cx, 176, color), text(cx, 246, label, 21, p['text'], 500, anchor='middle')]
    parts += [f'<path d="M30 281H558" stroke="{p["rule"]}"/>',
              text(30, 318, tools, 20, p['muted']), '</g>']
    return '\n'.join(parts)


def focus(theme, mobile):
    p = THEMES[theme]
    locations = [(0, i * 364) for i in range(4)] if mobile else [(0, 0), (612, 0), (0, 372), (612, 372)]
    body = '\n'.join(focus_card(item, *loc, p) for item, loc in zip(FOCUS, locations))
    return svg(588 if mobile else 1200, 1440 if mobile else 720,
               'Focus areas — what I build and run',
               'RAG search success improved from 43% to 65%. Deployment time reduced by about 60%. RAG: documents to retrieval to answers. Delivery: commit, scan and sign, release. Observability: trace, evaluate, improve. Infrastructure: cloud, edge and private lab.', body)


PROJECTS = {
    'vertex': ('Vertex2OpenAI', 'OpenAI clients → Vertex AI Gemini', 'code', 'gold'),
    'delivery': ('RAG Delivery Lab', 'Build → Scan → Sign → Deploy', 'shield', 'blue'),
    'r2filebox': ('R2FileBox', 'Upload → Share code → Download', 'release', 'teal'),
}


def project(key, theme, mobile):
    title, caption, symbol, hue = PROJECTS[key]
    p = THEMES[theme]
    color = p[hue]
    width, height = (588, 220) if mobile else (1200, 188)
    body = [f'<rect x="1" y="1" width="{width-2}" height="{height-2}" rx="12" fill="{p["bg"]}" stroke="{p["border"]}"/>']
    if mobile:
        body += [icon(symbol, 47, 45, color, .7), text(82, 50, 'OPEN SOURCE', 16, p['muted'], mono=True, spacing=1),
                 text(30, 114, title, 37, p['text'], 600), text(30, 161, caption, 24, p['muted'])]
    else:
        body += [f'<rect x="32" y="46" width="88" height="88" rx="22" fill="{color}" fill-opacity=".09"/>',
                 icon(symbol, 76, 90, color, 1.3), text(152, 51, 'OPEN SOURCE', 14, p['muted'], mono=True, spacing=2),
                 text(150, 98, title, 39, p['text'], 600), text(152, 139, caption, 24, p['muted'])]
        if key == 'vertex':
            for bx, label in [(758, '/v1'), (944, 'Gemini')]:
                body += [f'<rect x="{bx}" y="66" width="133" height="54" rx="8" fill="none" stroke="{color}" stroke-opacity=".65"/>',
                         text(bx+66, 100, label, 22, color, 500, anchor='middle', mono=True)]
            body += [f'<path d="M900 93H934m-7-5 7 5-7 5" stroke="{color}" stroke-width="1.5" fill="none"/>']
        elif key == 'delivery':
            body += [f'<path d="M807 93H864M929 93H986" stroke="{color}" stroke-width="1.5" fill="none"/>',
                     icon('branch', 780, 93, color, 1.1), icon('shield', 897, 93, color, 1.1), icon('release', 1017, 93, color, 1.1)]
        else:
            body += [f'<path d="M807 93H864M929 93H986" stroke="{color}" stroke-width="1.5" fill="none"/>',
                     icon('upload', 780, 93, color, 1.1), icon('share-code', 897, 93, color, 1.1), icon('download', 1017, 93, color, 1.1)]
    ax, ay = (536, 47) if mobile else (1143, 93)
    body += [f'<circle cx="{ax}" cy="{ay}" r="23" fill="{color}" fill-opacity=".12"/>',
             f'<path d="M{ax-8} {ay+8}l16-16m-16 0h16v16" fill="none" stroke="{color}" stroke-width="1.8"/>']
    return svg(width, height, title, caption + '. View the project on GitHub.', '\n'.join(body))


if __name__ == '__main__':
    ASSETS.mkdir(parents=True, exist_ok=True)
    for theme in THEMES:
        for mobile in [False, True]:
            suffix = f'{theme}{"-mobile" if mobile else ""}'
            (ASSETS / f'focus-{suffix}.svg').write_text(focus(theme, mobile))
            for key in PROJECTS:
                (ASSETS / f'project-{key}-{suffix}.svg').write_text(project(key, theme, mobile))
    print(f'Generated {(1 + len(PROJECTS)) * len(THEMES) * 2} SVGs: light/dark and desktop/mobile capability and project cards.')
