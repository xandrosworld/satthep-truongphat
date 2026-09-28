const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core'),I=require('../intake-core');
test('missing, invalid and negative material prices have distinct diagnostics; zero and positive are valid',()=>{
 for(const [value,message]of [[null,'chưa nhập giá trị'],['','chưa nhập giá trị'],['abc','cần nhập số hợp lệ'],[-1,'giá trị không được âm'],[0,null],[18500,null]]){
  const d=P.demoSeed(),r=I.priceRows(d)[0];for(const t of r.targets)t.price=value;
  const errors=P.calculate(d).errors.filter(e=>e.startsWith(r.id+' / đơn giá vật tư:'));
  if(message)A.ok(errors.some(e=>e.endsWith(message)),JSON.stringify(errors));else A.deepEqual(errors,[]);
 }
});
