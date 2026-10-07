/* AQSA7 UI preference store — localStorage is used only for non-domain preferences. */
const PREFERENCES_STORAGE_KEY='alssaedy_preferences_v1';
const PREFERENCE_LEGACY_KEYS={
  currency:'alssaedy_currency',
  receipt_size:'alssaedy_receipt_size',
  logo_scale:'alssaedy_logo_scale',
  font_family:'alssaedy_font_family',
  font_scale:'alssaedy_font_scale',
  receipt_color:'alssaedy_receipt_color',
  receipt_weight:'alssaedy_receipt_weight',
  theme:'alssaedy_theme',
  watermark:'alssaedy_watermark',
  texts:'alssaedy_texts',
  body_scale:'alssaedy_body_scale',
  heading_scale:'alssaedy_heading_scale',
  title_scale:'alssaedy_title_scale',
  night:'alssaedy_night'
};
let __preferencesCache=null;
function readPreferences(){
  if(__preferencesCache)return __preferencesCache;
  try{
    const raw=JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)||'{}');
    __preferencesCache=raw&&typeof raw==='object'?raw:{};
  }catch(_){__preferencesCache={};}
  return __preferencesCache;
}
function getPreference(name,fallback=''){
  const value=readPreferences()[name];
  return value===undefined||value===null||value===''?fallback:value;
}
function setPreference(name,value){
  const prefs=readPreferences();
  prefs[name]=value;
  __preferencesCache=prefs;
  localStorage.setItem(PREFERENCES_STORAGE_KEY,JSON.stringify(prefs));
  return value;
}
function removePreference(name){
  const prefs=readPreferences();
  delete prefs[name];
  __preferencesCache=prefs;
  localStorage.setItem(PREFERENCES_STORAGE_KEY,JSON.stringify(prefs));
}
function migrateLegacyPreferences(){
  const prefs=readPreferences();
  let changed=false;
  Object.entries(PREFERENCE_LEGACY_KEYS).forEach(([name,key])=>{
    if(prefs[name]!==undefined)return;
    const value=localStorage.getItem(key);
    if(value!==null){prefs[name]=value;changed=true;}
  });
  __preferencesCache=prefs;
  if(changed)localStorage.setItem(PREFERENCES_STORAGE_KEY,JSON.stringify(prefs));
  Object.values(PREFERENCE_LEGACY_KEYS).forEach(key=>localStorage.removeItem(key));
  return prefs;
}
migrateLegacyPreferences();
