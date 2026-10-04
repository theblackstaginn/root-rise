const endpoint='https://pqifpislzljilqatmtly.supabase.co/functions/v1/root-rise-counsel';
const ownerKey='rr.counselOwner.v1',pendingKey='rr.counselPending.v1',cacheKey='rr.counselCache.v1';
function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function owner(create=false){
  let value=localStorage.getItem(ownerKey);
  if(value!==null&&!/^[a-f0-9]{64}$/.test(value))throw Error('The plant journal key could not be read. Restore your garden backup.');
  if(!value&&create){value=randomToken();localStorage.setItem(ownerKey,value);}
  return value;
}
async function api(data){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
    const result=await r.json();if(!r.ok)throw Error(result.error||'The plant journal could not be reached.');return result;
  }catch(e){if(e.name==='AbortError')throw Error('The journal took too long to answer. Try again; your description is still here.');throw e;}finally{clearTimeout(timer);}
}
export async function prepare(plantId,text){
  if(!navigator.onLine)throw Error('Reconnect to seal this request. Your photo and description are still here.');
  const key=owner(true);
  let pending;try{pending=JSON.parse(localStorage.getItem(pendingKey)||'null');}catch{pending=null;}
  if(!pending||pending.plantId!==plantId||pending.text!==text||Date.now()-pending.created>3600000||!pending.created||!/^[a-f0-9]{64}$/.test(pending.capability||'')){
    pending={id:crypto.randomUUID(),capability:randomToken(),plantId,text,created:Date.now()};
    localStorage.setItem(pendingKey,JSON.stringify(pending));
  }
  await api({action:'create',request_id:pending.id,owner_capability:key,return_capability:pending.capability,plant_id:plantId,request_text:text});
  return '@Root Rise\n\n'+text+'\n\nUse the Root Rise plugin to read this exact request, assess the attached plant photo, and submit your final advice back to the same request. If the photo is missing, ask Jess to attach it and leave the request awaiting advice. Do not change care records.\n\nROOT_RISE_PLANT_HANDOFF\n'+JSON.stringify({schema:'root_rise.plant_counsel.v1',request_id:pending.id,return_capability:pending.capability},null,2);
}
export function mountJournal(panel,plantId){
  const container=document.createElement('section');container.className='rr-plant-journal';container.setAttribute('aria-label','Ember’s plant journal');
  const heading=document.createElement('h4');heading.textContent='Ember’s plant journal';
  const refresh=document.createElement('button');refresh.type='button';refresh.className='rr-btn';refresh.textContent='Check for Ember’s reply';
  const status=document.createElement('p');status.setAttribute('role','status');
  const list=document.createElement('div');list.className='rr-journal-entries';
  container.append(heading,refresh,status,list);panel.appendChild(container);
  let loading=false;
  function render(rows){
    list.replaceChildren();
    if(!rows.length){const empty=document.createElement('p');empty.textContent='Your plant conversations will be remembered here.';list.appendChild(empty);return;}
    for(const row of rows){
      const entry=document.createElement('details');entry.className='rr-journal-entry';
      const summary=document.createElement('summary');summary.textContent=(row.response_text?'Ember’s advice':'Awaiting Ember')+' · '+new Date(row.created_at).toLocaleDateString();
      const question=document.createElement('p');question.className='rr-journal-question';question.textContent=row.request_text;
      const answer=document.createElement('p');answer.className='rr-journal-answer';answer.textContent=row.response_text||(Date.parse(row.expires_at)<=Date.now()?'The reply window closed. Prepare a new request if you still need help.':'Paste your request into chat with the Root Rise plugin selected, attach the photo and send it. Return here for the reply.');
      entry.append(summary,question,answer);list.appendChild(entry);
    }
  }
  function cached(){try{const data=JSON.parse(localStorage.getItem(cacheKey)||'{}');return Array.isArray(data[plantId])?data[plantId]:[];}catch{return [];}}
  render(cached());
  async function refreshJournal(){
    if(loading||!container.isConnected)return;loading=true;refresh.disabled=true;
    try{
      const key=owner();if(!key){render([]);status.textContent='Prepare your first request to open this journal.';return;}
      if(!navigator.onLine){status.textContent='Offline — showing the replies saved on this device.';return;}
      status.textContent='Listening for Ember…';const result=await api({action:'list',owner_capability:key,plant_id:plantId});
      if(!container.isConnected)return;
      render(result.requests);
      try{let cache;try{cache=JSON.parse(localStorage.getItem(cacheKey)||'{}');}catch{cache={};}cache[plantId]=result.requests;localStorage.setItem(cacheKey,JSON.stringify(cache));status.textContent='Journal up to date. Showing the latest ten conversations.';}catch{status.textContent='Replies loaded. They could not be saved for offline viewing.';}
    }catch(e){status.textContent=e.message||'Could not reach the journal. Your saved replies are still here.';}finally{loading=false;refresh.disabled=false;}
  }
  refresh.addEventListener('click',refreshJournal);
  const onReturn=()=>{if(!container.isConnected){window.removeEventListener('focus',onReturn);document.removeEventListener('visibilitychange',onReturn);document.removeEventListener('rr:garden-restored',onReturn);return;}if(!document.hidden)refreshJournal();};
  window.addEventListener('focus',onReturn);document.addEventListener('visibilitychange',onReturn);document.addEventListener('rr:garden-restored',onReturn);
  refreshJournal();
  return refreshJournal;
}
