// Create test accounts through the same approved personnel workflow as production.
const {randomUUID}=require('node:crypto'),assert=require('node:assert/strict');
module.exports=async function personnelUser(call,admin,body){
 const role=await call('roles','POST',{...body,name:'Fixture '+body.username},admin);assert.equal(role.status,201);
 let d=(await call('organization','GET',undefined,admin)).data;
 const departmentId=randomUUID(),positionId=randomUUID();d.departments.push({id:departmentId,name:'Fixture '+body.username,stage:'other',active:true});d.positions.push({id:positionId,name:'Fixture',departmentId,roleIds:[role.data.id],active:true,manager:false});
 assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},admin)).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;
 assert.equal((await call('personnel/submit','POST',{expectedVersion:d.version,employee:{code:'TEST-'+body.username,name:body.name,active:true,positionIds:[],profile:{}}},admin)).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;const r=d.requests.at(-1);
 assert.equal((await call('personnel/review','POST',{expectedVersion:d.version,id:r.id,action:'approve'},admin)).status,200);
 d=(await call('organization','GET',undefined,admin)).data;d.employees.find(e=>e.id===r.employeeId).positionIds=[positionId];assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},admin)).status,200);
 const created=await call('users','POST',{employeeId:r.employeeId,username:body.username,password:body.password},admin);assert.equal(created.status,201,JSON.stringify(created.data));return created.data;
};
