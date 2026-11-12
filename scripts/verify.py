#!/usr/bin/env python3
"""Check the static portfolio without installing third-party packages."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import runpy
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ERRORS = []


def fail(message):
    ERRORS.append(message)


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.ids = set()
        self.references = []
        self.i18n_keys = set()
        self.json_ld = []
        self._in_json_ld = False
        self._buf = []
        self.source = source

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                fail(f'{self.source}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        for name in ('href', 'src'):
            if attrs.get(name):
                self.references.append(attrs[name])
        if attrs.get('srcset'):
            self.references.extend(item.strip().split()[0]
                                   for item in attrs['srcset'].split(',') if item.strip())
        for name in ('data-i18n', 'data-i18n-html'):
            if attrs.get(name):
                self.i18n_keys.add(attrs[name])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self._in_json_ld = True
            self._buf = []

    def handle_data(self, data):
        if self._in_json_ld:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self._in_json_ld:
            self._in_json_ld = False
            self.json_ld.append(''.join(self._buf))


def read_document(path):
    document = Document(path.relative_to(ROOT))
    document.feed(path.read_text(encoding='utf-8'))
    return document


def check_references(path):
    document = read_document(path)
    if path.suffix == '.md':
        document.references.extend(re.findall(r'!?\[[^\]]*\]\(([^\s)]+)\)', path.read_text(encoding='utf-8')))
    for reference in document.references:
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc:
            continue
        target = ((ROOT / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/')
                  else path.parent / unquote(parsed.path)) if parsed.path else path
        target = target.resolve()
        if not target.is_relative_to(ROOT):
            fail(f'{path.name}: reference leaves the repository: {reference}')
            continue
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            fail(f'{path.name}: missing local reference: {reference}')
        elif parsed.fragment and target.suffix == '.html':
            ids = document.ids if target == path else read_document(target).ids
            if unquote(parsed.fragment) not in ids:
                fail(f'{path.name}: missing anchor: {reference}')


def check_svg(path):
    source = path.read_text(encoding='utf-8')
    label = path.relative_to(ROOT)
    if re.search(r'<!\s*(?:DOCTYPE|ENTITY)\b', source, re.I):
        fail(f'{label}: DTDs and entities are not allowed')
        return
    try:
        root = ET.fromstring(source)
    except ET.ParseError as error:
        fail(f'{label}: invalid XML: {error}')
        return
    if root.tag != '{http://www.w3.org/2000/svg}svg':
        fail(f'{label}: expected an SVG root and namespace')
    forbidden = {'script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video',
                 'animate', 'animatemotion', 'animatetransform', 'set', 'discard'}
    ids = {element.attrib['id'] for element in root.iter() if 'id' in element.attrib}
    for element in root.iter():
        tag = element.tag.rsplit('}', 1)[-1].lower()
        if tag in forbidden:
            fail(f'{label}: active element <{tag}> is not allowed')
        for attribute, value in element.attrib.items():
            name = attribute.rsplit('}', 1)[-1].lower()
            if name.startswith('on'):
                fail(f'{label}: event attribute {name} is not allowed')
            if attribute == '{http://www.w3.org/XML/1998/namespace}base':
                fail(f'{label}: XML base overrides are not allowed')
            if name in {'href', 'src'} and not value.startswith('#'):
                fail(f'{label}: artwork must not load external resources')
            elif name in {'href', 'src'} and value[1:] not in ids:
                fail(f'{label}: missing SVG fragment {value}')
        values = ' '.join(element.attrib.values()) + ' ' + (element.text or '')
        if re.search(r'@import|javascript\s*:|expression\s*\(', values, re.I):
            fail(f'{label}: active or imported content is not allowed')
        for reference in re.findall(r'url\(\s*([^)]+)\)', values, re.I):
            reference = reference.strip(' \t\r\n\"\'')
            if not reference.startswith('#'):
                fail(f'{label}: artwork must use local fragment references')
            elif reference[1:] not in ids:
                fail(f'{label}: missing SVG fragment {reference}')


def check_artwork():
    directory = ROOT / 'assets' / 'readme'
    generated = runpy.run_path(str(ROOT / 'scripts' / 'generate-readme-visuals.py'))['outputs']()
    actual = {path.name for path in directory.glob('*.svg')}
    if actual != set(generated):
        fail(f'Artwork files differ from the generator: {sorted(actual ^ set(generated))}')
    for name, expected in generated.items():
        path = directory / name
        if path.is_file() and path.read_text(encoding='utf-8') != expected:
            fail(f'{path.relative_to(ROOT)}: regenerate artwork before committing')
    for path in sorted(ROOT.rglob('*.svg')):
        if '.git' not in path.parts:
            check_svg(path)


def run(command):
    if not shutil.which(command[0]):
        fail(f'{command[0]} is required for this check')
        return
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        fail(f'{" ".join(command)} failed:\n{result.stdout}{result.stderr}'.rstrip())


def check_portfolio_data(index_doc):
    for raw in index_doc.json_ld:
        try:
            payload = json.loads(raw)
            if not isinstance(payload, dict) or '@context' not in payload or '@type' not in payload:
                fail('index.html: JSON-LD must contain @context and @type')
        except json.JSONDecodeError as error:
            fail(f'index.html: invalid JSON-LD: {error}')
    if not shutil.which('node'):
        fail('node is required for this check')
        return
    probe = (
        "const fs=require('fs'),vm=require('vm');"
        "const ctx={window:{}};"
        "vm.runInNewContext(fs.readFileSync('i18n.js','utf8'),ctx);"
        "vm.runInNewContext(fs.readFileSync('calendar-data.js','utf8'),ctx);"
        "const i=ctx.window.PORTFOLIO_I18N,c=ctx.window.CALENDAR;"
        "console.log(JSON.stringify({jaText:Object.keys(i.ja.text),enUi:Object.keys(i.en.ui),"
        "jaUi:Object.keys(i.ja.ui),enCal:Object.keys(i.en.calendar),jaCal:Object.keys(i.ja.calendar),"
        "calYears:Object.keys(c.years)}));"
    )
    result = subprocess.run(['node', '-e', probe], cwd=ROOT, text=True, capture_output=True)
    if result.returncode:
        fail(f'portfolio data evaluation failed:\n{result.stdout}{result.stderr}'.rstrip())
        return
    data = json.loads(result.stdout)
    ja_keys = set(data['jaText'])
    missing = sorted(index_doc.i18n_keys - ja_keys)
    unused = sorted(ja_keys - index_doc.i18n_keys)
    if missing:
        fail(f'i18n.js: missing Japanese translations for {missing}')
    if unused:
        fail(f'i18n.js: unused Japanese translation keys {unused}')
    if set(data['enUi']) != set(data['jaUi']):
        fail(f'i18n.js: en.ui and ja.ui keys differ: {sorted(set(data["enUi"]) ^ set(data["jaUi"]))}')
    if set(data['enCal']) != set(data['jaCal']):
        fail(f'i18n.js: en.calendar and ja.calendar keys differ')
    if not set(data['enCal']).issubset(set(data['calYears'])):
        fail('calendar-data.js: missing years referenced in i18n.js')


def main():
    check_artwork()
    for name in ('README.md', 'index.html', 'og-card.html'):
        check_references(ROOT / name)
    check_portfolio_data(read_document(ROOT / 'index.html'))
    for name in ('script.js', 'i18n.js', 'calendar-data.js'):
        run(['node', '--check', name])
    run(['git', 'diff', '--check'])
    run(['git', 'diff', '--cached', '--check'])
    if ERRORS:
        print('\n'.join(f'FAIL: {error}' for error in ERRORS), file=sys.stderr)
        return 1
    print('Verified: SVG safety and generation, local references and anchors, i18n parity, JSON-LD, JavaScript syntax, Git whitespace.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
