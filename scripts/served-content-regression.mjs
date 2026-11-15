import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('worker-base.js','utf8');
const {default:worker}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const visible=html=>html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
const routes=[['/','index.html'],['/about','about.html'],['/privacy','privacy.html'],['/cookies','cookies.html'],['/terms','terms.html'],['/coin-toss','coin-toss'],['/dice-roller','dice-roller'],['/random-number-picker','random-number-picker']];
for(const [route,file] of routes){
  const input=fs.readFileSync(file,'utf8');
  const response=await worker.fetch(new Request(`https://wheelnamepicker.com.au${route}`),{ASSETS:{fetch:async()=>new Response(input,{headers:{'content-type':'text/html'}})}});
  assert.equal(response.status,200);
  const output=await response.text();
  const copy=visible(output);
  assert.doesNotMatch(copy,/AdSense|formal informal selections|regulated informal selections|re-skinning|random random number|advertising advertising|site is supported by Google/i,route);
  assert.match(output,/assets\/perf\/ascension-digital\.webp/,route);
  assert.match(output,/assets\/perf\/logo-adg-downloads\.webp/,route);
  if(route==='/'){
    assert.match(copy,/regulated raffles/);
    assert.match(output,/id="soundToggle"/);
    assert.match(output,/id="spinner"/);
  }
  if(route==='/privacy'){
    assert.match(copy,/current page's memory/);
    assert.match(copy,/If Google advertising is enabled and you accept optional cookies/);
    assert.doesNotMatch(copy,/publisher ID|no personal data at risk|stored only in your browser's local storage/i);
  }
  if(route==='/cookies')assert.match(copy,/local storage does not automatically clear when a tab closes/);
}
assert.equal(fs.readFileSync('ads.txt','utf8').trim(),'google.com, pub-1904958390525375, DIRECT, f08c47fec0942fa0');
assert.match(fs.readFileSync('cookie-consent.js','utf8'),/if \(choice === "accepted"\) loadAds\(\)/);
console.log('Served content checks passed for eight core pages; ad configuration and tool controls preserved.');
