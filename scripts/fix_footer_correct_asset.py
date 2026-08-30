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

p=Path('index.html')
s=p.read_text()
s,n=re.subn(r'(<img\s+class="foot-adg-logo"\s+src=")[^"]+("[^>]*>)', lambda m:m.group(1)+CAL+m.group(2), s, count=1)
assert n==1, 'foot-adg-logo not found in index.html'
s=s.replace('width:min(220px,70vw)', 'width:min(280px,78vw)')
s=s.replace('max-width:220px', 'max-width:280px')
p.write_text(s)

# Safety verification: one large Ascension slot, Calendar asset, ADG Downloads stays only a small ecosystem icon.
worker=Path('_worker.js').read_text()
index=Path('index.html').read_text()
assert CAL in worker and CAL in index
assert index.count('class="foot-adg-logo"') == 1
assert 'logo-adg-downloads.webp' in index
assert 'width:min(280px,78vw)' in index
print('Wheel footer asset repair verified')
