// No external dependencies. Secrets remain exclusively in the Edge runtime.
const plants = new Set(['albino-syngonium','prayer-plant','pothos','snake-plant','cactus','tiny-cactus','propagation-station','monstera']);
const tokenRE = /^[a-f0-9]{64}$/;
const uuidRE = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const cors = {'Access-Control-Allow-Origin':'https://theblackstaginn.github.io','Access-Control-Allow-Headers':'content-type,mcp-protocol-version','Access-Control-Allow-Methods':'POST,GET,OPTIONS','Cache-Control':'no-store'};
const encoder=new TextEncoder();
async function hash(text:string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function json(value:unknown,status=200) { return new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json'}}); }
class Problem extends Error { constructor(public status:number,message:string){super(message);} }
const dbURL=Deno.env.get('SUPABASE_URL')!;
const dbKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
async function db(path:string,method='GET',body?:unknown) {
  const r=await fetch(dbURL+'/rest/v1/'+path,{method,headers:{apikey:dbKey,Authorization:'Bearer '+dbKey,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await r.json();if(!r.ok){if(data.message?.includes('Daily request limit'))throw new Problem(429,'Daily request limit reached. Try again tomorrow.');if(data.message?.includes('Request conflict'))throw new Problem(409,'Request conflict.');throw new Problem(503,'Garden journal is temporarily unavailable.');}return data;
}
function validToken(value:unknown):asserts value is string { if(typeof value!=='string'||!tokenRE.test(value))throw new Problem(403,'A valid request capability is required.'); }
function validId(value:unknown):asserts value is string { if(typeof value!=='string'||!uuidRE.test(value))throw new Problem(400,'Invalid request ID.'); }
function text(value:unknown,max:number):asserts value is string { if(typeof value!=='string'||!value.trim()||value.length>max)throw new Problem(400,'Missing or oversized text.'); }
async function requestForReply(a:any) {
  validId(a.request_id);validToken(a.return_capability);
  const rows=await db('rr_counsel_requests?id=eq.'+a.request_id+'&reply_hash=eq.'+await hash(a.return_capability)+'&select=id,plant_id,request_text,response_text,created_at,expires_at,answered_at');
  if(!rows.length)throw new Problem(403,'Request capability does not match.');
  if(Date.parse(rows[0].expires_at)<=Date.now())throw new Problem(410,'The seven-day reply window has expired.');
  return rows[0];
}
async function action(name:string,a:any,req:Request) {
  if(name==='create') {
    validId(a.request_id);validToken(a.owner_capability);validToken(a.return_capability);text(a.request_text,7000);
    if(!plants.has(a.plant_id))throw new Problem(400,'Unknown plant.');
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim()||req.headers.get('cf-connecting-ip')||'unknown';
    await db('rpc/rr_create_counsel','POST',{p_id:a.request_id,p_owner:await hash(a.owner_capability),p_reply:await hash(a.return_capability),p_source:await hash(ip),p_plant:a.plant_id,p_text:a.request_text});
    return {request_id:a.request_id};
  }
  if(name==='list') {
    validToken(a.owner_capability);if(!plants.has(a.plant_id))throw new Problem(400,'Unknown plant.');
    return {requests:await db('rr_counsel_requests?owner_hash=eq.'+await hash(a.owner_capability)+'&plant_id=eq.'+a.plant_id+'&select=id,plant_id,request_text,response_text,created_at,expires_at,answered_at&order=created_at.desc&limit=10')};
  }
  if(name==='get_plant_request')return await requestForReply(a);
  if(name==='submit_plant_response') {
    text(a.response_text,12000);const row=await requestForReply(a);
    if(row.response_text){if(row.response_text===a.response_text)return {saved:true,request_id:row.id};throw new Problem(409,'This request already has a reply. Create a follow-up request instead.');}
    const rows=await db('rr_counsel_requests?id=eq.'+row.id+'&reply_hash=eq.'+await hash(a.return_capability)+'&response_text=is.null','PATCH',{response_text:a.response_text,answered_at:new Date().toISOString()});
    if(!rows.length)throw new Problem(409,'A reply was saved by another session. Refresh the request.');
    return {saved:true,request_id:row.id};
  }
  throw new Problem(404,'Unknown operation.');
}
const properties={request_id:{type:'string',description:'The exact request ID from the Root & Rise handoff'},return_capability:{type:'string',description:'The request-scoped return capability from the handoff'}};
const toolDefs=[
  {name:'get_plant_request',description:'Read one Root & Rise plant issue using its exact request capability. Contains text and care context; the plant photo must be attached in chat.',inputSchema:{type:'object',properties,required:['request_id','return_capability'],additionalProperties:false},annotations:{readOnlyHint:true}},
  {name:'submit_plant_response',description:'Save Ember’s advice back to exactly one Root & Rise plant request. Does not mark watering, change care dates or send messages to others.',inputSchema:{type:'object',properties:{...properties,response_text:{type:'string',maxLength:12000}},required:['request_id','return_capability','response_text'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true}}
];
export async function handler(req:Request) {
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method==='GET')return json({error:'Use POST for the plant journal.'},405);
  if(req.method!=='POST')return json({error:'Method not allowed.'},405);
  const origin=req.headers.get('origin');if(origin&&origin!=='https://theblackstaginn.github.io')return json({error:'Origin not allowed.'},403);
  let message:any;
  try {
    const reader=req.body?.getReader();if(!reader)throw new Problem(400,'Missing request body.');
    let bytes=0;const chunks:Uint8Array[]=[];
    for(;;){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>48000){await reader.cancel();throw new Problem(413,'Request too large.');}chunks.push(value);}
    const buffer=new Uint8Array(bytes);let pos=0;for(const c of chunks){buffer.set(c,pos);pos+=c.length;}
    message=JSON.parse(new TextDecoder().decode(buffer));
    if(!message||typeof message!=='object'||Array.isArray(message))throw new Problem(400,'Invalid request.');
    if(message.jsonrpc==='2.0') {
      const id=message.id??null;
      if(message.method==='initialize')return json({jsonrpc:'2.0',id,result:{protocolVersion:'2024-11-05',capabilities:{tools:{listChanged:false}},serverInfo:{name:'root-rise',version:'1.0.0'},instructions:'Use only the exact request ID and capability from the user handoff. Read the request, assess the attached photo, then submit advice to that same request. Root & Rise alone owns care records.'}});
      if(message.method?.startsWith('notifications/'))return new Response(null,{status:202,headers:cors});
      if(message.method==='ping')return json({jsonrpc:'2.0',id,result:{}});
      if(message.method==='tools/list')return json({jsonrpc:'2.0',id,result:{tools:toolDefs}});
      if(message.method!=='tools/call'||!toolDefs.some(t=>t.name===message.params?.name))return json({jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
      try {const result=await action(message.params.name,message.params.arguments||{},req);return json({jsonrpc:'2.0',id,result:{content:[{type:'text',text:JSON.stringify(result)}]}});}catch(e){return json({jsonrpc:'2.0',id,result:{isError:true,content:[{type:'text',text:e instanceof Problem?e.message:'The garden journal could not be reached.'}]}});}
    }
    return json(await action(message.action,message,req));
  } catch(e) {return json({error:e instanceof Problem?e.message:'Invalid request or temporary garden journal error.'},e instanceof Problem?e.status:400);}
}
Deno.serve(handler);
