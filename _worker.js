// Final response repair wrapper. Core site behaviour remains in worker-base.js.
import baseWorker from "./worker-base.js";

const ORG_ID = "https://ascensiondigitalgroup.com/#org";
const ORG_NAME = "Ascension Digital Group";
const ORG_URL = "https://ascensiondigitalgroup.com";
const ORG_LOGO = "https://wheelnamepicker.com.au/assets/perf/ascension-digital.webp";
const ADG_DOWNLOADS_LOGO = "/assets/perf/logo-adg-downloads.webp";

function repairJsonLdValue(value) {
  if (Array.isArray(value)) return value.map(repairJsonLdValue);
  if (!value || typeof value !== "object") return value;

  const out = { ...value };

  if (out.publisher && typeof out.publisher === "object" && out.publisher["@id"] === ORG_ID) {
    out.publisher = { "@id": ORG_ID };
  }

  for (const [key, child] of Object.entries(out)) {
    if (key === "publisher") continue;
    out[key] = repairJsonLdValue(child);
  }

  if (out["@type"] === "Organization" && out["@id"] === ORG_ID) {
    out.name = ORG_NAME;
    out.url = ORG_URL;
    out.logo = {
      "@type": "ImageObject",
      url: ORG_LOGO
    };
  }

  return out;
}

export function repairOrganizationSchema(html, pathname = "/") {
  if (pathname !== "/") return html;

  return html.replace(
    /<script\b([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi,
    (whole, attrs, jsonText) => {
      try {
        const parsed = JSON.parse(jsonText);
        const repaired = repairJsonLdValue(parsed);
        return `<script${attrs}>${JSON.stringify(repaired, null, 2)}</script>`;
      } catch {
        return whole;
      }
    }
  );
}

export function ensureAdgDownloadsFooter(html) {
  return html.replace(/<footer\b[\s\S]*?<\/footer>/i, footer => {
    if (/logo-adg-downloads\.webp/i.test(footer)) return footer;

    const block = `<div class="foot-adg-downloads" data-adg-downloads-footer="true" style="display:flex;justify-content:center;align-items:center;margin:18px auto"><a href="https://ascensiondigitalgroup.com" target="_blank" rel="noopener" title="ADG Downloads"><img src="${ADG_DOWNLOADS_LOGO}" alt="ADG Downloads" width="52" height="52" loading="lazy" decoding="async"></a></div>`;
    return footer.replace(/<\/footer>/i, `${block}</footer>`);
  });
}

export default {
  async fetch(request, env, ctx) {
    const response = await baseWorker.fetch(request, env, ctx);
    const url = new URL(request.url);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || !contentType.includes("text/html")) {
      return response;
    }

    let html = await response.text();
    html = ensureAdgDownloadsFooter(html);
    html = repairOrganizationSchema(html, url.pathname);

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-ADG-Footer-Downloads", "enforced-v1");
    if (url.pathname === "/") headers.set("X-ADG-Structured-Data", "org-schema-v1");

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
