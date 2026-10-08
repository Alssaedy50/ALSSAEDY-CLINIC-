/* AQSA7 Google Drive Auth Boundary.
 * Stores no access token, refresh token, client secret or OAuth credential.
 * A platform-secure OAuth resolver supplies short-lived access tokens on demand.
 */
(function(){
  'use strict';
  const CONTRACT=Object.freeze({
    contractId:'aqsa7-google-drive-auth-boundary',
    schemaVersion:1,
    mode:'secure-external-token-resolver',
    tokenPersistence:'none',
    secretStorage:false,
    providerIndependent:false
  });
  let resolver=null;
  function configure(next){
    if(!next || typeof next.getAccessToken!=='function') throw new Error('AQSA7_GOOGLE_AUTH_RESOLVER_INVALID');
    resolver=next;
    return getStatus();
  }
  async function getAccessToken(){
    if(!resolver) { const e=new Error('AQSA7_GOOGLE_DRIVE_AUTH_REQUIRED'); e.code='AUTH_REQUIRED'; throw e; }
    const token=await resolver.getAccessToken();
    if(typeof token!=='string' || !token.trim()) { const e=new Error('AQSA7_GOOGLE_DRIVE_ACCESS_TOKEN_UNAVAILABLE'); e.code='AUTH_REQUIRED'; throw e; }
    return token.trim();
  }
  function clear(){ resolver=null; }
  function getStatus(){ return Object.freeze({configured:Boolean(resolver),tokenStored:false}); }
  window.AQSA7_GOOGLE_DRIVE_AUTH_CONTRACT=CONTRACT;
  window.aqsa7GoogleDriveAuth=Object.freeze({configure,getAccessToken,clear,getStatus});
})();
