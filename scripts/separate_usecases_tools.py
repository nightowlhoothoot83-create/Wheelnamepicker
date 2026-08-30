from pathlib import Path

path = Path('index.html')
html = path.read_text(encoding='utf-8')

old_css = """.usecase-card .uc-label{font-size:11.5px;font-weight:800;color:var(--text)}"""
new_css = """.usecase-card .uc-label{font-size:11.5px;font-weight:800;color:var(--text)}
.usecase-card{font-family:var(--ff);color:inherit;width:100%}
.tool-shortcuts{max-width:1100px;margin:0 auto;padding:0 20px 40px}
.tool-shortcuts-label{font-family:var(--ffm);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--cyan);text-align:center;margin-bottom:14px}
.tool-shortcuts-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.tool-shortcut-card{display:flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(145deg,rgba(26,26,46,.96),rgba(18,18,30,.96));border:1px solid rgba(0,212,232,.28);border-radius:14px;padding:14px 12px;text-align:center;transition:all .2s;box-shadow:0 8px 24px rgba(0,0,0,.16),0 0 14px rgba(0,212,232,.07)}
.tool-shortcut-card:hover{border-color:rgba(0,212,232,.55);transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.2),0 0 20px rgba(0,212,232,.12)}
.tool-shortcut-card .tool-icon{font-size:24px}
.tool-shortcut-card .tool-label{font-size:12px;font-weight:900;color:var(--text)}
.tool-shortcuts-note{font-size:12px;color:var(--muted);text-align:center;margin-top:10px}
@media(max-width:620px){.tool-shortcuts-grid{grid-template-columns:1fr}.tool-shortcut-card{justify-content:flex-start;padding-left:20px}}"""
if old_css not in html:
    raise SystemExit('Expected usecase CSS marker not found')
html = html.replace(old_css, new_css, 1)

old_block = """<!-- USE CASES STRIP -->
<div class=\"usecase-strip\">
  <div class=\"usecase-strip-label\">Popular Use Cases</div>
  <div class=\"usecase-grid\">
    <div class=\"usecase-card\" onclick=\"selectModeById('chores')\"><div class=\"uc-icon\">🧹</div><div class=\"uc-label\">Choose a Chore, Task or Job</div></div>
    <div class=\"usecase-card\" onclick=\"selectModeById('names')\"><div class=\"uc-icon\">📚</div><div class=\"uc-label\">Homework or Play</div></div>
    <div class=\"usecase-card\" onclick=\"location.href='lucky-dip'\"><div class=\"uc-icon\">🎟️</div><div class=\"uc-label\">Pick Lotto Numbers</div></div>
    <div class=\"usecase-card\" onclick=\"location.href='coin-toss'\"><div class=\"uc-icon\">🪙</div><div class=\"uc-label\">Coin Toss</div></div>
    <div class=\"usecase-card\" onclick=\"location.href='dice-roller'\"><div class=\"uc-icon\">🎲</div><div class=\"uc-label\">Roll the Dice</div></div>
    <div class=\"usecase-card\" onclick=\"selectModeById('custom')\"><div class=\"uc-icon\">🖼️</div><div class=\"uc-label\">Picture Wheel</div></div>
  </div>
</div>"""

new_block = """<!-- WHEEL USE CASES: these change the main wheel preset and do not navigate away -->
<section class=\"usecase-strip\" aria-labelledby=\"wheel-usecases-label\">
  <div class=\"usecase-strip-label\" id=\"wheel-usecases-label\">Popular Wheel Use Cases</div>
  <div class=\"usecase-grid\">
    <button type=\"button\" class=\"usecase-card\" onclick=\"selectModeById('chores')\"><div class=\"uc-icon\">🧹</div><div class=\"uc-label\">Choose a Chore, Task or Job</div></button>
    <button type=\"button\" class=\"usecase-card\" onclick=\"selectModeById('names')\"><div class=\"uc-icon\">📚</div><div class=\"uc-label\">Homework or Play</div></button>
    <button type=\"button\" class=\"usecase-card\" onclick=\"selectModeById('custom')\"><div class=\"uc-icon\">🖼️</div><div class=\"uc-label\">Picture Wheel</div></button>
  </div>
</section>

<!-- OTHER TOOLS: these navigate to separate tool pages -->
<nav class=\"tool-shortcuts\" aria-labelledby=\"other-tools-label\">
  <div class=\"tool-shortcuts-label\" id=\"other-tools-label\">Other Random Tools</div>
  <div class=\"tool-shortcuts-grid\">
    <a class=\"tool-shortcut-card\" href=\"/coin-toss\"><span class=\"tool-icon\">🪙</span><span class=\"tool-label\">Coin Toss</span></a>
    <a class=\"tool-shortcut-card\" href=\"/dice-roller\"><span class=\"tool-icon\">🎲</span><span class=\"tool-label\">Dice Roller</span></a>
    <a class=\"tool-shortcut-card\" href=\"/lucky-dip\"><span class=\"tool-icon\">🎟️</span><span class=\"tool-label\">Lucky Dip / Lotto Numbers</span></a>
  </div>
  <p class=\"tool-shortcuts-note\">These open separate tools. The cards above change the Wheel Name Picker preset.</p>
</nav>"""

if old_block not in html:
    raise SystemExit('Expected mixed use-case/tool block not found')
html = html.replace(old_block, new_block, 1)
path.write_text(html, encoding='utf-8')
print('Separated wheel use cases from other-tool navigation.')
