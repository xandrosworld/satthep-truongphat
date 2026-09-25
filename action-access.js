(function(root){
'use strict';
const labels={view:'Xem',create:'Thêm',edit:'Sửa',delete:'Xóa / hủy',submit:'Trình duyệt',approve:'Duyệt',reopen:'Mở sửa',confirm:'Xác nhận / bàn giao',assign:'Giao việc',export:'Xuất / in',import:'Nhập Excel',activate:'Yêu cầu tài khoản',review:'Duyệt hồ sơ',issue:'Phát hành lệnh',qc:'Kiểm tra chất lượng',complete:'Hoàn thành',send:'Gửi tin'};
const modules={
 reports:['Trung tâm báo cáo',['view','export']],
 finance:['Thu chi, công nợ và giá thành',['view','create','delete','approve','export']],
 attendance:['Chấm công',['view','edit','approve','reopen','export']],
 payroll:['Hồ sơ và bảng lương',['view','edit','approve','reopen','export']],
 inventory:['Kho và vật tư',['view','create','edit','delete','export']],
 purchasing:['Mua hàng',['view','create','edit','approve','delete','export']],
 workshop:['Điều hành xưởng',['view','create','edit','delete','export']],
 dailyWork:['Công việc và báo cáo ngày',['view','assign','edit','approve','export']],
 quotes:['Báo giá',['view','create','edit','delete','submit','approve','reopen','confirm','assign','export']],
 customers:['Khách hàng',['view','create','edit','delete','import','export']],
 orders:['Đơn hàng',['view','create','edit','delete','confirm','export']],
 contracts:['Hợp đồng',['view','create','edit','export']],
 payments:['Thu tiền hợp đồng',['view','create','delete']],
 costs:['Chi phí thực tế',['view','create','delete','approve']],
 profile:['Hồ sơ năng lực',['view','create','edit','delete','export']],
 production:['Lệnh sản xuất',['view','issue','edit','confirm','qc','complete','export']],
 personnel:['Hồ sơ nhân sự',['view','create','edit','review','activate','export']],
 chat:['Chat nội bộ',['view','send']]
};
const catalogs={catalogMaterials:'Vật tư và khổ mua',catalogTechnicalOperations:'Công đoạn kỹ thuật',catalogOperations:'Đơn giá công đoạn',catalogLogistics:'Vận chuyển và lắp đặt',catalogRules:'Quy ước và công thức',catalogLibrary:'Thư viện mẫu'};
const governance={accounts:['Tài khoản',['view','create','edit','delete','activate','assign']],roles:['Bộ quyền',['view','create','edit','delete']],organization:['Cơ cấu và bố trí nhân sự',['view','edit']],formulaLocks:['Khóa / mở công thức và hệ số',['view','edit']],audit:['Nhật ký và rà soát quyền',['view','export']],backup:['Sao lưu toàn bộ dữ liệu',['view','export']]};
const schema={...modules,...governance,...Object.fromEntries(Object.entries(catalogs).map(([k,v])=>[k,[v,['view','create','edit','delete']]]))};
function parse(value){if(value==null)return null;if(typeof value==='string')value=JSON.parse(value);if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Ma trận thao tác không hợp lệ');const out={};for(const [key,list]of Object.entries(value)){if(!Object.hasOwn(schema,key)||!Array.isArray(list)||list.some(a=>!schema[key][1].includes(a)))throw Error('Quyền thao tác không được hỗ trợ: '+key);out[key]=schema[key][1].filter(a=>list.includes(a));if(out[key].some(a=>a!=='view')&&!out[key].includes('view'))throw Error('Cần cấp quyền Xem trước: '+schema[key][0]);}return out;}
function explicit(u){return u?.action_access!=null||u?.actionAccess!=null;}
function allows(u,key,action,legacy=true){if(u?.role==='admin')return true;if(!explicit(u))return legacy;try{return !!parse(u.action_access??u.actionAccess)?.[key]?.includes(action);}catch{return false;}}
function legacy(r){
 const SA=typeof module!=='undefined'&&module.exports?require('./section-access.js'):root.TPSectionAccess,m=r.sectionModes||SA.modes({role:r.role,section_access:r.sections,can_view_costs:r.canViewCosts,technical_delegated:1}),out={chat:['view','send']};
 const view=k=>m[k]&&m[k]!=='none',edit=k=>['use','configure'].includes(m[k]),grant=(k,...actions)=>{out[k]=['view',...actions];};
 grant('quotes','export');if(['technical','estimator'].includes(r.role)&&['customer','bom','operations','materials','logistics','commercial'].some(edit))out.quotes.push('edit','confirm');if(edit('manage')&&r.canViewCosts)out.quotes.push('create','submit','assign');if(r.canApprove&&r.canViewCosts)out.quotes.push('approve');if(r.canReopen)out.quotes.push('reopen');
 if(view('customer'))grant('customers','export',...(edit('customer')?['create','edit','import']:[]));
 for(const k of Object.keys(catalogs))if(view(k))grant(k,...(m[k]==='configure'?['create','edit','delete']:[]));
 if(['sales','estimator','approver'].includes(r.role)&&view('commercial')&&view('customer')){grant('contracts','export',...(edit('commercial')&&r.role!=='approver'?['create','edit']:[]));grant('profile','export');grant('payments');if(r.canViewCosts)grant('costs');grant('orders','export',...(edit('commercial')&&r.role!=='approver'?['edit','confirm']:[]));if(r.role==='sales'&&edit('commercial'))out.orders.push('create');}
 if(['technical','estimator','approver'].includes(r.role))grant('production','export',...(r.role==='estimator'&&edit('manage')?['issue','edit','qc','complete']:r.role==='technical'&&edit('operations')?['edit','confirm','qc','complete']:[]));
 if(r.role==='admin')for(const [k,v]of Object.entries(schema))out[k]=[...v[1]];return out;
}
function combine(roles){if(!roles.some(explicit))return null;const result={};for(const r of roles){const rights=explicit(r)?parse(r.actionAccess??r.action_access):legacy(r);for(const [key,list]of Object.entries(rights))result[key]=schema[key][1].filter(a=>list.includes(a)||(result[key]||[]).includes(a));}return result;}
const api={labels,modules,catalogs,governance,schema,parse,explicit,allows,combine,legacy};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TPActionAccess=api;
})(typeof globalThis!=='undefined'?globalThis:this);
