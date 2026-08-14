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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.href, 301);
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("text/html")) return response;

    const html = rewriteInternalLinks(await response.text(), url.href);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-ADG-URL-Hygiene", "wheel-clean-v2");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
