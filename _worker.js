const CANONICAL_HOST = "wheelnamepicker.com.au";
const CLEAN_TOOL_ROUTES = new Set([
  "/coin-toss", "/dice-roller", "/lucky-dip", "/random-number-picker", "/student-picker",
  "/team-picker", "/chore-picker", "/dinner-picker", "/yes-no-picker", "/weekday-picker",
  "/colour-picker", "/picture-picker", "/activity-picker", "/guides/random-selection",
  "/guides/classroom-fair-picking", "/guides/probability-activities"
]);
const APPROVED_ADG_LOGO = "/assets/perf/ascension-digital.webp";

function cleanInternalHref(raw, baseUrl) {
  if (!raw || /^(?:#|tel:|javascript:|data:)/i.test(raw)) return raw;
  if (/^mailto:/i.test(raw)) return "/contact/";
  try {
    const url = new URL(raw, baseUrl);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== CANONICAL_HOST) return raw;
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    if (/\/index\.html$/i.test(url.pathname)) url.pathname = url.pathname.replace(/\/index\.html$/i, "/");
    else if (/\.html$/i.test(url.pathname)) url.pathname = url.pathname.replace(/\.html$/i, "");
    if (url.pathname === "/index") url.pathname = "/";
    if (url.pathname === "/contact") url.pathname = "/contact/";
    if (url.pathname === "/lucky-dip") url.pathname = "/random-number-picker";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return raw; }
}

function rewriteInternalLinks(html, pageUrl) {
  return html.replace(/\bhref=(["'])([^"']+)\1/gi, (match, quote, href) => `href=${quote}${cleanInternalHref(href, pageUrl)}${quote}`);
}

function repairToolCardTargets(html) {
  const routes = [
    {re:/coin\s*(?:toss|flip)/i, href:'/coin-toss'},
    {re:/dice\s*roller|roll\s*(?:the\s*)?dice/i, href:'/dice-roller'},
    {re:/lucky\s*dip|lotto|random\s*number/i, href:'/random-number-picker'},
    {re:/student\s*picker|classroom\s*picker/i, href:'/student-picker'},
    {re:/team\s*picker|group\s*maker/i, href:'/team-picker'},
    {re:/wheel\s*(?:spinner|name\s*picker)|name\s*spinner|spinner/i, href:'/'}
  ];
  return html.replace(/<a\b([^>]*)href=["'][^"']*["']([^>]*)>([\s\S]*?)<\/a>/gi, (whole, before, after, inner) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    for (const route of routes) {
      if (route.re.test(text) && /(?:tool|card|usecase|mini|mode|related|shortcut)/i.test(`${before} ${after}`)) {
        const attrs = `${before} ${after}`.replace(/\s+/g, ' ').trim();
        return `<a ${attrs} href="${route.href}">${inner}</a>`;
      }
    }
    return whole;
  });
}

function removeAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}\\s*=\\s*(?:["'][^"']*["']|[^\\s>]+)`, "ig"), "");
}
function addAttr(tag, name, value) {
  if (new RegExp(`\\s${name}\\s*=`, "i").test(tag)) return tag;
  return tag.replace(/\s*\/?>(\s*)$/, ` ${name}="${value}">$1`);
}

function normalizeFooterLogo(html) {
  return html.replace(/<img\b[^>]*class=["'][^"']*foot-adg-logo[^"']*["'][^>]*>/gi, tag => {
    let out = tag.replace(/\ssrc=(?:["'][^"']*["']|[^\s>]+)/i, ` src="${APPROVED_ADG_LOGO}"`);
    out = removeAttr(removeAttr(out, "width"), "height");
    out = addAttr(out, "width", "440");
    out = addAttr(out, "height", "440");
    out = addAttr(out, "loading", "lazy");
    out = addAttr(out, "decoding", "async");
    return out;
  });
}

function fixWheelLogoSizing(html) {
  html = html.replace(/<img\b[^>]*class=["'][^"']*hero-logo[^"']*["'][^>]*>/gi, tag => {
    let out = removeAttr(removeAttr(tag, "width"), "height");
    out = addAttr(out, "fetchpriority", "high");
    out = addAttr(out, "decoding", "async");
    return out;
  });
  return html.replace(/<\/head>/i, `<style id="adg-wheel-shell-fix">
.hero-logo{width:min(160px,55vw)!important;height:auto!important;object-fit:contain!important;aspect-ratio:auto!important}
.nav-logo img{width:auto!important;height:44px!important;object-fit:contain!important}
.usecase-card,.tool-card,.mini-tool-card,.info-card,.card,.panel,.related-card{background:linear-gradient(145deg,rgba(26,26,46,.96),rgba(18,18,30,.96))!important;border-color:rgba(124,58,237,.34)!important;box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 18px rgba(0,212,232,.08),0 0 14px rgba(124,58,237,.08)!important}
.usecase-card:hover,.tool-card:hover,.mini-tool-card:hover,.info-card:hover,.card:hover,.panel:hover,.related-card:hover{border-color:rgba(0,212,232,.46)!important;box-shadow:0 10px 30px rgba(0,0,0,.22),0 0 22px rgba(0,212,232,.12),0 0 18px rgba(124,58,237,.10)!important}
button,.mini-btn,.spin-btn,.nav-badge,.rs-support-btn,.email{box-shadow:0 0 16px rgba(124,58,237,.16)}
.foot-adg-header{width:100%!important;max-width:none!important;text-align:center!important}
.foot-adg-header a{display:block!important;width:100%!important;max-width:none!important}
.foot-adg-logo{display:block!important;width:220px!important;max-width:220px!important;max-height:none!important;height:auto!important;object-fit:contain!important;border-radius:12px!important;margin:0 auto 20px!important;filter:drop-shadow(0 0 16px rgba(6,214,255,.3))!important}
.adg-generated-footer{background:#080811;border-top:1px solid rgba(255,255,255,.08);padding:32px 20px;text-align:center;color:#8b89a8}
@media(max-width:768px){nav,.card,.tool-card,.info-card,.wheel-wrap{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.usecase-card,.tool-card,.mini-tool-card,.info-card,.card,.panel,.related-card{box-shadow:0 6px 18px rgba(0,0,0,.18),0 0 10px rgba(124,58,237,.06)!important}button,.mini-btn,.spin-btn,.nav-badge,.rs-support-btn,.email{box-shadow:0 0 10px rgba(124,58,237,.12)}.foot-adg-logo{width:min(220px,70vw)!important;max-width:220px!important}}
</style>\n</head>`);
}

function ensureAdgDownloadsAllPages(html) {
  if (/logo-adg-downloads\.webp/i.test(html)) return html;
  const icon = `<a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener" title="ADG Downloads" data-adg-downloads="true"><img src="/assets/perf/logo-adg-downloads.webp" alt="ADG Downloads" width="52" height="52" loading="lazy" decoding="async"></a>`;
  if (/<div\b[^>]*class=["'][^"']*foot-ecosystem[^"']*["'][^>]*>/i.test(html)) return html.replace(/(<div\b[^>]*class=["'][^"']*foot-ecosystem[^"']*["'][^>]*>)/i, `$1${icon}`);
  if (/<div\b[^>]*class=["'][^"']*foot-links[^"']*["'][^>]*>/i.test(html)) return html.replace(/(<div\b[^>]*class=["'][^"']*foot-links[^"']*["'][^>]*>)/i, `$1${icon}`);
  if (/<footer\b/i.test(html)) return html.replace(/(<\/footer>)/i, `<div class="foot-adg-downloads" style="display:flex;justify-content:center;margin:18px auto">${icon}</div>$1`);
  return html;
}

function ensureApprovedFooter(html) {
  if (/<footer\b/i.test(html)) return html;
  const block = `<div class="foot-adg-header" data-adg-approved-footer="true" style="text-align:center;margin:0 auto 24px">
<a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener"><img src="${APPROVED_ADG_LOGO}" alt="Ascension Digital Group" class="foot-adg-logo" width="440" height="440" loading="lazy" decoding="async"></a>
<p class="foot-adg-tagline">Part of the Ascension Digital Group ecosystem</p>
</div>`;
  return html.replace(/<\/body>/i, `<footer class="adg-generated-footer">${block}<p>© 2026 wheelnamepicker.com.au · Part of Ascension Digital Group</p></footer>\n</body>`);
}

function applyHomepageMetadata(html, pathname) {
  if (pathname !== "/") return html;
  const description = "Free random choice tools for names, numbers, students, teams, chores, activities and everyday decisions, plus coin flip and dice roller. No sign-up.";
  html = html.replace(/<meta\b[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta\b[^>]*name=["']keywords["'][^>]*>/i, `<meta name="keywords" content="random name picker, wheel spinner, student picker, team picker, random number generator, chore picker, activity picker, dinner picker, yes no picker, weekday picker, colour picker, picture picker, coin flip, dice roller, classroom random selector, group maker, decision tool">`);
  html = html.replace(/<meta\b[^>]*property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="Wheel Name Picker — Free Random Choice Tools">`);
  html = html.replace(/<meta\b[^>]*property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="Free random choice tools for classrooms, families, groups and everyday decisions. Pick names, students, teams, numbers, chores, activities, colours and more.">`);
  if (!/rel=["']preload["'][^>]*href=["']\/assets\/perf\/logo\.webp["']/i.test(html)) html = html.replace(/<\/head>/i, `<link rel="preload" as="image" href="/assets/perf/logo.webp" fetchpriority="high">\n</head>`);
  return html;
}

function sanitizeReviewSignals(html, pathname) {
  if (pathname !== "/") return html;
  html = html.replace(/<div\s+class=["']affiliate-panel-wrap["']>[\s\S]*?<a\s+class=["']aff-btn["'][\s\S]*?<\/a>\s*<\/div>\s*<\/div>/i, "");
  html = html.replace(/drinking\s+games\s*\(18\+\)/gi, "tabletop and party games");
  html = html.replace(/Can I generate random lotto numbers\?/gi, "Can I generate random numbers?");
  html = html.replace(/Yes\. The Lucky Dip tool generates random lotto-style number sets[^"<]*/gi, "Yes. The Random Number Picker can generate one or more whole numbers from a range you choose, with optional no-repeat results.");
  html = html.replace(/Can I use this for competitions and prize draws\?/gi, "Can I use this for informal group selections?");
  html = html.replace(/Absolutely\. Add all participant names, spin to pick a winner\. Each entry has an equal and fair chance of being selected, making it ideal for giveaways, raffles and competitions\./gi, "For informal classroom, family and community activities, you can add the eligible options and select one at random. For regulated, audited or legally significant selections, use a process that meets the applicable rules and record-keeping requirements.");
  html = html.replace(/Lucky Dip/gi, "Random Number Picker");
  html = html.replace(/\blotto\b/gi, "random number");
  html = html.replace(/\braffles?\b/gi, "informal selections");
  html = html.replace(/\bprize\s+draws?\b/gi, "group selections");
  html = html.replace(/\bgiveaways?\b/gi, "group activities");
  return html;
}

function injectValueHub(html, pathname) {
  if (pathname !== "/" || /id=["']value-toolkit["']/i.test(html)) return html;
  const block = `<section id="value-toolkit" style="max-width:1100px;margin:0 auto;padding:42px 20px">
<style>#value-toolkit h2{text-align:center;font-size:clamp(26px,4vw,38px);margin:0 0 8px}#value-toolkit>p{text-align:center;color:#aaa6c7;max-width:760px;margin:0 auto 22px}.value-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.value-card{display:block;background:linear-gradient(145deg,rgba(26,26,46,.96),rgba(18,18,30,.96));border:1px solid rgba(0,212,232,.25);border-radius:15px;padding:17px;color:#f0eeff}.value-card:hover{border-color:rgba(240,192,64,.55);transform:translateY(-2px)}.value-card strong{display:block;color:#fff;margin-bottom:5px}.value-card span{color:#aaa6c7;font-size:.9rem}</style>
<h2>More free choice tools</h2><p>Different decisions need different tools. These pages are built for specific tasks rather than re-skinning the same wheel.</p><div class="value-grid">
<a class="value-card" href="/random-number-picker"><strong>Random Number Picker</strong><span>Choose one or more numbers from your own range, with optional no-repeat results.</span></a>
<a class="value-card" href="/student-picker"><strong>Student Picker</strong><span>Paste a class list, pick one name and optionally remove selected students.</span></a>
<a class="value-card" href="/team-picker"><strong>Team Picker</strong><span>Shuffle names into roughly balanced random groups.</span></a>
<a class="value-card" href="/chore-picker"><strong>Chore Picker</strong><span>Choose the next job from a realistic household task list.</span></a>
<a class="value-card" href="/dinner-picker"><strong>Dinner Picker</strong><span>Randomly choose from meal ideas that actually suit tonight.</span></a>
<a class="value-card" href="/yes-no-picker"><strong>Yes or No Picker</strong><span>A simple low-stakes two-choice tie-breaker.</span></a>
<a class="value-card" href="/weekday-picker"><strong>Weekday Picker</strong><span>Select eligible days, then randomly choose one.</span></a>
<a class="value-card" href="/colour-picker"><strong>Colour Picker</strong><span>Pick from your own named colour palette for crafts or prompts.</span></a>
<a class="value-card" href="/picture-picker"><strong>Picture Picker</strong><span>Choose from local images without uploading them through the tool.</span></a>
<a class="value-card" href="/activity-picker"><strong>Activity Picker</strong><span>Use your own ideas or starter lists for home, class and outdoors.</span></a>
<a class="value-card" href="/guides/random-selection"><strong>How Random Selection Works</strong><span>Understand equal chance, repeats, independence and informal randomness.</span></a>
<a class="value-card" href="/guides/classroom-fair-picking"><strong>Fair Classroom Picking</strong><span>Practical guidance for inclusive random participation and grouping.</span></a>
<a class="value-card" href="/guides/probability-activities"><strong>Probability Activities</strong><span>Hands-on learning ideas using coins, dice and random numbers.</span></a>
</div></section>`;
  if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${block}</main>`);
  if (/<footer\b/i.test(html)) return html.replace(/<footer\b/i, `${block}<footer`);
  return html.replace(/<\/body>/i, `${block}</body>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const isPreview = host === "wheelnamepicker.pages.dev" || host.endsWith(".wheelnamepicker.pages.dev");
    if (!isPreview && (url.protocol !== "https:" || host !== CANONICAL_HOST)) {
      url.hostname = CANONICAL_HOST; url.protocol = "https:"; url.port = "";
      return Response.redirect(url.href, 301);
    }
    if (url.pathname === "/lucky-dip") {
      const target = new URL(request.url);
      target.pathname = "/random-number-picker";
      return Response.redirect(target.href, 301);
    }
    if (/\.(?:html)$/i.test(url.pathname)) {
      const target = new URL(request.url);
      target.pathname = target.pathname.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
      if (target.pathname === "/index") target.pathname = "/";
      return Response.redirect(target.href, 301);
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    const isToolHtml = CLEAN_TOOL_ROUTES.has(url.pathname);
    if (!response.ok || (!contentType.includes("text/html") && !isToolHtml)) return response;

    let html = await response.text();
    html = rewriteInternalLinks(html, url.href);
    html = repairToolCardTargets(html);
    html = applyHomepageMetadata(html, url.pathname);
    html = sanitizeReviewSignals(html, url.pathname);
    html = injectValueHub(html, url.pathname);
    html = normalizeFooterLogo(html);
    html = fixWheelLogoSizing(html);
    html = ensureApprovedFooter(html);
    html = ensureAdgDownloadsAllPages(html);

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-ADG-URL-Hygiene", "wheel-clean-v7");
    headers.set("X-ADG-Visual-Shell", "wheel-footer-consistent-v9");
    headers.set("X-ADG-Value-Content", "expanded-toolkit-v1");
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};