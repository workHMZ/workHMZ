# A small autobiography in pixels

Six seven-row drawings for the native GitHub contribution calendar:

| Year | Memory | Drawing |
| --- | --- | --- |
| 2020 | Arriving in Japan | Mount Fuji and cherry blossoms |
| 2021 | Learning | Book and pencil |
| 2022 | Starting work | Laptop and briefcase |
| 2023 | A playful interlude | Space invader and UFO |
| 2024 | Starting to work with AI | AI lettering and robot |
| 2025 | Cloud engineering | AWS, observability, AI, containers and cloud |

This is intentional calendar art, created in October 2026 using backdated
commits. These commits commemorate life events; they are not records of
software development performed in those years. The placement within each year
is compositional and does not specify the dates of those events.

The 2026 calendar receives no art commits. Existing repository history is
preserved. Each 2020-2024 art commit adds one row to `pixels.csv`; the first also
introduces the patterns, this explanation, and the original generator.

`patterns.json` uses `0` for background, `1` for a light pixel, and `4` for a
strong pixel. The numbers are commit counts per day. GitHub controls the final
color mapping. Every composition is centered in its year's calendar, with
Sunday at the top. Use the year selector on the GitHub profile to see the art.

Preview the date plan without making any commits:

```sh
python3 scripts/paint-contribution-calendar.py
```

The generator's `--apply --base <commit>` mode creates signed commits using the
repository's existing Git signing settings and local identity. It never pushes,
rewrites existing history, or changes Git configuration. A completed drawing is
detected from the committed ledger, so rerunning it does not add duplicate pixels.

## 2025: existing contributions as part of the drawing

`2025.json` stores the approved 53-column, seven-row design and the 43 existing
contributions across 16 dates, captured before publication. Rows run Sunday
through Saturday; column zero starts on December 29, 2024. Only dates within
2025 receive commits. Pixel values are target daily totals: `8` for the main
outline, `2` for shading, and `0` for background. Each date receives only the
additional commits needed to reach `max(original, target)`. GitHub controls
the actual color levels.

AWS has no underline. AWS and AI occupy the middle five rows. The original
six contributions on July 12 remain below the left leg of A; no new commits
are added to that date. Containers and cloud keep their taller silhouettes.

The 2025 edition appends 907 signed commits to the existing history. Every
commit adds one row to `pixels-2025.csv`, with the source files included in the
first commit. No existing commits, dates, attribution, or other repositories
are changed. These are intentional art commits made in October 2026.

Preview or resume the 2025 edition:

```sh
python3 scripts/paint-contribution-calendar-2025.py
python3 scripts/paint-contribution-calendar-2025.py --apply
```

The 2025 generator checks the original base, committed ledger, local identity,
and existing signing settings. It is resumable and never pushes or rewrites
history. The original generator above describes the separate 2020-2024 edition.
