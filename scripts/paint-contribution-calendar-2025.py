#!/usr/bin/env python3
"""Append the approved 2025 art without changing any existing contributions."""
import argparse
from collections import Counter
from datetime import date, timedelta
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PLAN = 'art/contribution-calendar/2025.json'
LEDGER = 'art/contribution-calendar/pixels-2025.csv'
SOURCES = [PLAN, 'art/contribution-calendar/README.md',
           'scripts/paint-contribution-calendar-2025.py']


def git(*args, check=True, env=None):
    return subprocess.run(['git', *args], cwd=ROOT, check=check,
                          text=True, capture_output=True, env=env)


def plan():
    data = json.loads((ROOT / PLAN).read_text())
    rows, baseline = data['rows'], data['baseline']
    if data['year'] != 2025 or len(rows) != 7 or any(
            len(row) != 53 or set(row) - set('028') for row in rows):
        raise ValueError('Expected the approved 53 by 7 design for 2025')
    origin = date.fromisoformat(data['origin'])
    if origin != date(2024, 12, 29):
        raise ValueError('Unexpected Sunday calendar origin')
    if len(baseline) != 16 or sum(baseline.values()) != 43:
        raise ValueError('Original contribution baseline changed')
    for y in (0, 6):
        if any(int(rows[y][x]) for x in [*range(1, 16), *range(27, 33)]):
            raise ValueError('Lettering must leave top and bottom rows empty')
    entries = []
    for x in range(53):
        for y in range(7):
            day = origin + timedelta(days=x * 7 + y)
            pixel = int(rows[y][x])
            if day.year != 2025:
                if pixel:
                    raise ValueError('Artwork falls outside 2025')
                continue
            old = baseline.get(day.isoformat(), 0)
            target = max(old, pixel)
            for step in range(1, target - old + 1):
                entries.append(f'{day},{step},{old},{target}\n')
    if len(entries) != 907 or any(e.startswith('2025-07-12,') for e in entries):
        raise ValueError('Unexpected changes to the approved contribution plan')
    return data['base'], entries


def serialize(entries):
    return 'date,commit_index,original_contributions,target_contributions\n' + ''.join(entries)


def apply(base, entries):
    if git('branch', '--show-current').stdout.strip() != 'main':
        raise ValueError('Apply only on main')
    if git('remote', 'get-url', 'origin').stdout.strip() != 'git@github-work:workHMZ/workHMZ.git':
        raise ValueError('Unexpected remote')
    for key, value in [('user.name', 'workHMZ'), ('user.email', 'han.akira.work@gmail.com')]:
        if git('config', '--local', '--get', key).stdout.strip() != value:
            raise ValueError(f'Unexpected local {key}')
    if git('config', '--get', 'commit.gpgsign').stdout.strip() != 'true':
        raise ValueError('Existing signing must remain enabled')
    git('merge-base', '--is-ancestor', base, 'HEAD')
    previous = git('show', f'HEAD:{LEDGER}', check=False)
    completed = []
    if previous.returncode == 0:
        completed = previous.stdout.splitlines(keepends=True)[1:]
        if previous.stdout != serialize(completed) or completed != entries[:len(completed)]:
            raise ValueError('Committed ledger differs from approved plan')
    if int(git('rev-list', '--count', f'{base}..HEAD').stdout) != len(completed):
        raise ValueError('Unexpected commits after the approved base')
    for line in git('status', '--porcelain', '--untracked-files=all').stdout.splitlines():
        if line[3:] not in set(SOURCES + [LEDGER]):
            raise ValueError(f'Unrelated working tree change: {line[3:]}')
    if completed and git('diff', 'HEAD', '--', *SOURCES).stdout:
        raise ValueError('Plan changed after drawing began')
    if len(completed) == len(entries):
        print('Already complete; no changes made.')
        return
    for index in range(len(completed), len(entries)):
        day, step, _, _ = entries[index].strip().split(',')
        (ROOT / LEDGER).write_text(serialize(entries[:index + 1]))
        git('add', '--', LEDGER, *([] if index else SOURCES))
        env = os.environ.copy()
        env.update(GIT_AUTHOR_DATE=f'{day}T12:00:{int(step):02d}+09:00',
                   GIT_COMMITTER_DATE=f'{day}T12:00:{int(step):02d}+09:00')
        result = git('commit', '-m', 'art: update calendar', env=env, check=False)
        if result.returncode:
            raise RuntimeError(result.stderr.strip())
        if (index + 1) % 100 == 0 or index + 1 == len(entries):
            print(f'Created {index + 1}/{len(entries)} signed commits', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    base, entries = plan()
    days = Counter(entry.split(',')[0] for entry in entries)
    print(f'2025: {len(entries)} additional commits on {len(days)} dates; '
          '43 original contributions retained.')
    if args.apply:
        apply(base, entries)


if __name__ == '__main__':
    main()
