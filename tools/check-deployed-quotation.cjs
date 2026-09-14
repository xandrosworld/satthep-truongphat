'use strict';
// Run the existing UI scenarios against the public static build in a fresh
// browser context. All test writes stay in this context's browser storage.
// Do not run the local server/account scenarios against the customer's site.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const target = 'https://demo-banggia.netlify.app/';
const evidence = 'artifacts/customer-review/deployed-2026-09-13';
const testPath = path.resolve('tests/intake-browser.cjs');
let source = fs.readFileSync(testPath, 'utf8');
source = source.replace("path.resolve('artifacts/customer-review/implemented-2026-09-13')", `path.resolve('${evidence}')`);
const originalGoto = "await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);";
if (!source.includes(originalGoto)) throw new Error('UI test entry point changed; review this runner.');
source = source.replace(originalGoto, `
const liveResponse = await p.goto('${target}');
await p.locator('[data-page=customers]').waitFor();
const hash = data => require('node:crypto').createHash('sha256').update(data).digest('hex');
const remoteBody = await liveResponse.body();
const metadata = {
  url: p.url(), status: liveResponse.status(), checkedAt: new Date().toISOString(),
  deployedSha256: hash(remoteBody), localSha256: hash(fs.readFileSync('dist/index.html')),
  initialState: await p.evaluate(() => ({hasModernPricing: !!db.quote.pricing, products: db.quote.products.length, title: document.title})),
  scope: 'Fresh isolated browser; customer/request/material/quote edits only in test browser storage. No production API writes.'
};
metadata.matchesLocal = metadata.deployedSha256 === metadata.localSha256;
const localText = fs.readFileSync('dist/index.html', 'utf8');
const remoteText = remoteBody.toString('utf8');
const extra = remoteText.startsWith(localText) ? remoteText.slice(localText.length).trim() : null;
metadata.hostInjectedSuffix = extra;
metadata.applicationMatchesLocal = metadata.matchesLocal || (extra !== null && /^<script async src="\\/\\.netlify\\/scripts\\/hud\\?variant=public"[^>]*><\\/script>$/.test(extra));
fs.writeFileSync(path.join(dir, 'deployment-check.json'), JSON.stringify(metadata, null, 2));
console.log('DEPLOYMENT', JSON.stringify(metadata));
expect(metadata.status).toBe(200);
expect(metadata.applicationMatchesLocal).toBe(true);
await shot('00-first-open');
`);
const serverStart = source.indexOf("const app=require('../server/app.cjs').createApp();");
const checksEnd = source.indexOf('expect(errors).toEqual([]);', serverStart);
if (serverStart < 0 || checksEnd < 0) throw new Error('Server test boundary changed; review this runner.');
source = source.slice(0, serverStart) + source.slice(checksEnd);
const run = new Module(testPath, module);
run.filename = testPath;
run.paths = Module._nodeModulePaths(path.dirname(testPath));
run._compile(source, testPath);
