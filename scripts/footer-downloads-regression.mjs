import fs from 'node:fs';

const wrapper = fs.readFileSync('_worker.js', 'utf8');

const checks = [
  ['footer repair function exists', /function ensureAdgDownloadsFooter\(/],
  ['approved ADG Downloads asset is used', /\/assets\/perf\/logo-adg-downloads\.webp/],
  ['repair scopes itself to footer markup', /<footer\\b\[\\s\\S\]\*\?<\\\/footer>/],
  ['existing footer logo is not duplicated', /if \(\/logo-adg-downloads\\\.webp\/i\.test\(footer\)\) return footer;/],
  ['missing footer logo is injected before closing footer', source => source.includes('return footer.replace(/<\\/footer>/i, `${block}</footer>`);')],
  ['repair runs for served HTML', /html = ensureAdgDownloadsFooter\(html\);/],
  ['footer enforcement response marker exists', /X-ADG-Footer-Downloads/]
];

let failed = false;
for (const [name, test] of checks) {
  const passed = typeof test === 'function' ? test(wrapper) : test.test(wrapper);
  if (!passed) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed) process.exit(1);
console.log('ADG Downloads footer regression guard passed.');
