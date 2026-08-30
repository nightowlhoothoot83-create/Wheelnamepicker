from pathlib import Path

idx = Path('index.html')
s = idx.read_text(encoding='utf-8')

# 1) Tool shortcuts must not inherit the site's sticky global nav styling.
s = s.replace('<nav class="tool-shortcuts" aria-labelledby="other-tools-label">', '<section class="tool-shortcuts" aria-labelledby="other-tools-label">', 1)
marker = '<p class="tool-shortcuts-note">These open separate tools. The cards above change the Wheel Name Picker preset.</p>\n</nav>'
s = s.replace(marker, '<p class="tool-shortcuts-note">These open separate tools. The cards above change the Wheel Name Picker preset.</p>\n</section>', 1)

# 2) Use the same approved Ascension image/presentation as MyCalendarTools.
s = s.replace('src="/assets/perf/logo-ascension-digital.webp" alt="Ascension Digital Group" class="foot-adg-logo"', 'src="https://www.mycalendartools.net/assets/perf/ascension-digital.webp" alt="Ascension Digital Group" class="foot-adg-logo"')
s = s.replace('<style>.foot-adg-logo{width:140px!important;height:140px!important;object-fit:contain}</style>', '<style>.foot-adg-logo{width:min(220px,70vw)!important;height:auto!important;object-fit:contain!important;border-radius:12px;margin:0 auto 20px!important;display:block!important;filter:drop-shadow(0 0 16px rgba(6,214,255,.3))}</style>')

# 3) Apply the approved glow treatment to the actual card classes that were missed.
needle = '.tool-shortcut-card:hover{border-color:rgba(0,212,232,.55);transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.2),0 0 20px rgba(0,212,232,.12)}'
extra = needle + '\n.tip-card,.stat-box,.faq-item,.affiliate-panel{background:linear-gradient(145deg,rgba(26,26,46,.96),rgba(18,18,30,.96));border:1px solid rgba(124,58,237,.34);box-shadow:0 8px 24px rgba(0,0,0,.16),0 0 14px rgba(0,212,232,.07)}\n.tip-card:hover,.faq-item:hover{border-color:rgba(0,212,232,.5);box-shadow:0 10px 28px rgba(0,0,0,.2),0 0 20px rgba(0,212,232,.12)}'
if needle in s and '.tip-card,.stat-box,.faq-item,.affiliate-panel{' not in s:
    s = s.replace(needle, extra, 1)

idx.write_text(s, encoding='utf-8')

# 4) The worker must not add a second ADG footer or reinterpret the existing footer logos.
worker = Path('_worker.js')
w = worker.read_text(encoding='utf-8')
start = w.index('function ensureApprovedFooter(html) {')
end = w.index('\nfunction applyHomepageMetadata', start)
replacement = '''function ensureApprovedFooter(html) {
  if (/<footer\\b/i.test(html)) return html;
  const block = `<div class="foot-adg-header" data-adg-approved-footer="true" style="text-align:center;margin:0 auto 24px">
<a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener"><img src="${APPROVED_ADG_LOGO}" alt="Ascension Digital Group" class="foot-adg-logo" loading="lazy" decoding="async"></a>
<p class="foot-adg-tagline">Part of the Ascension Digital Group ecosystem</p>
</div>`;
  return html.replace(/<\\/body>/i, `<footer class="adg-generated-footer">${block}<p>© 2026 wheelnamepicker.com.au · Part of Ascension Digital Group</p></footer>\\n</body>`);
}
'''
w = w[:start] + replacement + w[end:]
worker.write_text(w, encoding='utf-8')

# Mechanical checks for the exact defects reported.
out = idx.read_text(encoding='utf-8')
assert '<nav class="tool-shortcuts"' not in out
assert '<section class="tool-shortcuts"' in out
assert 'https://www.mycalendartools.net/assets/perf/ascension-digital.webp' in out
assert 'width:140px!important;height:140px!important' not in out
assert '.tip-card,.stat-box,.faq-item,.affiliate-panel{' in out
ww = worker.read_text(encoding='utf-8')
func = ww[ww.index('function ensureApprovedFooter'):ww.index('function applyHomepageMetadata')]
assert 'if (/<footer\\b/i.test(html)) return html;' in func
assert 'ADG_DOWNLOADS_LOGO' not in func
print('Wheel targeted visual repair applied and verified')
