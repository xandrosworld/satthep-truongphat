'use strict';
// Only the authorized quote summary endpoint supplies this screen.
const WorkspaceHome={session:null,rows:null,pending:null,error:'',query:'',status:'all',stage:'all',work:'all',page:0,at:0};
function workspaceHomeSession(){return String(Team.user?.id)+':'+(Team.sessionGeneration||0);}
function workspaceHomeReset(){if(WorkspaceHome.session===workspaceHomeSession())return;Object.assign(WorkspaceHome,{session:workspaceHomeSession(),rows:null,pending:null,error:'',query:'',status:'all',stage:'all',work:'all',page:0,at:0});}
function workspaceHome(){
 workspaceHomeReset();const p=Team.permissions;
 return `<div class="workspace-home">${heading('Báo giá dùng chung','Theo dõi tiến độ và mở báo giá để tiếp tục công việc.',p.manage?accessButton('+ Báo giá mới','new-document','','primary'):'')}
 <div class="home-toolbar"><span>Xin chào, <strong>${esc(Team.user.name)}</strong></span><div class="actions">${p.catalog?teamButton('Danh mục dùng chung','catalog-workspace'):''}<details class="home-account"><summary>Tài khoản & tiện ích</summary><div>${p.manage?teamButton('Nhập báo giá từ bản sao lưu','import-document'):''}${p.users?teamButton('Tài khoản và phân quyền','users')+teamButton('Sao lưu máy chủ','backup'):''}${teamButton('Đổi mật khẩu','own-password')}${teamButton('Đăng xuất','logout')}</div></details></div></div>
 <section class="panel home-quotes" aria-label="Danh sách báo giá"><div class="home-filters"><label>Tìm báo giá<input type="search" data-home-search placeholder="Mã báo giá, khách hàng, công trình…" value="${esc(WorkspaceHome.query)}"></label><label>Tiến độ<select data-home-stage><option value="all">Tất cả tiến độ</option><option value="technical">Chờ xác nhận kỹ thuật</option><option value="materials">Chờ xác nhận nhập giá</option><option value="sent">Đã gửi khách</option></select></label><label>Tiến độ lập báo giá<select data-home-work><option value="all">Tất cả tình trạng</option>${Object.entries(noticeWorkLabels).map(([k,v])=>`<option value="${k}" ${WorkspaceHome.work===k?'selected':''}>${v}</option>`).join('')}</select></label><button type="button" class="button" data-home-refresh>Làm mới</button></div><div data-home-results aria-live="polite"><p class="home-empty">Đang tải danh sách báo giá…</p></div></section></div>`;
}
function workspaceHomeMount(){const input=$('[data-home-stage]');if(input)input.value=WorkspaceHome.stage;$('.demo-status').textContent='Dữ liệu máy chủ';$('.side-bottom > p').textContent='Làm việc trên bản lưu dùng chung. Bản đã duyệt được giữ theo phiên bản.';$('.account strong').textContent=Team.user.name;workspaceHomeDraw();workspaceHomeFetch();}
async function workspaceHomeFetch(force=false){
 workspaceHomeReset();const state=WorkspaceHome,session=state.session;if(state.pending||(!force&&state.rows&&Date.now()-state.at<30000))return;
 const request={};state.pending=request;state.error='';workspaceHomeDraw();
 try{const rows=await teamApi('quotes');if(session!==workspaceHomeSession()||state.pending!==request)return;state.rows=rows;state.at=Date.now();}
 catch(error){if(session!==workspaceHomeSession()||state.pending!==request)return;state.rows=null;state.error=error.message;}
 finally{if(session===workspaceHomeSession()&&state.pending===request){state.pending=null;workspaceHomeDraw();}}
}
function workspaceHomeStage(s){return !s?'Chưa xác nhận':s.current?'Đã xác nhận':'Cần xác nhận lại';}
function workspaceHomeProgress(q){
 return '<div class="home-progress">'+[['intake','Đầu vào'],['technical','Kỹ thuật'],['materials','Nhập giá']].map(([key,label])=>{
  const value=q.progress?.[key],person=q.progress?.work?.[key]?.name||value?.actor||'Chưa phân công',state=value?.current?'done':value?'changed':'pending',symbol=value?.current?'✓':value?'↻':'○',status=workspaceHomeStage(value);
  return `<div class="home-stage ${state}"><b>${label}</b><span class="home-stage-person" title="${esc(person)}">${esc(person)}</span><span class="home-stage-status" title="${esc(status)}" aria-label="${esc(label+': '+status)}"><span aria-hidden="true">${symbol}</span> ${value?.current?'Đã xác nhận':value?'Xác nhận lại':'Chưa xác nhận'}</span></div>`;
 }).join('')+'</div>';
}
function workspaceHomeOverview(rows,label,showPrice){
 const totals=rows.filter(q=>typeof q.total==='number'&&Number.isFinite(q.total)),missing=rows.length-totals.length;
 const sent=rows.filter(q=>q.progress?.sentCount>0).length;
 const accepted=rows.filter(q=>quoteTrackingValue(q)==='accepted').length;
 const technical=rows.filter(q=>!q.progress?.technical?.current).length,materials=rows.filter(q=>!q.progress?.materials?.current).length;
 const card=(key,title,value,note)=>`<div class="home-summary-card" data-home-metric="${key}"><span>${title}</span><strong>${value}</strong><small>${note}</small></div>`;
 return `<section class="home-summary" aria-label="Tổng quan báo giá"><h2>Tổng quan · ${esc(label)}</h2><p>Theo bộ lọc hiện tại, gồm tất cả các trang trong phạm vi tài khoản.</p><div class="home-summary-grid">${card('count','Số báo giá',rows.length,'Báo giá trong nhóm đang xem')}${showPrice?card('total','Tổng giá trị sau thuế',totals.length?money(totals.reduce((sum,q)=>sum+q.total,0))+' ₫':rows.length?'Chưa có dữ liệu':'0 ₫',missing?`${missing} báo giá chưa có giá trị; chưa cộng vào tổng`:'Giá trị báo giá, không phải doanh thu đã thu'):''}${card('sent','Đã gửi khách',sent,`${rows.length-sent} báo giá chưa ghi nhận gửi khách`)}${card('accepted','Đã chốt với khách',accepted,'Theo tình trạng chào giá')}${card('technical','Chờ xác nhận kỹ thuật',technical,'Gồm chưa xác nhận và cần xác nhận lại')}${card('materials','Chờ xác nhận nhập giá',materials,'Gồm chưa xác nhận và cần xác nhận lại')}</div></section>`;
}
function workspaceHomeDraw(){
 const host=$('[data-home-results]'),s=WorkspaceHome;if(!host||s.session!==workspaceHomeSession())return;
 const refresh=$('[data-home-refresh]');if(refresh){refresh.disabled=!!s.pending;refresh.textContent=s.pending?'Đang tải…':'Làm mới';}
 if(s.error){host.innerHTML=`<div class="notice warning" role="alert">Không tải được danh sách. ${esc(s.error)} Bấm Làm mới để thử lại.</div>`;return;}
 if(!s.rows)return;
 const labels={all:'Tất cả',draft:'Bản nháp',submitted:'Chờ duyệt',approved:'Đã duyệt'},fold=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
 const query=fold(s.query.trim()),filtered=s.rows.filter(q=>(s.work==='all'||(q.progress?.work?.status||'not-started')===s.work)&&(!query||fold([q.code,q.customer,q.project].join(' ')).includes(query))&&(s.stage==='all'||s.stage==='sent'&&q.progress?.sentCount>0||['technical','materials'].includes(s.stage)&&!q.progress?.[s.stage]?.current));
 const rows=filtered.filter(q=>s.status==='all'||q.status===s.status);
 const pages=Math.max(1,Math.ceil(rows.length/25));s.page=Math.min(s.page,pages-1);
 const showPrice=!!Team.permissions.costs;
 host.innerHTML=`<div class="home-status" aria-label="Lọc trạng thái">${Object.entries(labels).map(([key,label])=>`<button type="button" data-home-status="${key}" class="${key===s.status?'active':''}" aria-pressed="${key===s.status}">${label}<strong>${filtered.filter(q=>key==='all'||q.status===key).length}</strong></button>`).join('')}</div>
 ${workspaceHomeOverview(rows,labels[s.status]||'Tất cả',showPrice)}
 <div class="home-list-caption"><strong>${rows.length} báo giá · Ngày tạo mới → cũ${query||s.stage!=='all'||s.status!=='all'?' phù hợp':''}</strong><span>Cập nhật ${esc(new Date(s.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}))} · Trong phạm vi tài khoản của bạn</span></div>
 ${rows.length?`<div class="table-scroll"><table class="home-table"><thead><tr><th>STT</th><th>Báo giá / khách hàng</th><th>Ngày tạo</th><th>Trạng thái</th><th>Tiến độ xử lý</th>${showPrice?'<th class="right">Tổng sau thuế</th>':''}<th>Tình trạng chào giá</th><th>Cập nhật</th><th><span class="sr-only">Thao tác</span></th></tr></thead><tbody>${rows.slice(s.page*25,s.page*25+25).map((q,i)=>`<tr><td class="home-sequence"><span class="home-mobile-label">STT</span>${s.page*25+i+1}</td><td class="home-identity"><strong>${esc(q.code)}</strong><span class="subtext">${esc(q.customer||'Chưa khai khách hàng')}</span>${q.project?`<span class="subtext">${esc(q.project)}</span>`:''}</td><td class="home-created"><span class="home-mobile-label">Ngày tạo</span>${q.created?esc(TPDisplay.date(q.created,true)):'Chưa có dữ liệu'}</td><td class="home-status-cell"><span class="home-badge ${['draft','submitted','approved'].includes(q.status)?q.status:''}">${esc(labels[q.status]||q.status)}</span><small class="subtext">V${esc(q.version)}</small><div data-quote-presence="${esc(q.id)}"></div>${q.progress?.work&&q.status==='draft'?`<span class="order-state order-${esc(q.progress.work.status)}">${esc(noticeWorkLabels[q.progress.work.status])}</span>`:''}</td><td class="home-progress-cell">${workspaceHomeProgress(q)}</td>${showPrice?`<td class="right mono home-total"><span class="home-mobile-label">Tổng sau thuế</span>${q.total==null?'—':money(q.total)}</td>`:''}<td>${quoteTrackingCell(q)}</td><td>${q.updated?esc(new Date(q.updated).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})):'—'}<small class="subtext">${esc(q.actor||'')}</small>${q.updateSummary?`<span class="home-update-note">${esc(q.updateSummary)}</span>`:''}</td><td>${teamButton('Mở báo giá','open',`data-id="${esc(q.id)}"`,'small')}</td></tr>`).join('')}</tbody></table></div>`:`<div class="home-empty"><h3>${s.rows.length?'Không có báo giá phù hợp':'Chưa có báo giá trong danh sách'}</h3><p>${s.rows.length?'Thử đổi từ khóa hoặc bộ lọc.':Team.permissions.manage?'Bấm “+ Báo giá mới” để bắt đầu lập báo giá.':'Báo giá được phép truy cập sẽ hiển thị tại đây.'}</p></div>`}
 ${pages>1?`<div class="home-pagination"><button type="button" class="button" data-home-page="-1" ${!s.page?'disabled':''}>Trước</button><span>Trang ${s.page+1} / ${pages}</span><button type="button" class="button" data-home-page="1" ${s.page===pages-1?'disabled':''}>Sau</button></div>`:''}`;
}
document.addEventListener('input',e=>{if(e.target.matches('[data-home-search]')){WorkspaceHome.query=e.target.value;WorkspaceHome.page=0;workspaceHomeDraw();}});
document.addEventListener('change',e=>{if(e.target.matches('[data-home-work]')){WorkspaceHome.work=e.target.value;WorkspaceHome.page=0;workspaceHomeDraw();}if(e.target.matches('[data-home-stage]')){WorkspaceHome.stage=e.target.value;WorkspaceHome.page=0;workspaceHomeDraw();}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-home-refresh],[data-home-status],[data-home-page]');if(!b)return;if(b.hasAttribute('data-home-refresh'))workspaceHomeFetch(true);else{if(b.hasAttribute('data-home-status')){WorkspaceHome.status=b.dataset.homeStatus;WorkspaceHome.page=0;}else WorkspaceHome.page+=Number(b.dataset.homePage);workspaceHomeDraw();}});

document.addEventListener('click',e=>{if(e.target.closest('.workspace-home [data-team=open]'))WorkspaceHome.at=0;});

// Refresh server-derived progress while the list is visible, without a manual status edit.
setInterval(()=>{if(!document.hidden&&document.querySelector('[data-home-results]')&&!document.querySelector('#dialog[open]'))workspaceHomeFetch();},30000);

function installQuoteListNavigation(){
 let showHome=false;
 const list=teamList;teamList=async(...args)=>{await list(...args);const table=document.querySelector('#dialog .quotes-list');if(!table)return;const tools=document.querySelector('#dialog .actions');if(tools&&!tools.querySelector('[data-quote-home]'))tools.insertAdjacentHTML('afterbegin','<button type="button" class="button" data-quote-home>Về trang Báo giá</button>');};
 const draw=render;render=()=>{if(!showHome||page!=='quote'||!Team.user){const result=draw();if(page==='quote'&&Team.user&&Team.loaded){const banner=document.querySelector('#content .team-banner');if(banner&&!document.querySelector('#content [data-quote-home]'))banner.insertAdjacentHTML('beforebegin','<div class="quote-back-navigation"><button type="button" class="button" data-quote-home>← Danh sách báo giá</button></div>');}return result;}document.querySelector('#content').innerHTML=workspaceHome();document.querySelector('#page-label').textContent='Báo giá';document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page==='quote'));if(Team.loaded)document.querySelector('.workspace-home .page-heading')?.insertAdjacentHTML('beforeend','<button type="button" class="button" data-quote-resume>Tiếp tục báo giá đang mở'+(Team.dirty?' · Có thay đổi chưa lưu':'')+'</button>');workspaceHomeMount();actionPaint();};
 const load=teamLoad;teamLoad=async(...args)=>{const value=await load(...args);showHome=false;render();return value;};
 const session=teamSession;teamSession=value=>{if(Team.user?.id!==value?.user?.id)showHome=false;return session(value);};
 document.addEventListener('click',e=>{if(e.target.closest('[data-quote-home]')){closeDialog();showHome=true;page='quote';render();}if(e.target.closest('[data-quote-resume]')){showHome=false;page='quote';render();}},true);
}
