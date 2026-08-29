const CANONICAL_HOST = "wheelnamepicker.com.au";

function cleanInternalHref(raw, baseUrl) {
  if (!raw || /^(?:#|tel:|javascript:|data:)/i.test(raw)) return raw;

  // Direct mailto links are rewritten by Cloudflare Email Address Obfuscation
  // into /cdn-cgi/l/email-protection URLs. Route them to the site's real
  // contact page instead so users and crawlers always get a valid destination.
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

function addAttrs(tag, attrs) {
  let updated = tag;
  for (const [name, value] of Object.entries(attrs)) {
    if (!new RegExp(`\\s${name}\\s*=`, "i").test(updated)) {
      updated = updated.replace(/\s*\/?>(\s*)$/, ` ${name}="${value}">$1`);
    }
  }
  return updated;
}

function optimizeImages(html) {
  // The Wheel hero is Lighthouse's LCP image. Keep it eager and give the
  // browser its intrinsic aspect ratio plus an explicit priority signal.
  html = html.replace(/<img\b[^>]*src=["']\/?logo\.png["'][^>]*class=["'][^"']*hero-logo[^"']*["'][^>]*>/gi, tag =>
    addAttrs(tag, { width: "280", height: "420", fetchpriority: "high", decoding: "async" })
  );

  // Reserve space for the compact navigation logo without making it lazy.
  html = html.replace(/<img\b[^>]*src=["']\/?logo\.png["'][^>]*>/gi, tag => {
    if (/hero-logo/i.test(tag)) return tag;
    return addAttrs(tag, { width: "29", height: "44", decoding: "async" });
  });

  const squareFooterAssets = [
    "logo-ascension-digital.png", "logo-adg-downloads.png", "logo-zyia-creations.png",
    "logo-spew-crew-kids.png", "logo-mystical-moments.png", "logo-mycalctools.png",
    "logo-mycalendartools.png", "logo-raven-sharp.png", "logo-feed-the-feed.png"
  ];
  for (const asset of squareFooterAssets) {
    const escaped = asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`<img\\b[^>]*src=["']\\/?${escaped}["'][^>]*>`, "gi");
    html = html.replace(re, tag => {
      const size = /logo-ascension-digital\.png/i.test(asset) ? "140" : "52";
      return addAttrs(tag, { width: size, height: size, loading: "lazy", decoding: "async" });
    });
  }

  html = html.replace(/<img\b[^>]*src=["']\/?ventraip-banner\.jpg["'][^>]*>/gi, tag =>
    addAttrs(tag, { width: "770", height: "513", loading: "lazy", decoding: "async" })
  );
  return html;
}

function applyHomepageMetadata(html, pathname) {
  if (pathname !== "/") return html;
  const description = "Free wheel spinner and random picker for names, numbers, chores, classrooms and games, plus coin flip, dice roller and lucky-dip tools. No sign-up.";
  html = html.replace(/<meta\b[^>]*name=["']description["'][^>]*>/i,
    `<meta name="description" content="${description}">`);
  if (!/rel=["']preload["'][^>]*href=["']\/logo\.png["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `<link rel="preload" as="image" href="/logo.png" fetchpriority="high">\n<style>.foot-adg-logo{width:140px!important;height:140px!important;object-fit:contain}</style>\n</head>`);
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

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("text/html")) return response;

    let html = await response.text();
    html = rewriteInternalLinks(html, url.href);
    html = applyHomepageMetadata(html, url.pathname);
    html = optimizeImages(html);

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-ADG-URL-Hygiene", "wheel-clean-v3");
    headers.set("X-ADG-Performance-Fix", "wheel-images-v1");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
