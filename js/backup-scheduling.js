/* AQSA7 Local Backup Scheduling / Reliability — reminder orchestration only. */
(function(){
  'use strict';

  const KEY='aqsa7_backup_schedule_v1';
  const CONTRACT=Object.freeze({
    contractId:'aqsa7-backup-scheduling-reliability',
    schemaVersion:1,
    mode:'local-reminder',
    providerIndependent:true,
    automaticBackgroundExport:false,
    persistence:'local-storage-control-state'
  });
  const DEFAULTS=Object.freeze({enabled:true,intervalDays:7,lastReminderAt:null,lastCheckAt:null});

  function read(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      return {...DEFAULTS,...(raw&&typeof raw==='object'?raw:{})};
    }catch(_){return {...DEFAULTS};}
  }
  function write(patch){
    const next={...read(),...patch};
    localStorage.setItem(KEY,JSON.stringify(next));
    return next;
  }
  function intervalMs(state){return Math.max(1,Number(state.intervalDays)||7)*86400000;}
  function lastBackupAt(){
    return window.aqsa7LocalBackupUX?.getState?.().lastBackupAt||null;
  }
  function getStatus(){
    const state=read(), last=lastBackupAt();
    const due=state.enabled && (!last || Date.now()-Date.parse(last)>=intervalMs(state));
    const nextAt=last ? new Date(Date.parse(last)+intervalMs(state)).toISOString() : null;
    return {contract:CONTRACT,state,lastBackupAt:last,due,nextAt};
  }
  function formatDate(value){
    if(!value)return 'غير محدد';
    try{return new Intl.DateTimeFormat('ar-YE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
    catch(_){return String(value);}
  }
  function render(){
    const status=getStatus();
    const badge=document.getElementById('backupScheduleStatus');
    const detail=document.getElementById('backupScheduleDetail');
    const next=document.getElementById('backupScheduleNext');
    const toggle=document.getElementById('backupScheduleToggle');
    const interval=document.getElementById('backupScheduleInterval');
    if(toggle)toggle.checked=!!status.state.enabled;
    if(interval)interval.value=String(status.state.intervalDays);
    if(badge){
      badge.textContent=!status.state.enabled?'متوقف':status.due?'يحتاج Backup':'محدّث';
      badge.dataset.state=!status.state.enabled?'off':status.due?'due':'ready';
    }
    if(detail)detail.textContent=!status.state.enabled
      ? 'التذكير المحلي متوقف.'
      : status.due
        ? 'حان موعد إنشاء Backup مشفر. افتح زر إنشاء Backup لإخراج الملف وحفظه خارج الجهاز.'
        : 'آخر Backup: '+formatDate(status.lastBackupAt);
    if(next)next.textContent=status.nextAt?'موعد التذكير التالي: '+formatDate(status.nextAt):'أنشئ أول Backup لتفعيل الموعد التالي.';
  }
  function check({notify=true}={}){
    const status=getStatus();
    write({lastCheckAt:new Date().toISOString()});
    if(status.due && notify && status.state.lastReminderAt!==status.lastBackupAt){
      write({lastReminderAt:new Date().toISOString()});
      if(typeof window.toast==='function')window.toast('حان موعد إنشاء Backup مشفر.','info',5200);
    }
    render();
    return getStatus();
  }
  function setEnabled(enabled){write({enabled:!!enabled});render();return getStatus();}
  function setIntervalDays(days){
    const safe=[1,7,30].includes(Number(days))?Number(days):7;
    write({intervalDays:safe});render();return getStatus();
  }
  function markBackupCreated(){
    write({lastReminderAt:null,lastCheckAt:new Date().toISOString()});
    render();
  }
  function schedule(){
    window.clearTimeout(window.__aqsa7BackupScheduleTimer);
    check({notify:true});
    const next=getStatus();
    const delay=next.due ? 3600000 : Math.max(60000,Date.parse(next.nextAt)-Date.now());
    window.__aqsa7BackupScheduleTimer=window.setTimeout(schedule,delay);
  }

  window.AQSA7_BACKUP_SCHEDULING_CONTRACT=CONTRACT;
  window.aqsa7BackupScheduling=Object.freeze({
    contract:CONTRACT,read,getStatus,render,check,setEnabled,setIntervalDays,markBackupCreated,schedule
  });

  document.addEventListener('DOMContentLoaded',()=>{
    render();
    schedule();
    window.addEventListener('pageshow',()=>check({notify:false}));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check({notify:true});});
  });
})();