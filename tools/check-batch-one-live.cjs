'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dir = path.resolve(process.env.BATCH_ONE_VERIFY_ROOT || path.join(root, 'artifacts/customer-review/batch-01-2026-09-14'), 'live');
const url = 'https://baogia-truongphat.netlify.app/';
const sha = text => createHash('sha256').update(text).digest('hex');
const lf = text => text.replace(/\r\n/g, '\n');

(async () => {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error('HTTP ' + response.status);
  const deployed = lf(await response.text());
  const local = lf(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'));
  const verified = JSON.parse(fs.readFileSync(path.join(dir, '..', 'verification.json'), 'utf8'));
  // Permit only the exact public toolbar append observed on this Netlify site.
  // Never strip arbitrary scripts or content within the application.
  const toolbar = '<script async src="/.netlify/scripts/hud?variant=public" data-nf-variant="public" data-netlify-site-id="90401cf6-e7b8-469b-9421-e4c4be2fc3ae" data-app-host="app.netlify.com"></script>\n';
  const exact = deployed === local;
  const toolbarOnly = deployed === local + toolbar;
  const localVerified = verified.passed === true && verified.buildHashLF === sha(local);
  const report = {
    at: new Date().toISOString(), url, httpStatus: response.status,
    checkoutCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    normalization: 'CRLF -> LF; compare entire HTML, allow only exact appended Netlify public toolbar',
    deployedHashLF: sha(deployed), applicationHashLF: sha(local),
    expectedVerifiedHashLF: verified.buildHashLF,
    localMatchesVerifiedBuild: localVerified,
    deployedEqualsLocal: exact,
    deployedEqualsLocalPlusKnownToolbar: toolbarOnly,
    appendedToolbar: toolbarOnly ? toolbar : null,
    passed: localVerified && (exact || toolbarOnly)
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'deployment-check.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
