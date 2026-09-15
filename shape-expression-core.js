/* Arithmetic and dimensional checks for user-declared shape formulas. No code execution. */
(function(root){'use strict';
const functions={MIN:[1,24],MAX:[1,24],SUM:[1,24],AVG:[1,24],ROUND:[1,2],ROUNDUP:[1,2],ROUNDDOWN:[1,2],CEIL:[1,1],FLOOR:[1,1],SQRT:[1,1],ABS:[1,1],POW:[2,2],MOD:[2,2],CLAMP:[3,3],IF:[3,3],SIGN:[1,1],SIN:[1,1],COS:[1,1],TAN:[1,1],DIV:[2,2],PI:[0,0]};
function parse(source){
  const text=String(source);if(text.length>500)throw Error('Công thức tối đa 500 ký tự');
  const tokens=text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z_][A-Za-z_0-9]*|>=|<=|==|!=|[()+\-*/^,<>]/g)||[];
  if(tokens.join('')!==text.replace(/\s/g,''))throw Error('Công thức chứa ký tự không hỗ trợ');
  let p=0,depth=0;
  const nested=fn=>{if(++depth>20)throw Error('Công thức lồng ngoặc quá sâu');const n=fn();depth--;return n;};
  const take=t=>{if(tokens[p++]!==t)throw Error('Thiếu dấu '+t);};
  function atom(){
    const t=tokens[p++];if(t===undefined)throw Error('Công thức chưa hoàn chỉnh');
    if(t==='(')return nested(()=>{const n=compare();take(')');return n;});
    if(/^(?:\d|\.)/.test(t))return {type:'number',value:Number(t)};
    if(!/^[A-Za-z_]/.test(t))throw Error('Công thức chưa hoàn chỉnh tại '+t);
    if(tokens[p]!=='(')return {type:'var',name:t};
    if(!Object.hasOwn(functions,t))throw Error('Hàm không hỗ trợ: '+t);
    return nested(()=>{p++;const args=[];if(tokens[p]!==')'){args.push(compare());while(tokens[p]===','){p++;args.push(compare());}}take(')');const [min,max]=functions[t];if(args.length<min||args.length>max)throw Error('Số đối số không đúng cho '+t);return {type:'call',name:t,args};});
  }
  function power(){let n=atom();if(tokens[p]==='^'){p++;n={type:'call',name:'POW',args:[n,nested(unary)]};}return n;}
  function unary(){if(tokens[p]==='+'||tokens[p]==='-'){const op=tokens[p++];return {type:'unary',op,node:nested(unary)};}return power();}
  function binary(next,ops){let n=next();while(ops.includes(tokens[p])){const op=tokens[p++];n={type:'binary',op,left:n,right:next()};}return n;}
  const term=()=>binary(unary,['*','/']),sum=()=>binary(term,['+','-']),compare=()=>binary(sum,['>','<','>=','<=','==','!=']);
  const ast=compare();if(p!==tokens.length)throw Error('Công thức không hợp lệ');return ast;
}
const finite=v=>{if(!Number.isFinite(v))throw Error('Kết quả công thức không hợp lệ');return v;};
function evaluate(ast,vars){
  function walk(n){
    if(n.type==='number')return n.value;
    if(n.type==='var'){if(!Object.hasOwn(vars,n.name))throw Error('Tham số không hợp lệ: '+n.name);return finite(Number(vars[n.name]));}
    if(n.type==='unary')return (n.op==='-'?-1:1)*walk(n.node);
    if(n.type==='binary'){
      const a=walk(n.left),b=walk(n.right);
      if(n.op==='/'){if(b===0)throw Error('Không thể chia cho 0');return finite(a/b);}
      return finite(({'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'>':()=>+(a>b),'<':()=>+(a<b),'>=':()=>+(a>=b),'<=':()=>+(a<=b),'==':()=>+(a===b),'!=':()=>+(a!==b)})[n.op]());
    }
    if(n.name==='IF')return walk(n.args[walk(n.args[0])!==0?1:2]);
    const a=n.args.map(walk),x=a[0];let v;
    switch(n.name){
      case 'PI':v=Math.PI;break;
      case 'MIN':v=Math.min(...a);break;case 'MAX':v=Math.max(...a);break;
      case 'SUM':v=a.reduce((s,x)=>s+x,0);break;case 'AVG':v=a.reduce((s,x)=>s+x,0)/a.length;break;
      case 'ABS':v=Math.abs(x);break;case 'SIGN':v=Math.sign(x);break;
      case 'CEIL':v=Math.ceil(x);break;case 'FLOOR':v=Math.floor(x);break;
      case 'SQRT':if(x<0)throw Error('SQRT cần số không âm');v=Math.sqrt(x);break;
      case 'POW':v=Math.pow(x,a[1]);break;
      case 'SIN':v=Math.sin(x);break;case 'COS':v=Math.cos(x);break;case 'TAN':v=Math.tan(x);break;
      case 'MOD':case 'DIV':if(a[1]===0)throw Error('Không thể chia cho 0');v=n.name==='MOD'?x%a[1]:Math.trunc(x/a[1]);break;
      case 'CLAMP':if(a[1]>a[2])throw Error('CLAMP cần cận dưới không lớn hơn cận trên');v=Math.max(a[1],Math.min(a[2],x));break;
      default:{const digits=a[1]??0;if(!Number.isInteger(digits)||Math.abs(digits)>12)throw Error('Số chữ số làm tròn phải là số nguyên từ -12 đến 12');const scale=10**digits,round=n.name==='ROUNDUP'?Math.ceil:n.name==='ROUNDDOWN'?Math.floor:Math.round;v=Math.sign(x)*round(Math.abs(x)*scale)/scale;}
    }
    return finite(v);
  }
  return finite(walk(ast));
}
function dimension(ast,vars){
  const zero=()=>({d:[0,0],literal:true}),same=(a,b)=>a.d.every((x,i)=>Math.abs(x-b.d[i])<1e-10);
  function compatible(a,b){if(!a.literal&&!b.literal&&!same(a,b))throw Error('Cộng/trừ hoặc hàm dùng các đại lượng khác đơn vị');return {d:a.literal?b.d:a.d,literal:a.literal&&b.literal};}
  const scalar=a=>{if(a.d.some(x=>x!==0))throw Error('Đối số cần không có đơn vị');};
  function walk(n){
    if(n.type==='number')return zero();
    if(n.type==='var'){if(!Object.hasOwn(vars,n.name))throw Error('Tham số không hợp lệ: '+n.name);return {d:vars[n.name],literal:false};}
    if(n.type==='unary')return walk(n.node);
    if(n.type==='binary'){
      const a=walk(n.left),b=walk(n.right);
      if(['*','/'].includes(n.op))return {d:a.d.map((x,i)=>x+(n.op==='*'?1:-1)*b.d[i]),literal:a.literal&&b.literal};
      const r=compatible(a,b);return ['+','-'].includes(n.op)?r:{d:[0,0],literal:false};
    }
    const args=n.args.map(walk),a=args[0],b=args[1];
    if(n.name==='PI')return zero();
    if(n.name==='IF'){scalar(a);return compatible(b,args[2]);}
    if(['MIN','MAX','SUM','AVG','MOD','CLAMP'].includes(n.name))return args.reduce(compatible);
    if(n.name==='DIV')return {d:a.d.map((v,i)=>v-b.d[i]),literal:a.literal&&b.literal};
    if(['ROUND','ROUNDUP','ROUNDDOWN'].includes(n.name)){if(b)scalar(b);return a;}
    if(['CEIL','FLOOR','ABS'].includes(n.name))return a;
    if(n.name==='SIGN')return {d:[0,0],literal:a.literal};
    if(['SIN','COS','TAN'].includes(n.name)){scalar(a);return {d:[0,0],literal:a.literal};}
    if(n.name==='SQRT')return {d:a.d.map(x=>x/2),literal:a.literal};
    scalar(b);if(!b.literal&&a.d.some(x=>x!==0))throw Error('Số mũ của đại lượng có đơn vị phải là hằng số');
    return {d:a.d.every(x=>x===0)?[0,0]:a.d.map(x=>x*evaluate(n.args[1],{})),literal:a.literal&&b.literal};
  }
  return walk(ast);
}
const api={functions,parse,evaluate,dimension,formula:(source,vars)=>evaluate(parse(source),vars)};
if(typeof module!=='undefined')module.exports=api;else root.TPShapeExpression=api;
})(typeof window!=='undefined'?window:globalThis);
