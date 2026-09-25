/* Reference scenarios use the same expense engine as quotations, without editing a catalog. */
(function(root){'use strict';
const W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
const I=typeof module!=='undefined'?require('./input-prices-core.js'):root.TPInputPrices;
const copy=x=>JSON.parse(JSON.stringify(x));
const inputs={netKg:1200,purchaseKg:1500,area:20,length:30,quantity:4,distance:25,trips:2,repeats:1,productGroup:'Cơ khí'};
function samples(){
 const rates={product_m:15000,kg_km:100,vehicle:500000,product_unit:250000,kg_net:500,kg_purchase:500,ton_net:500000,ton_purchase:500000,ton_km:100000,m2:20000,m:15000,unit:75000,trip:600000,km:20000,fixed:800000};
 const rows=W.METHODS.map(([method,name])=>({id:'MAU-'+method,name:'Mẫu · '+name,category:method==='product_unit'?'install':method==='vehicle'?'outgoing':method.includes('purchase')||method==='kg_km'?'incoming':'delivery',method,rate:rates[method],minimum:0,minimumScope:'total',massBasis:'net',distance:25,priceMode:'catalog',factors:[],productGroups:[],enabled:true,...(method==='vehicle'?{capacityKg:500,vehicleType:'Xe mẫu 500 kg'}:{}),...(method==='product_unit'?{productUnit:'bộ'}:{})}));
 rows.push({...copy(rows.find(r=>r.method==='kg_km')),id:'MAU-he-so',name:'Mẫu · kg × km có hệ số',priceMode:'factors',factors:[{id:'distance-demo',name:'Cự ly mẫu',param:'distance',enabled:true,tiers:[{max:null,percent:10}]}]});
 rows.push({...copy(rows.find(r=>r.method==='trip')),id:'MAU-toi-thieu',name:'Mẫu · mức tối thiểu mỗi chuyến',rate:200000,minimum:500000,minimumScope:'trip'});
 for(const method of ['m2','m','fixed'])rows.push({...copy(rows.find(r=>r.method===method)),id:'MAU-lap-'+method,name:'Mẫu lắp đặt · '+W.METHODS.find(x=>x[0]===method)[1],category:'install'});
 return rows;
}
function trial(row,values={},pricing={}){
 const v={...inputs,...values};I.validateExpense(row);
 for(const k of ['netKg','purchaseKg','area','length','quantity','distance','trips','repeats'])if(v[k]===''||v[k]==null||!Number.isFinite(Number(v[k]))||Number(v[k])<0)throw Error('Dữ liệu thử phải là số không âm: '+k);else v[k]=Number(v[k]);
 if(v.quantity<=0)throw Error('Số lượng sản phẩm thử phải lớn hơn 0');
 const product={id:'sample-product',kind:'product',name:'Sản phẩm thử',qty:v.quantity,unit:row.productUnit||'bộ',productGroup:v.productGroup,priceGroupId:v.priceGroupId||'detail',params:{L:v.length*1000/v.quantity},children:[]};
 const base={quote:{pricing},products:[{node:product,weight:v.netKg,material:1000000}],rows:[{id:'sample-material',productId:product.id,spec:{id:'VT-THU',shape:'sheet'},node:{},count:1,geometry:{weight:v.netKg,area:v.area,length:v.length*1000},purchasedWeight:v.purchaseKg}]};
 const e=I.applyExpense({id:'expense-trial',scope:'all',allocation:'equal',distance:v.distance,trips:v.trips,repeats:v.repeats,from:v.from||'',to:v.to||'',complexity:v.complexity||''},row);
 // A full-price group restriction is tested against the selected sample product, too.
 const report=W.expenses([e],base,[]);if(report.errors.length)throw Error(report.errors.join('; '));return report.items[0];
}
function formula(r){
 const kg=r.massBasis==='purchase'?'kg vật tư mua':'kg vận chuyển';
 const amount={product_m:'Chiều dài sản phẩm × số lượng / 1.000 (m)',kg_km:kg+' × km',ton_km:kg+' / 1.000 × km',vehicle:'Số chuyến (làm tròn lên theo tải trọng)',product_unit:'Số lượng sản phẩm',kg_net:'Kg vận chuyển',kg_purchase:'Kg vật tư mua',ton_net:'Kg vận chuyển / 1.000',ton_purchase:'Kg vật tư mua / 1.000',m2:'Diện tích (m²)',m:'Chiều dài (m)',unit:'Số lượng đối tượng',trip:'Số chuyến',km:'Quãng đường (km)',fixed:'1 gói'}[r.method]||'';
 return amount+' × đơn giá'+(r.priceMode!=='catalog'&&(r.factors||[]).some(f=>f.enabled!==false)?' × hệ số đang bật':'');
}
const api={inputs,samples,trial,formula};if(typeof module!=='undefined')module.exports=api;else root.TPExpensePreview=api;
})(typeof globalThis!=='undefined'?globalThis:this);
