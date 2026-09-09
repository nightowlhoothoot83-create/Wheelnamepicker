// Regression guard for homepage Organization JSON-LD repair.
import fs from 'node:fs';

const wrapper = fs.readFileSync('_worker.js', 'utf8');
const base = fs.readFileSync('worker-base.js', 'utf8');

const checks = [
  ['wrapper delegates to base worker', /import baseWorker from "\.\/worker-base\.js"/],
  ['organization id is explicit', /https:\/\/ascensiondigitalgroup\.com\/#org/],
  ['organization name is explicit', /Ascension Digital Group/],
  ['organization logo is absolute', /https:\/\/wheelnamepicker\.com\.au\/assets\/perf\/ascension-digital\.webp/],
  ['publisher stubs collapse to id-only references', /out\.publisher = \{ "@id": ORG_ID \}/],
  ['organization node receives logo', /out\.logo = \{/],
  ['served homepage receives schema repair', /repairOrganizationSchema\(await response\.text\(\), url\.pathname\)/],
  ['base worker retains homepage metadata handling', /function applyHomepageMetadata\(/]
];

let failed = false;
for (const [name, re] of checks) {
  const source = name.includes('base worker') ? base : wrapper;
  if (!re.test(source)) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed) process.exit(1);
console.log('Organization schema regression guard passed.');
