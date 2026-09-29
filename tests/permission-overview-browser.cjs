const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage();try{await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
const id=await p.evaluate(async()=>{const password='Permission-source-2026!';teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));const u=await teamApi('users','POST',{username:'worker',name:'Worker',role:'technical',sections:['bom'],password}),r=await teamApi('roles','POST',{name:'Technical',role:'technical',sections:['bom','operations']}),d=await teamApi('organization');d.departments=[{id:'d',name:'Technical',stage:'technical',active:true}];d.positions=[{id:'p',name:'Engineer',departmentId:'d',roleIds:[r.id],active:true}];d.employees.find(e=>e.userId===u.id).positionIds=['p'];await teamApi('organization','PUT',{expectedVersion:d.version,document:d});await teamUsers();return d.employees.find(e=>e.userId===u.id).id;});

const userId=await p.evaluate(async id=>(await teamApi('organization')).employees.find(e=>e.id===id).userId,id);
const open=async()=>{await p.evaluate(()=>teamUsers());await p.locator('[data-org=permissions][data-id="'+userId+'"]').click();await expect(p.locator('[data-permission-overview]')).toBeVisible();};
await open();
await expect(p.locator('[data-permission-overview]')).toContainText('Nguồn phân quyền: Theo vị trí');
await expect(p.locator('[data-effective-permissions] [name=role]')).toBeDisabled();
await expect(p.locator('[data-org=governance-employee]')).toHaveText('Sửa vị trí kiêm nhiệm');
await p.locator('[data-org=permission-source]').click();
await p.locator('#dialog [name=source]').selectOption('direct');await p.locator('#dialog [type=submit]').click();
await expect(p.locator('[data-permission-overview]')).toContainText('Nguồn phân quyền: Trực tiếp');
await p.locator('[data-access=edit-user]').click();
await expect(p.locator('#dialog [name=role]')).toBeEnabled();
await p.locator('#dialog [type=submit]').click();
await expect(p.locator('[data-org=permissions][data-id="'+userId+'"]')).toBeVisible();
await open();
await p.locator('[data-org=permission-source]').click();
await p.locator('#dialog [name=source]').selectOption('position');await p.locator('#dialog [type=submit]').click();
await expect(p.locator('[data-permission-overview]')).toContainText('Nguồn phân quyền: Theo vị trí');
await p.locator('[data-org=governance-employee]').click();
await expect(p.locator('#dialog [name=positionIds]')).toBeEnabled();
await open();
await expect(p.locator('[data-effective-permissions] [name=role]')).toBeDisabled();
console.log('PASS unified permissions entry, both sources, direct save, position editing and reload');

}finally{await b.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
