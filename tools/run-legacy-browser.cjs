// Run existing regression suites with their original tray + frame fixture.
// The new default sample is intentionally different; this runner does not alter product code.
const path=require('node:path');
const {chromium}=require('@playwright/test');
const fixtures=require('../core.js').seed();
const name=process.argv[2];
if(!['remnants-browser','model3d-browser','scroll-browser','site-review'].includes(name))throw Error('Unknown regression suite');
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
  const browser=await launch({...options,executablePath:undefined,channel:'msedge'});
  const newPage=browser.newPage.bind(browser);
  browser.newPage=async options=>{
    const page=await newPage(options);
    await page.addInitScript(data=>{if(!localStorage.getItem('truongphat-quotation-v2'))localStorage.setItem('truongphat-quotation-v2',JSON.stringify(data));},fixtures);
    return page;
  };
  return browser;
};
if(!process.argv.includes('--offline'))process.argv.push('--offline');
require(path.resolve(__dirname,'../tests',name+'.cjs'));
