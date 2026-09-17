'use strict';
const F=require('./tmc-fixture.cjs'),G=require('../group-pricing-core.js');
function seed(){const d=F.seed(),q=d.quote,n=q.products[0];n.productGroup='Tủ điện';n.tmcScope='detail';delete n.tmcKind;
 Object.assign(q.pricing,{selected:'detail',incoming:0,outgoing:0,delivery:0,install:0,overhead:10,management:0,special:0,profit:20,processing:0,order:0,customer:0});
 const formula=(formula)=>({mode:'formula',formula,reason:'Số kiểm thử độc lập, không phải đơn giá khách'});
 const g={id:'grp-cabinet-flow',name:'Tủ điện',engine:'components',productGroups:['Tủ điện'],source:'Luồng kiểm thử, không dùng báo giá thật',parameters:[],netConfirmed:true,flow:{rules:{factory:formula('Q * 50'),ancillary:formula('Q * 100'),deviceProduction:formula('Q * 5'),deviceInstallation:formula('Q * 7'),delivery:formula('Q * 10'),install:formula('Q * 20')}}};
 G.saveGroup(q,g);G.assign(q,n.id,g.id);q.pricing.comparisonMethods=['detail','group:'+g.id];q.pricing.selected='group:'+g.id;return d;
}
module.exports={seed,confirm:F.confirm};
