/* AQSA7 Google Drive Backup Provider — encrypted artifact transport only.
 * OAuth/token acquisition is deliberately supplied by a secure auth boundary.
 * No token, refresh token, client secret or credential is persisted here.
 */
(function(){
  'use strict';

  const CONTRACT = Object.freeze({
    id:'google-drive',
    name:'Google Drive',
    kind:'remote-backup-provider',
    version:'1',
    operations:Object.freeze(['health','list','put','get','delete']),
    platforms:Object.freeze(['web','pwa','desktop','android']),
    apiVersion:'v3',
    storageSpace:'appDataFolder',
    oauthScope:'https://www.googleapis.com/auth/drive.appdata',
    artifactType:'AQSA7_BACKUP_ARTIFACT',
    artifactVersion:1,
    schemaVersion:5
  });

  const BASE='https://www.googleapis.com/drive/v3';
  const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';

  function authProvider(options){
    const provider=options && options.auth;
    if(!provider || typeof provider.getAccessToken!=='function'){
      const e=new Error('AQSA7_GOOGLE_DRIVE_AUTH_REQUIRED'); e.code='AUTH_REQUIRED'; throw e;
    }
    return provider;
  }

  async function token(options){
    const accessToken=await authProvider(options).getAccessToken();
    if(typeof accessToken!=='string' || !accessToken.trim()){
      const e=new Error('AQSA7_GOOGLE_DRIVE_ACCESS_TOKEN_UNAVAILABLE'); e.code='AUTH_REQUIRED'; throw e;
    }
    return accessToken.trim();
  }

  function esc(value){
    return String(value).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  }

  function mapStatus(status){
    if(status===401) return 'AUTH_REQUIRED';
    if(status===403) return 'FORBIDDEN';
    if(status===404) return 'NOT_FOUND';
    if(status===409 || status===412) return 'CONFLICT';
    if(status===429) return 'RATE_LIMITED';
    if(status===507) return 'QUOTA_EXCEEDED';
    if(status>=500) return 'NETWORK_ERROR';
    return 'PROVIDER_ERROR';
  }

  async function readError(response){
    let detail='';
    try { const body=await response.json(); detail=body?.error?.message || body?.error_description || ''; } catch(_){}
    const e=new Error(detail || ('Google Drive HTTP '+response.status));
    e.code=mapStatus(response.status);
    e.providerCode=String(response.status);
    e.retryable=response.status===429 || response.status>=500;
    return e;
  }

  async function driveRequest(path, init, accessToken){
    const response=await fetch(BASE+path,{
      ...init,
      headers:{Accept:'application/json',Authorization:'Bearer '+accessToken,...(init?.headers||{})}
    });
    if(!response.ok) throw await readError(response);
    return response;
  }

  function appProperties(identity, backupId){
    return {
      aqsa7ProductId:String(identity.productId),
      aqsa7TenantId:String(identity.tenantId),
      aqsa7InstanceId:String(identity.instanceId),
      aqsa7BackupId:String(backupId)
    };
  }

  function queryFor(identity){
    return [
      "'appDataFolder' in parents",
      "trashed = false",
      "appProperties has { key='aqsa7ProductId' and value='"+esc(identity.productId)+"' }",
      "appProperties has { key='aqsa7TenantId' and value='"+esc(identity.tenantId)+"' }",
      "appProperties has { key='aqsa7InstanceId' and value='"+esc(identity.instanceId)+"' }"
    ].join(' and ');
  }

  async function health(request, options){
    const accessToken=await token(options);
    const response=await requestPath('/about?fields=user,storageQuota',{},accessToken);
    const body=await response.json();
    return {status:'success',user:body.user||null,storageQuota:body.storageQuota||null};
  }

  async function requestPath(path,init,accessToken){ return driveRequest(path,init,accessToken); }

  async function list(request, options){
    const accessToken=await token(options);
    const params=new URLSearchParams({
      q:queryFor(request.ownership),
      spaces:'appDataFolder',
      pageSize:'100',
      fields:'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,appProperties,md5Checksum)'
    });
    if(request.cursor) params.set('pageToken',request.cursor);
    const response=await driveRequest('/files?'+params.toString(),{},accessToken);
    const body=await response.json();
    return {status:'success',items:(body.files||[]).map(file=>({
      backupId:file.id,
      providerId:file.id,
      name:file.name,
      createdTime:file.createdTime,
      modifiedTime:file.modifiedTime,
      size:file.size ? Number(file.size) : null,
      checksum:file.md5Checksum || null
    })),nextCursor:body.nextPageToken||null};
  }

  async function put(request, options){
    const accessToken=await token(options);
    const backupId=request.backupId || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    const payload=JSON.stringify(request.artifact);
    const metadata={
      name:'AQSA7-backup-'+backupId+'.aqsa7.json',
      mimeType:'application/json',
      parents:['appDataFolder'],
      appProperties:appProperties(request.ownership,backupId)
    };
    const boundary='aqsa7_'+(crypto.randomUUID ? crypto.randomUUID().replace(/-/g,'') : Math.random().toString(36).slice(2));
    const body=new Blob([
      '--'+boundary+'\\r\\n',
      'Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n',
      JSON.stringify(metadata),'\\r\\n',
      '--'+boundary+'\\r\\n',
      'Content-Type: application/json\\r\\n\\r\\n',
      payload,'\\r\\n',
      '--'+boundary+'--'
    ]);
    const response=await fetch(UPLOAD+'?uploadType=multipart&fields=id,name,createdTime,modifiedTime,appProperties',{
      method:'POST',
      headers:{Authorization:'Bearer '+accessToken,'Content-Type':'multipart/related; boundary='+boundary},
      body
    });
    if(!response.ok) throw await readError(response);
    const file=await response.json();
    return {status:'success',backupId:file.id,providerId:file.id,logicalBackupId:backupId,metadata:file};
  }

  async function get(request, options){
    const accessToken=await token(options);
    const response=await driveRequest('/files/'+encodeURIComponent(request.backupId)+'?alt=media',{},accessToken);
    const artifact=await response.json();
    return {status:'success',backupId:request.backupId,artifact};
  }

  async function remove(request, options){
    const accessToken=await token(options);
    await driveRequest('/files/'+encodeURIComponent(request.backupId),{method:'DELETE'},accessToken);
    return {status:'success',backupId:request.backupId};
  }

  function create(options={}){
    const auth=options.auth || window.aqsa7GoogleDriveAuth;
    return Object.freeze({
      getDescriptor:()=>CONTRACT,
      health:request=>health(request,{auth}),
      list:request=>list(request,{auth}),
      put:request=>put(request,{auth}),
      get:request=>get(request,{auth}),
      delete:request=>remove(request,{auth})
    });
  }

  window.AQSA7_GOOGLE_DRIVE_PROVIDER_CONTRACT=CONTRACT;
  window.aqsa7CreateGoogleDriveBackupProvider=create;
})();
