Canonical SEO fix, 9 Sep 2026

- Prevent Cloudflare worker from rewriting <link rel="canonical"> href values.
- Rewrite only anchor (<a>) href attributes.
- Force absolute production canonicals on the expanded tool/guide routes.
- Keep /lucky-dip as a redirect-only legacy route.
- Neutralise stale About-page wording that implied AdSense approval.
- Add CI regression guard for canonical rewriting.
