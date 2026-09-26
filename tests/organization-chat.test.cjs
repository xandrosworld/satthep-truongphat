const {test}=require('node:test'),A=require('node:assert/strict'),{retainedChatAccess}=require('../server/organization.cjs');
test('position removal retains only existing chat access for active employees',()=>{
 A.deepEqual(retainedChatAccess({role:'sales',active:1,action_access:JSON.stringify({chat:['view','send'],quotes:['view','edit']})},true),{chat:['view','send']});
 A.deepEqual(retainedChatAccess({role:'sales',active:1,action_access:'{}'},true),{chat:[]});
 A.deepEqual(retainedChatAccess({role:'sales',active:1,action_access:'{"chat":["view"]}'},true),{chat:['view']});
 A.deepEqual(retainedChatAccess({role:'sales',active:1,action_access:null},true),{chat:['view','send']});
 A.deepEqual(retainedChatAccess({role:'sales',active:1,action_access:null},false),{});
 A.deepEqual(retainedChatAccess({role:'sales',active:0,action_access:null},true),{});
});
