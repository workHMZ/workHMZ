#!/usr/bin/env python3
"""Preview GitHub-rendered README HTML and serve the static portfolio locally."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[1]
STYLE = '''
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
:root{--bg:#fff;--fg:#1f2328;--line:#d1d9e0;--link:#0969da}html[data-theme=dark]{--bg:#0d1117;--fg:#f0f6fc;--line:#3d444d;--link:#4493f8}
.preview{max-width:966px;margin:24px auto;padding:0 24px;display:flex;justify-content:space-between;gap:16px;font-size:13px;color:var(--fg)}
.preview a{color:var(--link)}article{max-width:966px;margin:0 auto 32px;padding:32px;border:1px solid var(--line);border-radius:6px}
article>picture,article>themed-picture,article>a{display:block;margin:0 0 16px}picture{display:block}img{display:block;max-width:100%;height:auto}
p{margin:0 0 16px}h2{font-size:24px;line-height:1.25;padding-bottom:.3em;border-bottom:1px solid var(--line);margin:24px 0 16px}
a{color:var(--link);text-decoration:none}a:hover{text-decoration:underline}details{margin:20px 0}summary{cursor:pointer}details[open] summary{margin-bottom:16px}
ul{padding-left:2em}li+li{margin-top:.25em}sub{font-size:12px}a:focus-visible,summary:focus-visible{outline:3px solid var(--link);outline-offset:4px}
@media(max-width:640px){.preview{padding:0 16px;margin:16px auto;flex-wrap:wrap}article{padding:16px;border-left:0;border-right:0;border-radius:0}body{font-size:16px}}
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rendered', type=Path, help='An existing response from the GitHub Markdown API')
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    html = args.rendered.read_text() if args.rendered else subprocess.check_output(
        ['gh', 'api', 'markdown', '-X', 'POST', '-f', 'mode=gfm', '-f', 'context=workHMZ/workHMZ', '-F', 'text=@README.md'],
        cwd=ROOT, text=True)

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(ROOT), **kw)

        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path != '/readme':
                return super().do_GET()
            theme = 'light' if parse_qs(parsed.query).get('theme') == ['light'] else 'dark'
            body = (f'<!doctype html><html lang="en" data-theme="{theme}"><head><meta charset="utf-8">'
                    '<meta name="viewport" content="width=device-width,initial-scale=1">'
                    f'<title>H.mz — README preview</title><style>{STYLE}</style></head><body>'
                    '<nav class="preview" aria-label="Preview controls"><span>GitHub-rendered content · local preview</span>'
                    '<span><a href="/readme?theme=light">Light</a> · <a href="/readme?theme=dark">Dark</a> · '
                    '<a href="/">Engineering website</a></span></nav>'
                    f'<article class="markdown-body">{html}</article></body></html>').encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    print(f'README: http://127.0.0.1:{args.port}/readme', flush=True)
    print(f'Website: http://127.0.0.1:{args.port}/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()


if __name__ == '__main__':
    main()
