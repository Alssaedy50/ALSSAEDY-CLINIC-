/* AQSA7 Local Backup / Recovery UX — presentation/state only; no persistence authority. */
(function(){
  'use strict';
  const KEY='aqsa7_local_backup_ux_v1';

  function readState(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(_){return {};}
  }
  function writeState(patch){
    const next={...readState(),...patch};
    localStorage.setItem(KEY,JSON.stringify(next));
    return next;
  }
  function formatDate(value){
    if(!value) return 'لم يتم إنشاء نسخة محلية بعد';
    try{return new Intl.DateTimeFormat('ar-YE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}
    catch(_){return String(value);}
  }
  function render(){
    const state=readState();
    const el=document.getElementById('backupLocalStatus');
    if(!el) return;
    const last=document.getElementById('backupLastLocal');
    if(last) last.textContent=formatDate(state.lastBackupAt);
    const hint=document.getElementById('backupRecoveryHint');
    if(hint) hint.textContent=state.lastBackupAt
      ? 'آخر نسخة محلية مشفرة: '+formatDate(state.lastBackupAt)+'. احتفظ بالملف وكلمة المرور خارج الجهاز.'
      : 'أنشئ Backup كاملًا مشفرًا ثم احتفظ بالملف وكلمة المرور في مكان آمن.';
    el.dataset.state=state.lastBackupAt?'ready':'empty';
  }
  function markBackupCreated(){
    writeState({lastBackupAt:new Date().toISOString()});
    render();
  }
  function clearFileInput(){
    const input=document.getElementById('backupImporter');
    if(input) input.value='';
  }
  function openRestorePicker(){
    const input=document.getElementById('backupImporter');
    if(input) input.click();
  }
  window.aqsa7LocalBackupUX=Object.freeze({
    render,markBackupCreated,openRestorePicker,clearFileInput,
    getState:readState
  });
  document.addEventListener('DOMContentLoaded',render);
})();
