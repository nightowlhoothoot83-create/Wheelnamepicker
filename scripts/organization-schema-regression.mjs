// Regression guard for homepage Organization JSON-LD repair.
import fs from 'node:fs';

const wrapper = fs.readFileSync('_worker.js', 'utf8');
const base = fs.readFileSync('worker-base.js', 'utf8');

const checks = [
  ['wrapper delegates to base worker', source => source.includes('import baseWorker from "./worker-base.js";')],
  ['organization id is explicit', source => /https:\/\/ascensiondigitalgroup\.com\/#org/.test(source)],
  ['organization name is explicit', source => /Ascension Digital Group/.test(source)],
  ['organization logo is absolute', source => /https:\/\/wheelnamepicker\.com\.au\/assets\/perf\/ascension-digital\.webp/.test(source)],
  ['publisher stubs collapse to id-only references', source => /out\.publisher = \{ "@id": ORG_ID \}/.test(source)],
  ['organization node receives logo', source => /out\.logo = \{/.test(source)],
  ['served homepage receives schema repair', source => /repairOrganizationSchema\(await response\.text\(\), url\.pathname\)/.test(source)],
  ['base worker retains homepage metadata handling', source => /function applyHomepageMetadata\(/.test(source)]
];

let failed = false;
for (const [name, test] of checks) {
  const source = name.includes('base worker') ? base : wrapper;
  if (!test(source)) {
    console.error(`FAIL: ${name}`);
    failed = true;
  } else {
    console.log(`PASS: ${name}`);
  }
}

if (failed) process.exit(1);
console.log('Organization schema regression guard passed.');
