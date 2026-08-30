from pathlib import Path
p=Path('_worker.js')
s=p.read_text()
needle='function ensureApprovedFooter(html) {'
helper='''function ensureAdgDownloadsAllPages(html) {\n  if (/logo-adg-downloads\\.webp/i.test(html)) return html;\n  const icon = `<a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener" title="ADG Downloads" data-adg-downloads="true"><img src="/assets/perf/logo-adg-downloads.webp" alt="ADG Downloads" width="52" height="52" loading="lazy" decoding="async"></a>`;\n  if (/<div\\b[^>]*class=["'][^"']*foot-ecosystem[^"']*["'][^>]*>/i.test(html)) return html.replace(/(<div\\b[^>]*class=["'][^"']*foot-ecosystem[^"']*["'][^>]*>)/i, `$1${icon}`);\n  if (/<div\\b[^>]*class=["'][^"']*foot-links[^"']*["'][^>]*>/i.test(html)) return html.replace(/(<div\\b[^>]*class=["'][^"']*foot-links[^"']*["'][^>]*>)/i, `$1${icon}`);\n  if (/<footer\\b/i.test(html)) return html.replace(/(<\\/footer>)/i, `<div class="foot-adg-downloads" style="display:flex;justify-content:center;margin:18px auto">${icon}</div>$1`);\n  return html;\n}\n\n'''
if 'function ensureAdgDownloadsAllPages' not in s: s=s.replace(needle,helper+needle)
call='    html = ensureApprovedFooter(html);'
if 'html = ensureAdgDownloadsAllPages(html);' not in s: s=s.replace(call,call+'\n    html = ensureAdgDownloadsAllPages(html);')
s=s.replace('wheel-footer-large-v8','wheel-footer-consistent-v9')
p.write_text(s)
