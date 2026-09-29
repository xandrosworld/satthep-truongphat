// Regression checks for the September 29 workflow fixes. Requires Node 22+ and Edge.
const {spawnSync}=require('node:child_process');
const api=['customer-duplicates','personnel-source','personnel','organization-delete','organization','department-assignment','action-access','section-access','formula-access','extra-factor-access','logistics-technical-save','logistics-lots','request-context','service-requests','material-requests','department-material-requests'];
const browser=['cost-factor-lock','coefficient-locks','logistics-permissions-save','logistics-method-picker','logistics-technical-save','permissions-unified','organization-rename','customer-save','console-workspace','console-workspace-server','chat-frame','quote-list-navigation','material-requests','request-context','service-requests','department-material-requests'];
function run(args){const result=spawnSync(process.execPath,args,{cwd:require('node:path').resolve(__dirname,'..'),stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
run(['--test',...api.map(name=>'tests/'+name+'.test.cjs')]);
run(require('../package.json').scripts.test.replace(/^node /,'').split(/\s+/));
for(const name of browser)run(['tests/'+name+'-browser.cjs']);
