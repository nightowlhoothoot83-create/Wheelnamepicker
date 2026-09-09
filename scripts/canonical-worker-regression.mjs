import fs from 'node:fs';

const worker = fs.readFileSync('_worker.js', 'utf8');

const checks = [
  ['anchor-only href rewriting', /html\.replace\(\/<a\\b\[\^>\]\*>\/gi/],
  ['absolute canonical guard', /function ensureAbsoluteCanonical\(/],
  ['canonical guard runs after link rewrite', /rewriteInternalLinks\(html, url\.href\);\s*html = ensureAbsoluteCanonical\(html, url\.pathname\);/],
  ['canonical host remains production host', /const CANONICAL_HOST = "wheelnamepicker\.com\.au"/],
  ['URL hygiene version bumped', /X-ADG-URL-Hygiene", "wheel-clean-v8"/]
];

let failed = false;
for (const [name, re] of checks) {
  if (!re.test(worker)) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed) process.exit(1);
console.log('Canonical worker regression guard passed.');
