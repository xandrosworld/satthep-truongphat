(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP,CV=typeof module!=='undefined'?require('./conventions-core.js'):root.TPConventions;
function inspect(db){const parameters=new Map(),stocks=new Map(),reserved=new Set(['BW','SA','CW','CA','RHO','PI','E','L0','W0','PHOI_D','PHOI_R','KL_DV','DT_DV']),declared=CV.entries(db,'parameters');
 const param=(key,source,label='',unit='')=>{if(!/^[A-Za-z][A-Za-z0-9_]{0,23}$/.test(key)||reserved.has(key))return;const p=parameters.get(key)||{key,label:'',unit:'',sources:[]};p.label||=label;p.unit||=unit;if(!p.sources.includes(source))p.sources.push(source);parameters.set(key,p);};
 const expression=(expr,source)=>{if(typeof expr!=='string')return;for(const key of expr.match(/\b[A-Z][A-Z0-9_]*\b/g)||[])param(key,source);};
 const shape=(d,source)=>{if(!d)return;for(const f of d.fields||[])param(f.key,source,f.name,f.unit);for(const k of ['length','width','mass','surface','blankMass','blankSurface','condition'])expression(d[k],source);};
 const material=(m,source)=>{if(!m)return;shape(m.shapeDefinition,source);for(const key of Object.keys(m.props||{}))param(key,source);if(m.shape==='piece')return;const base=m.shape==='sheet'?'sheet':'bar',length=Number(m.stockL),width=base==='sheet'?Number(m.stockW):0;if(!(length>0)||base==='sheet'&&!(width>0))return;const key=[base,length,width].join(':'),s=stocks.get(key)||{key,base,length,width,sources:[]};if(!s.sources.includes(source))s.sources.push(source);stocks.set(key,s);};
 for(const d of db.shapeDefinitions||[])shape(d,'Quy ước '+d.name);for(const r of db.rules||[]){expression(r.length,'Công thức '+r.name);expression(r.width,'Công thức '+r.name);}for(const m of db.materials||[])material(m,'Mã '+m.id);
 for(const [nodes,source]of [[db.quote?.products||[],'Báo giá'],[db.library||[],'Thư viện mẫu']])for(const n of C.flatten(nodes)){const label=source+' / '+n.name;for(const key of Object.keys({...n.params,...n.dims}))param(key,label);material(n.spec,label);expression(n.ruleSpec?.length,label);expression(n.ruleSpec?.width,label);for(const rule of Object.values(n.measurementRules||{}))expression(typeof rule==='string'?rule:rule?.formula,label);}
 const pending=[...parameters.values()].map(p=>{const d=declared.find(x=>x.name===p.key);return {...p,label:d?.label||p.label,unit:d?.unit||p.unit,registered:!!d,needsDeclaration:!d||!String(d.label||'').trim()||!String(d.unit||'').trim()};}).filter(p=>p.needsDeclaration).sort((a,b)=>a.key.localeCompare(b.key));
 const missingStocks=[...stocks.values()].filter(s=>!(db.stockSizes||[]).some(x=>x.active!==false&&x.base===s.base&&Number(x.length)===s.length&&(s.base!=='sheet'||Number(x.width)===s.width)));
 return {parameters:pending,stocks:missingStocks};
}
const api={inspect};if(typeof module!=='undefined')module.exports=api;else root.TPCatalogAudit=api;
})(typeof globalThis!=='undefined'?globalThis:this);
