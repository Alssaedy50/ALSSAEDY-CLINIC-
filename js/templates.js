let selectedTemplateSize='a5';
function openTemplateModal(){selectTemplateSize(getSelectedSize());document.getElementById('templateModal')?.classList.add('open');}
function closeTemplateModal(){document.getElementById('templateModal')?.classList.remove('open');}
function selectTemplateSize(size){
  if(!SIZE_PROFILES[size])return;
  selectedTemplateSize=size;
  ['a5','a4','thermal'].forEach(s=>{
    const id='templateSize'+s.charAt(0).toUpperCase()+s.slice(1);
    document.getElementById(id)?.classList.toggle('active',s===size);
  });
  setSize(size);
}