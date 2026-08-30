from pathlib import Path
import re

CAL='https://www.mycalendartools.net/assets/perf/ascension-digital.webp?v=20260830-final'

p=Path('_worker.js')
s=p.read_text()
s,n=re.subn(r'const APPROVED_ADG_LOGO\s*=\s*["\'][^"\']+["\'];', f'const APPROVED_ADG_LOGO = "{CAL}";', s, count=1)
assert n==1, 'APPROVED_ADG_LOGO not found'
s=s.replace('width:min(220px,70vw)!important;max-width:220px!important;', 'width:min(280px,78vw)!important;max-width:280px!important;')
s=s.replace('width:220px!important;max-width:70vw!important;', 'width:280px!important;max-width:78vw!important;')
p.write_text(s)

worker=p.read_text()
assert CAL in worker
assert 'width:280px!important;max-width:78vw!important;' in worker or 'width:min(280px,78vw)!important;max-width:280px!important;' in worker
assert 'function ensureAdgDownloadsBrand(html)' not in worker
print('Wheel footer worker repair verified')
