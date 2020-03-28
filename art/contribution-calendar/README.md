# A small autobiography in pixels

Five seven-row drawings for the native GitHub contribution calendar:

| Year | Memory | Drawing |
| --- | --- | --- |
| 2020 | Arriving in Japan | Mount Fuji and cherry blossoms |
| 2021 | Learning | Book and pencil |
| 2022 | Starting work | Laptop and briefcase |
| 2023 | A playful interlude | Space invader and UFO |
| 2024 | Starting to work with AI | AI lettering and robot |

This is intentional calendar art, created in October 2026 using backdated
commits. These commits commemorate life events; they are not records of
software development performed in those years. The placement within each year
is compositional and does not specify the dates of those events.

The 2025 and 2026 calendars receive no art commits. Existing repository history
is preserved. Each art commit adds one row to `pixels.csv`; the first also
introduces the patterns, this explanation, and the generator.

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
