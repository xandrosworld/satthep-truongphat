'use strict';
const C=require('../core.js'),AA=require('../action-access.js');
const canPrice=u=>u.role==='admin'||AA.allows(u,'production','reviewPricing',false)&&require('./access.cjs').permissions(u).costs;
function create(sql){
 const get=(kind,id)=>{const r=sql.prepare('SELECT document FROM ops_records WHERE kind=? AND id=?').get(kind,id);return r&&JSON.parse(r.document);};
 function prices(j,operations){
 let d=get('production-source',j.id);if(!d){const order=sql.prepare('SELECT quote_id,quote_version FROM orders WHERE id=?').get(j.order_id),r=sql.prepare('SELECT document FROM revisions WHERE id=? AND version=?').get(order.quote_id,order.quote_version);d=JSON.parse(r.document);d.quote.products=d.quote.products.filter(p=>p.id===j.product_id);d.quote.products[0].qty=j.quantity;}
 const result=C.calculate(d),saved=get('production-route-prices',j.id)||[];
 return operations.map(o=>{const old=saved.find(x=>x.operationId===o.id),index=Number(o.id.split(':').pop()),computed=result.nodes[o.nodeId]?.ownOps?.find(x=>x.index===index);const unitPrice=old?.unit===o.unit?old.unitPrice:computed?.unit===o.unit?computed.rate:null;return {operationId:o.id,name:o.name,unit:o.unit,unitPrice};});
 }
 function impact(p){const total=ops=>ops.reduce((sum,o)=>{const price=p.operationPrices?.find(x=>x.operationId===o.id);return sum+(price?.unit===o.unit&&price.unitPrice!==null?o.workQuantity*price.unitPrice:0);},0);return {before:p.costBefore??0,after:total(p.operations),missing:p.operationPrices.filter(x=>x.unitPrice===null).map(x=>x.operationId)};}
 function clean(p,u){const {operationPrices,costBefore,costImpact,...v}=p;return canPrice(u)?p:v;}
 return {prices,impact,clean,canPrice};
}
module.exports={create};
