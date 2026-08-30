const CANONICAL_HOST = "wheelnamepicker.com.au";
const CLEAN_TOOL_ROUTES = new Set(["/coin-toss", "/dice-roller", "/lucky-dip"]);
const APPROVED_ADG_LOGO = "https://www.mycalendartools.net/assets/perf/ascension-digital.webp";

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
    if (/\/index\.html$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/index\.html$/i, "/");
    } else if (/\.html$/i.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\.html$/i, "");
    }
    if (url.pathname === "/index") url.pathname = "/";
    if (url.pathname === "/contact") url.pathname = "/contact/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return raw;
  }
}

function rewriteInternalLinks(html, pageUrl) {
  return html.replace(/\bhref=(["'])([^"']+)\1/gi, (match, quote, href) =>
    `href=${quote}${cleanInternalHref(href, pageUrl)}${quote}`
  );
}

function removeAttr(tag, name) {
  return tag.replace(new RegExp(`\\s${name}\\s*=\\s*(?:["'][^"']*["']|[^\\s>]+)`, "ig"), "");
}

function addAttr(tag, name, value) {
  if (new RegExp(`\\s${name}\\s*=`, "i").test(tag)) return tag;
  return tag.replace(/\s*\/?>(\s*)$/, ` ${name}="${value}">$1`);
}

function fixWheelLogoSizing(html) {
  html = html.replace(/<img\b[^>]*class=["'][^"']*hero-logo[^"']*["'][^>]*>/gi, tag => {
    let out = removeAttr(removeAttr(tag, "width"), "height");
    out = addAttr(out, "fetchpriority", "high");
    out = addAttr(out, "decoding", "async");
    return out;
  });
  html = html.replace(/<img\b[^>]*src=["'][^"']*(?:\/assets\/perf\/logo\.webp|\/logo\.png)["'][^>]*>/gi, tag => {
    if (/hero-logo/i.test(tag)) return tag;
    let out = removeAttr(removeAttr(tag, "width"), "height");
    out = addAttr(out, "decoding", "async");
    return out;
  });
  return html.replace(/<\/head>/i, `<style id="adg-wheel-shell-fix">
.hero-logo{width:min(160px,55vw)!important;height:auto!important;object-fit:contain!important;aspect-ratio:auto!important}
.nav-logo img{width:auto!important;height:44px!important;object-fit:contain!important}
.usecase-card,.tool-card,.mini-tool-card,.info-card,.card,.panel{background:linear-gradient(145deg,rgba(26,26,46,.96),rgba(18,18,30,.96));border-color:rgba(124,58,237,.28);box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 18px rgba(0,212,232,.05)}
button,.mini-btn,.spin-btn,.nav-badge,.rs-support-btn,.email{box-shadow:0 0 16px rgba(124,58,237,.16)}
.foot-adg-logo{display:block!important;width:min(220px,72vw)!important;max-width:220px!important;height:auto!important;object-fit:contain!important;margin:0 auto 8px!important}
@media(max-width:768px){nav,.card,.tool-card,.info-card,.wheel-wrap{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}.usecase-card,.tool-card,.mini-tool-card,.info-card,.card,.panel{box-shadow:0 6px 18px rgba(0,0,0,.18),0 0 10px rgba(124,58,237,.06)}button,.mini-btn,.spin-btn,.nav-badge,.rs-support-btn,.email{box-shadow:0 0 10px rgba(124,58,237,.12)}}
</style>\n</head>`);
}

function ensureApprovedFooter(html) {
  const block = `<div class="foot-adg-header" data-adg-approved-footer="true" style="text-align:center;margin:0 auto 24px">
<a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener"><img src="${APPROVED_ADG_LOGO}" alt="Ascension Digital Group" class="foot-adg-logo" loading="lazy" decoding="async"></a>
<p class="foot-adg-tagline">Part of the Ascension Digital Group ecosystem</p></div>`;

  html = html.replace(/<div\b[^>]*data-adg-approved-footer=["']true["'][\s\S]*?<\/div>/i, "");
  html = html.replace(/<img\b([^>]*)(?:alt=["']Ascension Digital(?: Group)?["']|class=["'][^"']*(?:foot-adg-logo|ascension-logo)[^"']*["'])([^>]*)>/gi, tag => {
    let out = tag.replace(/\bsrc=["'][^"']*["']/i, `src="${APPROVED_ADG_LOGO}"`);
    out = removeAttr(removeAttr(out, "width"), "height");
    out = addAttr(out, "loading", "lazy");
    out = addAttr(out, "decoding", "async");
    return out;
  });

  return html.replace(/<footer\b([^>]*)>/i, `<footer$1>${block}`);
}

function applyHomepageMetadata(html, pathname) {
  if (pathname !== "/") return html;
  const description = "Free wheel spinner and random picker for names, numbers, chores, classrooms and games, plus coin flip, dice roller and lucky-dip tools. No sign-up.";
  html = html.replace(/<meta\b[^>]*name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}">`);
  if (!/rel=["']preload["'][^>]*href=["']\/assets\/perf\/logo\.webp["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `<link rel="preload" as="image" href="/assets/perf/logo.webp" fetchpriority="high">\n</head>`);
  }
  return html;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const isPreview = host === "wheelnamepicker.pages.dev" || host.endsWith(".wheelnamepicker.pages.dev");
    if (!isPreview && (url.protocol !== "https:" || host !== CANONICAL_HOST)) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.href, 301);
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
    html = applyHomepageMetadata(html, url.pathname);
    html = fixWheelLogoSizing(html);
    html = ensureApprovedFooter(html);

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-ADG-URL-Hygiene", "wheel-clean-v6");
    headers.set("X-ADG-Visual-Shell", "wheel-shell-fix-v3");
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
