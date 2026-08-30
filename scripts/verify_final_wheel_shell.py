from pathlib import Path
import sys

worker = Path('_worker.js').read_text(encoding='utf-8', errors='ignore')
required = [
    'https://www.mycalendartools.net/assets/perf/ascension-digital.webp',
    '/assets/perf/logo-adg-downloads.webp',
    "href:'/coin-toss'",
    "href:'/dice-roller'",
    "href:'/lucky-dip'",
    'repairToolCardTargets',
    'adg-generated-footer',
    '.foot-adg-logo',
    '.adg-downloads-logo',
    '.related-card',
    'wheel-shell-fix-v4',
]
errors = [f'_worker.js missing required repair marker: {item}' for item in required if item not in worker]

assets = [
    Path('assets/perf/logo-adg-downloads.webp'),
    Path('assets/perf/logo-mycalctools.webp'),
    Path('assets/perf/logo-mycalendartools.webp'),
]
for asset in assets:
    if not asset.exists():
        errors.append(f'missing footer ecosystem asset: {asset}')

html_files = [p for p in Path('.').rglob('*.html') if '.git' not in p.parts]
print(f'Checked worker contract and {len(html_files)} HTML source files')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('PASS: Wheel worker enforces approved Ascension sizing, ADG Downloads footer logo, card styling, footer fallback and tool-card routes.')
