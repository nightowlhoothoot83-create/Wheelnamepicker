import fs from 'node:fs';
import path from 'node:path';
const expected='google.com, pub-1904958390525375, DIRECT, f08c47fec0942fa0';
const fail=[];
const adgLogoPattern=/(?:assets\/perf\/ascension-digital\.webp|logo-ascension-digital\.png|assets\/perf\/logo-ascension-digital\.webp|mycalendartools\.net\/assets\/perf\/ascension-digital\.webp)/gi;
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.name==='.git'?[]:e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.html')?[path.join(p,e.name)]:[]);
const files=walk('.');
for(const file of files){
  const s=fs.readFileSync(file,'utf8');
  if(/href=["'][^"']*\.html/i.test(s))fail.push(`${file}: internal .html link`);
  if(/url:\s*["'][^"']*\.html|location\.href=["'][^"']*\.html/i.test(s))fail.push(`${file}: scripted .html link`);
  if(!/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/wheelnamepicker\.com\.au\//i.test(s))fail.push(`${file}: missing absolute canonical`);
  const adgLogos=(s.match(adgLogoPattern)||[]).length;
  if(adgLogos>1)fail.push(`${file}: duplicate Ascension Digital logo anywhere on page`);
}
const worker=fs.readFileSync('_worker.js','utf8');
if(!worker.includes('endsWith(".wheelnamepicker.pages.dev")'))fail.push('_worker.js: branch preview host allowance missing');
if(!worker.includes('ensureAdgDownloadsAllPages'))fail.push('_worker.js: ADG Downloads all-page footer guard missing');
if(!worker.includes('/assets/perf/logo-adg-downloads.webp'))fail.push('_worker.js: approved ADG Downloads asset missing');
const home=fs.readFileSync('index.html','utf8');
if((home.match(adgLogoPattern)||[]).length!==1)fail.push('index.html: expected exactly one Ascension Digital logo');
if(!home.includes('55 free online calculators across 7 categories'))fail.push('index.html: MyCalcTools count must remain 55');
if(/46 free online calculators/i.test(home))fail.push('index.html: stale MyCalcTools count returned');
if(fs.readFileSync('ads.txt','utf8').trim()!==expected)fail.push('ads.txt: publisher line mismatch');
if(/<loc>[^<]*\.html/i.test(fs.readFileSync('sitemap.xml','utf8')))fail.push('sitemap.xml: redirected .html URL');
if(fail.length){console.error(fail.join('\n'));process.exit(1)}
console.log(`Wheel Name Picker integrity passed (${files.length} HTML files)`);
