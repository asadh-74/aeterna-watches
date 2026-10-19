const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const file=process.env.INVENTORY_FILE||'/tmp/aeterna-inventory.json';let sessions={};try{sessions=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}
const fields=['name','price','stock','active'];
function initial(){return {products:[{sku:'AET-001',name:'Aeterna Chronograph',price:249,stock:18,active:true,version:1},{sku:'AET-002',name:'Lunar Minimal',price:179,stock:7,active:true,version:1},{sku:'AET-003',name:'Heritage Automatic',price:399,stock:3,active:true,version:1}],channels:{storefront:{},warehouse:{}},jobs:[],operations:{},updated:Date.now()}}
function persist(){fs.writeFileSync(file+'.tmp',JSON.stringify(sessions),{mode:0o600});fs.renameSync(file+'.tmp',file)}
function processJob(s,job){
 if(!job)throw Error('Sync job not found');if(['succeeded','superseded'].includes(job.status))return job;if(job.attempts>=3)throw Error('Retry limit reached. Create a new product update after investigating.');
 const latest=s.products.find(p=>p.sku===job.sku),target=s.channels[job.channel][job.sku];
 if(latest.version>job.version||(target&&target.version>job.version)){job.status='superseded';job.error='A newer product version exists; old data was not written';return job}
 job.attempts++;job.lastAttempt=new Date().toISOString();
 if(job.failOnce&&job.attempts===1){job.status='failed';job.error='Injected demo connector timeout. No target write occurred.';job.nextRetryAt=Date.now()+1000;return job}
 s.channels[job.channel][job.sku]={sku:job.sku,...job.payload,version:job.version,syncedAt:new Date().toISOString()};job.status='succeeded';job.error=null;job.nextRetryAt=null;return job;
}
function update(s,sku,body){
 const p=s.products.find(x=>x.sku===sku);if(!p)throw Error('Unknown SKU');
 if(!/^[a-zA-Z0-9-]{16,64}$/.test(body.operationId||''))throw Error('Supply a valid operation ID');
 if(typeof body.name!=='string'||!body.name.trim()||body.name.length>100||typeof body.price!=='number'||!Number.isFinite(body.price)||body.price<0||body.price>100000||Math.abs(body.price*100-Math.round(body.price*100))>0.00001||!Number.isInteger(body.stock)||body.stock<0||body.stock>100000||typeof body.active!=='boolean')throw Error('Use a name, nonnegative price (two decimals), whole-number stock and active flag');
 if(Object.keys(body).some(k=>!fields.includes(k)&&!['operationId','expectedVersion','simulateFailure'].includes(k)))throw Error('Unsupported field: only name, price, stock and active can sync');
 const payload=Object.fromEntries(fields.map(k=>[k,k==='name'?body[k].trim():body[k]]));const fingerprint=JSON.stringify({sku,payload,expectedVersion:body.expectedVersion,simulateFailure:!!body.simulateFailure});
 const prior=s.operations[body.operationId];if(prior){if(prior.fingerprint!==fingerprint)throw Error('Operation ID already used with different data');return {replayed:true,version:prior.version}}
 if(body.expectedVersion!==p.version)throw Error('Version conflict. Refresh the product before saving.');
 if(Object.keys(s.operations).length>=100)throw Error('Demo operation limit reached');Object.assign(p,payload,{version:p.version+1});
 s.operations[body.operationId]={fingerprint,version:p.version};
 for(const channel of Object.keys(s.channels)){const job={id:crypto.randomUUID(),sku,channel,version:p.version,payload:{...payload},status:'pending',attempts:0,failOnce:!!body.simulateFailure&&channel==='warehouse',created:new Date().toISOString()};s.jobs.unshift(job);processJob(s,job)}
 s.jobs=s.jobs.slice(0,100);return {replayed:false,version:p.version};
}
function state(sid){const now=Date.now();for(const [id,s]of Object.entries(sessions))if(now-s.updated>86400000)delete sessions[id];if(!sessions[sid]){if(Object.keys(sessions).length>=15)delete sessions[Object.keys(sessions)[0]];sessions[sid]=initial()}sessions[sid].updated=now;return sessions[sid]}
function attach(app){
 const express=require('express');app.use('/inventory/assets',express.static(path.join(__dirname,'inventory-ui'),{index:false}));app.get(['/','/inventory'],(req,res)=>res.sendFile(path.join(__dirname,'inventory-ui/index.html')));
 app.use('/api/inventory',(req,res,next)=>{let sid=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('inventory_session='))?.split('=')[1];if(!/^[a-f0-9]{48}$/.test(sid||'')){sid=crypto.randomBytes(24).toString('hex');res.setHeader('Set-Cookie','inventory_session='+sid+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400'+(process.env.RENDER?'; Secure':''))}req.inventory=state(sid);res.setHeader('Cache-Control','no-store');next()});
 app.get('/api/inventory/state',(req,res)=>res.json({...req.inventory,supportedFields:fields,integration:'Local storefront and warehouse replicas; no Shopify/WooCommerce connection'}));
 app.get('/api/inventory/catalog',(req,res)=>res.json(Object.values(req.inventory.channels.storefront).filter(p=>p.active)));
 app.post('/api/inventory/products/:sku',(req,res)=>{try{const receipt=update(req.inventory,req.params.sku,req.body);persist();res.json({receipt,state:req.inventory})}catch(e){res.status(/conflict|already used/.test(e.message)?409:422).json({error:e.message})}});
 app.post('/api/inventory/jobs/:id/retry',(req,res)=>{try{const job=req.inventory.jobs.find(j=>j.id===req.params.id);if(job&&job.nextRetryAt>Date.now())return res.status(429).json({error:'Wait until the retry backoff has elapsed'});processJob(req.inventory,job);persist();res.json(req.inventory)}catch(e){res.status(422).json({error:e.message})}});
}
module.exports={initial,update,processJob,attach};
