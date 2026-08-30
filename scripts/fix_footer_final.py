from pathlib import Path
import re

p = Path('_worker.js')
s = p.read_text(encoding='utf-8')

# Make the approved Ascension footer logo visibly larger.
s = s.replace('width:220px!important;max-width:70vw!important;', 'width:280px!important;max-width:78vw!important;')

# Ensure a separate ADG Downloads logo is present in the footer header area.
needle = '<p class="foot-adg-tagline">Part of the Ascension Digital Group ecosystem</p>'
insert = needle + '\n<a class="adg-downloads-link" href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener"><img src="${ADG_DOWNLOADS_LOGO}" alt="ADG Downloads" class="adg-downloads-logo" width="300" height="300" loading="lazy" decoding="async"></a>'

# Add it to generated fallback footer.
s = s.replace(needle + '\n</div>`;', insert + '\n</div>`;')

# Add runtime normalisation for existing real footers.
marker = 'function ensureApprovedFooter(html) {'
helper = '''function ensureAdgDownloadsBrand(html) {\n  if (!/<footer\\b/i.test(html)) return html;\n  if (/class=["'][^"']*adg-downloads-logo/i.test(html)) return html;\n  return html.replace(/(<p\\b[^>]*class=["'][^"']*foot-adg-tagline[^"']*["'][^>]*>[\\s\\S]*?<\\/p>)/i, `$1\\n<a class="adg-downloads-link" href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener"><img src="${ADG_DOWNLOADS_LOGO}" alt="ADG Downloads" class="adg-downloads-logo" width="300" height="300" loading="lazy" decoding="async"></a>`);\n}\n\n'''
if 'function ensureAdgDownloadsBrand(html)' not in s:
    s = s.replace(marker, helper + marker)

# Ensure helper runs on all HTML before fallback handling.
s = s.replace('html = normalizeFooterLogo(html);\n    html = fixWheelLogoSizing(html);\n    html = ensureApprovedFooter(html);', 'html = normalizeFooterLogo(html);\n    html = ensureAdgDownloadsBrand(html);\n    html = fixWheelLogoSizing(html);\n    html = ensureApprovedFooter(html);')

# Bump shell marker so the exact deployed worker is identifiable.
s = s.replace('wheel-footer-logo-v5', 'wheel-footer-final-v6')

checks = [
    'width:280px!important;max-width:78vw!important;',
    'function ensureAdgDownloadsBrand(html)',
    'class="adg-downloads-logo"',
    'wheel-footer-final-v6',
]
for c in checks:
    if c not in s:
        raise SystemExit(f'missing expected repair: {c}')

p.write_text(s, encoding='utf-8')
