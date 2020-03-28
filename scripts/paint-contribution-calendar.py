#!/usr/bin/env python3
"""Plan or append the approved 2020-2024 contribution-calendar artwork."""
import argparse
import csv
from datetime import date, timedelta
import io
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'art' / 'contribution-calendar'
LEDGER = 'art/contribution-calendar/pixels.csv'
SOURCES = ['art/contribution-calendar/patterns.json',
           'art/contribution-calendar/README.md',
           'scripts/paint-contribution-calendar.py']
HEADER = 'date,commit_index,pixel_commits\n'


def git(*args, check=True, env=None):
    return subprocess.run(['git', *args], cwd=ROOT, check=check,
                          text=True, capture_output=True, env=env)


def plan():
    patterns = json.loads((ART / 'patterns.json').read_text())
    if set(patterns) != {str(y) for y in range(2020, 2025)}:
        raise ValueError('Only the approved years 2020-2024 are allowed')
    entries = []
    for year, pattern in sorted(patterns.items()):
        rows = pattern['rows']
        width = len(rows[0])
        if (len(rows) != 7 or not 1 <= width <= 49
                or any(len(r) != width or set(r) - set('014') for r in rows)):
            raise ValueError(f'Invalid seven-row pattern: {year}')
        jan1 = date(int(year), 1, 1)
        sunday = jan1 - timedelta(days=(jan1.weekday() + 1) % 7)
        offset = (53 - width) // 2
        for column in range(width):
            for row in range(7):
                count = int(rows[row][column])
                day = sunday + timedelta(weeks=offset + column, days=row)
                if day.year != int(year):
                    raise ValueError('Artwork falls outside its assigned year')
                for step in range(1, count + 1):
                    entries.append((day.isoformat(), step, count))
    return entries


def serialized(entries):
    return HEADER + ''.join(f'{day},{step},{count}\n' for day, step, count in entries)


def apply(entries, base):
    if git('branch', '--show-current').stdout.strip() != 'main':
        raise ValueError('Apply only on the approved main branch')
    if git('remote', 'get-url', 'origin').stdout.strip() != 'git@github-work:workHMZ/workHMZ.git':
        raise ValueError('Unexpected repository remote')
    for key in ('user.name', 'user.email'):
        if not git('config', '--local', '--get', key).stdout.strip():
            raise ValueError(f'Repository-local {key} is required')
    if git('config', '--get', 'commit.gpgsign').stdout.strip() != 'true':
        raise ValueError('Existing commit signing must remain enabled')
    base = git('rev-parse', '--verify', f'{base}^{{commit}}').stdout.strip()
    git('merge-base', '--is-ancestor', base, 'HEAD')
    previous = git('show', f'HEAD:{LEDGER}', check=False)
    completed = []
    if previous.returncode == 0:
        reader = csv.DictReader(io.StringIO(previous.stdout))
        completed = [(r['date'], int(r['commit_index']), int(r['pixel_commits'])) for r in reader]
        if previous.stdout != serialized(completed) or completed != entries[:len(completed)]:
            raise ValueError('Committed ledger does not match the approved plan')
    if int(git('rev-list', '--count', f'{base}..HEAD').stdout) != len(completed):
        raise ValueError('Unexpected commits since the supplied base')
    allowed = set(SOURCES + [LEDGER])
    for line in git('status', '--porcelain', '--untracked-files=all').stdout.splitlines():
        if line[3:] not in allowed:
            raise ValueError(f'Unrelated working tree change: {line[3:]}')
    if completed:
        changed = git('diff', 'HEAD', '--', *SOURCES).stdout
        if changed:
            raise ValueError('Source files changed after drawing started')
    if len(completed) == len(entries):
        print(f'Already complete: {len(entries)} commits; no changes made.')
        return
    for index in range(len(completed), len(entries)):
        day, step, count = entries[index]
        (ROOT / LEDGER).write_text(serialized(entries[:index + 1]))
        git('add', '--', LEDGER, *([] if index else SOURCES))
        env = os.environ.copy()
        env.update(GIT_AUTHOR_DATE=f'{day}T12:00:{step:02d}+09:00',
                   GIT_COMMITTER_DATE=f'{day}T12:00:{step:02d}+09:00')
        try:
            git('commit', '-m', 'art: update calendar', env=env)
        except subprocess.CalledProcessError as error:
            raise RuntimeError(error.stderr.strip()) from error
        if (index + 1) % 50 == 0 or index + 1 == len(entries):
            print(f'Created {index + 1}/{len(entries)} signed art commits', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--base', help='Original HEAD before any art commits')
    args = parser.parse_args()
    entries = plan()
    for year in range(2020, 2025):
        selected = [entry for entry in entries if entry[0].startswith(str(year))]
        print(f'{year}: {len(set(e[0] for e in selected))} pixel days, '
              f'{len(selected)} commits, {selected[0][0]} to {selected[-1][0]}')
    print(f'Total: {len(entries)} commits; no art commits in 2025 or 2026.')
    if args.apply:
        if not args.base:
            parser.error('--apply requires --base')
        apply(entries, args.base)


if __name__ == '__main__':
    main()
