'use strict';
function crmFieldInput(f,c,settings){
 const v=TPCustomerFields.value(c,f.key)??'',required=settings.required?'required':'',label=f.label+(settings.required?' *':'');
 if(f.key==='ownerId')return crmCareOwnerField(c);
 const choices={status:TPCrm.STATUS,type:TPCrm.TYPES,rating:TPCrm.RATINGS};
 if(choices[f.key])return select(label,f.key,Object.entries(choices[f.key]),v||({status:'active',type:'unknown',rating:'unrated'})[f.key],required);
 if(f.type==='yesno')return select(label,f.key,[['','Chưa khai'],['yes','Có'],['no','Không']],v,required);
 if(f.type==='textarea')return `<label class="field"><span>${esc(label)}</span><textarea name="${esc(f.key)}" rows="3" maxlength="${f.key==='notes'?10000:f.key==='address'?500:2000}" ${required}>${esc(v)}</textarea></label>`;
 const list=f.suggestions?`list="crm-suggestions-${f.key}"`:'';
 return field(label,f.key,v,f.type,`${required} ${f.type==='email'?'multiple':''} maxlength="${f.key.startsWith('account.')||f.key==='ratingReason'?2000:200}" ${f.type==='number'?'min="0" step="'+(f.key==='account.paymentDays'?'1':'any')+'"':''} ${list}`)+(f.suggestions?`<datalist id="crm-suggestions-${f.key}">${f.suggestions.map(v=>`<option value="${esc(v)}"></option>`).join('')}</datalist>`:'');
}
function crmConfiguredForm(c){
 const settings=TPCustomerFields.settings(Crm.policy.fields),groups=new Map();
 for(const f of TPCustomerFields.FIELDS){if(!settings[f.key].visible&&!(f.key==='ratingReason'&&['vip','risk'].includes(c.rating)))continue;const group=['status','type','notes'].includes(f.key)?'Quản lý chăm sóc':f.group;if(!groups.has(group))groups.set(group,[]);groups.get(group).push(f);}
 return '<p>Trường có dấu * là bắt buộc theo cấu hình của quản trị.</p>'+[...groups].map(([name,fields])=>`<details class="crm-field-group" ${['Thông tin chung','Quản lý chăm sóc'].includes(name)||fields.some(f=>settings[f.key].required)?'open':''}><summary><strong>${esc(name)}</strong> · ${fields.length} thông tin</summary><div class="form-grid" style="margin-top:12px">${fields.map(f=>crmFieldInput(f,c,settings[f.key])).join('')}</div></details>`).join('')+(c.id?'<p>Đổi nhân viên chăm sóc tại Hồ sơ → Điều chuyển để lưu lý do và lịch sử.</p>':'');
}
async function crmEditConfiguredCustomer(id='',choose=false){
 if(!inCanEditCustomers())throw Error('Không có quyền sửa danh bạ');if(choose)inWritable();
 if(inRemoteCustomers())await crmLoad();
 const c=inCustomers().find(x=>x.id===id)||(choose?{name:db.quote.customer}:{});
 teamDialog(c.id?'Thông tin khách hàng':'Thêm khách hàng',crmConfiguredForm(c),choose?'Lưu và chọn':'Lưu khách hàng',async form=>{
  const raw=TPCustomerFields.formValue(c,form);if(!c.id&&!raw.ownerId)raw.ownerId=Team.user?.id||'';
  const value=TPIntake.customer(raw);TPCustomerFields.validate(value,Crm.policy.fields);
  if(inRemoteCustomers()){
   if(!inCanEditCustomers())throw Error('Không có quyền sửa danh bạ');
   const saved=await teamApi('intake/customers','POST',{customer:value,expectedVersion:c.version||0});Intake.customers=Intake.customers.filter(x=>x.id!==value.id).concat(saved);
  }else mutation(()=>{db.customers=(db.customers||[]).filter(x=>x.id!==value.id).concat(TPCrm.saveProfile(c.id?c:null,value,{name:'Local'}));},{preserveQuote:true});
  if(choose){inWritable();mutation(()=>{if(db.quote.customerInfo?.id!==value.id)delete db.quote.opportunityId;db.quote.customerInfo=TPIntake.customerSnapshot(value);db.quote.customer=value.name;});}
  closeDialog();render();if(Crm.selected===value.id)await crmOpen(value.id);
 });
 $('#dialog').classList.add('wide-dialog');
 $('#dialog [name=rating]')?.addEventListener('change',e=>{
  if(!['vip','risk'].includes(e.target.value)||$('#dialog [name=ratingReason]'))return;
  e.target.closest('.field').insertAdjacentHTML('afterend',field('Căn cứ đánh giá *','ratingReason',c.ratingReason||'','text','required'));
 });
}
async function crmFieldsSettings(){
 if(!crmAdmin())throw Error('Chỉ quản trị được cài đặt thông tin khách hàng');if(inRemoteCustomers())await crmLoad();
 const policy=Crm.policy,settings=TPCustomerFields.settings(policy.fields);
 teamDialog('Cài đặt thông tin khách hàng',`<p>Chọn thông tin nhân viên cần khai khi thêm hoặc sửa khách. Bắt buộc nhập thì phải hiển thị. Ẩn trường giữ nguyên dữ liệu đã lưu.</p><p>Các trường dựa trên Account_Template.xlsx và thông tin chăm sóc hiện có. Tên khách hàng luôn bắt buộc; các yêu cầu khác do anh cấu hình. Hồ sơ cũ thiếu thông tin bắt buộc sẽ cần bổ sung khi lưu sửa.</p><div class="table-scroll"><table><thead><tr><th>Nhóm / Thông tin</th><th>Hiển thị</th><th>Bắt buộc</th></tr></thead><tbody>${TPCustomerFields.FIELDS.map(f=>`<tr><td><small class="subtext">${esc(f.group)}</small>${esc(f.label)}</td><td><input type="checkbox" name="visible:${f.key}" data-cf-visible="${f.key}" aria-label="Hiển thị ${esc(f.label)}" ${settings[f.key].visible?'checked':''} ${f.key==='name'?'disabled':''}></td><td><input type="checkbox" name="required:${f.key}" data-cf-required="${f.key}" aria-label="Bắt buộc ${esc(f.label)}" ${settings[f.key].required?'checked':''} ${f.key==='name'?'disabled':''}></td></tr>`).join('')}</tbody></table></div>`,'Lưu cài đặt',async form=>{
  const fields=Object.fromEntries(TPCustomerFields.FIELDS.map(f=>[f.key,{visible:f.key==='name'||form.has('visible:'+f.key),required:f.key==='name'||form.has('required:'+f.key)}]));
  const next=TPCrm.policy({...policy,fields});
  if(inRemoteCustomers())Crm.policy=await teamApi('intake/policy','POST',{policy:next,expectedVersion:policy.version||0});
  else mutation(()=>{db.customerPolicy=next;Crm.policy=next;},{preserveQuote:true});
  closeDialog();render();
 });
 $('#dialog').classList.add('wide-dialog');
 $('#dialog-form').addEventListener('change',e=>{const row=e.target.closest('tr');if(!row)return;if(e.target.matches('[data-cf-required]')&&e.target.checked)row.querySelector('[data-cf-visible]').checked=true;if(e.target.matches('[data-cf-visible]')&&!e.target.checked)row.querySelector('[data-cf-required]').checked=false;});
}
function crmExtendedProfile(c){const settings=TPCustomerFields.settings(Crm.policy.fields),fields=TPCustomerFields.FIELDS.filter(f=>f.key.startsWith('account.')&&settings[f.key].visible&&TPCustomerFields.value(c,f.key)!==undefined&&TPCustomerFields.value(c,f.key)!=='');return fields.length?`<details class="crm-field-group"><summary><strong>Thông tin khách hàng bổ sung</strong></summary><dl class="b1-record">${fields.map(f=>`<dt>${esc(f.label)}</dt><dd class="crm-text">${esc(f.type==='yesno'?(TPCustomerFields.value(c,f.key)==='yes'?'Có':'Không'):TPCustomerFields.value(c,f.key))}</dd>`).join('')}</dl></details>`:'';}
