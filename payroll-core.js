(function(root){'use strict';
const buckets=['regular','onsite','overtime','rest','holiday','paidLeave','absence'];
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
function calculate(profile,rule,attendance,commission=0){
 const hours=Object.fromEntries(buckets.map(k=>[k,round(attendance.reduce((s,r)=>s+(r[k]||0),0))]));
 const hourly=profile.monthly/(rule.standardDays*rule.hoursPerDay);
 const regular=round(hourly*(hours.regular+hours.onsite+hours.paidLeave)),extra=round(hourly*(hours.overtime*rule.overtime+hours.rest*rule.rest+hours.holiday*rule.holiday)),onsite=round(hours.onsite/rule.hoursPerDay*rule.onsiteAllowance+hourly*hours.onsite*((rule.onsiteFactor??1)-1)),other=round((regular+extra+onsite)*((rule.otherFactor??1)-1));
 const allowance=round(profile.allowance),gross=round(regular+extra+onsite+other+allowance+commission),insurance=round(profile.insuranceBase*rule.employeeInsurance/100),employerInsurance=round(profile.insuranceBase*rule.employerInsurance/100),deductions=round(profile.deduction+profile.tax+insurance),net=round(gross-deductions);
 return {hours,days:Object.fromEntries(buckets.map(k=>[k,round(hours[k]/rule.hoursPerDay)])),hourly:round(hourly),regular,extra,onsite,other,allowance,commission:round(commission),gross,insurance,employerInsurance,tax:profile.tax,deduction:profile.deduction,net,employerCost:round(gross+employerInsurance)};
}
const api={buckets,round,calculate};if(typeof module!=='undefined')module.exports=api;else root.TPPayroll=api;
})(typeof window!=='undefined'?window:globalThis);
