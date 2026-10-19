import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../../API/core/ai/tool-calling.md', import.meta.url), 'utf8');
const code = source.split('<!-- example: item-assistant -->')[1].match(/```js\n([\s\S]*?)```/)[1];
const call = (name='read_item', reference='ITEM-001', id='c1', extra={}) => ({type:'function_call',status:'completed',name,call_id:id,arguments:JSON.stringify({reference,...extra})});
const response = (...output) => ({status:'completed',output});
const message = text => ({type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text}]});
function runtime(replies, confirm=true) {
 const elements=new Map(), requests=[], confirmations=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',value:'',disabled:false,addEventListener(name,fn){this[name]=fn;}});return elements.get(id);};
 const window={confirm(text){confirmations.push(text);return confirm;}};
 const ctx=vm.createContext({window,document:{getElementById:element},console,setTimeout,clearTimeout,Fliplet:{User:{getAuthToken:()=> 'test-token'},Env:{get:()=>42},AI:{async createCompletion(request){requests.push(JSON.parse(JSON.stringify(request)));const next=replies.shift();if(next instanceof Error)throw next;return next;}}}});
 vm.runInContext(code,ctx);
 return {run:window.runItemAssistant,requests,confirmations,element};
}
it('public lookup result affects the following model turn and needs no data-source contexts',async()=>{
 const r=runtime([response(call()),response(message('Workshop checklist'))]);
 assert.equal(await r.run('Read ITEM-001'),'Workshop checklist');
 const out=r.requests[1].input.find(x=>x.type==='function_call_output');
 assert.equal(JSON.parse(out.output).item.title,'Check the workshop checklist');
 assert.equal(out.call_id,'c1');
 assert.doesNotMatch(source,/item-security-rule|typeof filter|typeof payload|Fliplet\.DataSources|Fliplet\.Session/);
});
it('confirmed local action changes only sample state, and reload recreates the sample',async()=>{
 const r=runtime([response(call('mark_item_reviewed')),response(message('Reviewed')),response(call('read_item','ITEM-001','c2')),response(message('Read back'))]);
 await r.run('Review ITEM-001'); await r.run('Read it');
 assert.equal(r.confirmations.length,1);
 assert.equal(JSON.parse(r.requests[3].input.find(x=>x.type==='function_call_output').output).item.status,'Reviewed');
 const fresh=runtime([response(call()),response(message('Fresh'))]);await fresh.run('Read');
 assert.equal(JSON.parse(fresh.requests[1].input.find(x=>x.type==='function_call_output').output).item.status,'Open');
});
it('declined local action leaves sample state unchanged',async()=>{
 const r=runtime([response(call('mark_item_reviewed')),response(message('Declined')),response(call('read_item','ITEM-001','c2')),response(message('Read back'))],false);
 await r.run('Review');await r.run('Read');
 assert.equal(JSON.parse(r.requests[3].input.find(x=>x.type==='function_call_output').output).item.status,'Open');
});
it('already reviewed assignment does not repeat confirmation',async()=>{
 const r=runtime([response(call('mark_item_reviewed')),response(message('Done')),response(call('mark_item_reviewed','ITEM-001','c2')),response(message('Already reviewed'))]);
 await r.run('Review');await r.run('Review again');assert.equal(r.confirmations.length,1);
});
for(const [label,invalid] of [['unknown tool',call('delete_all')],['extra argument',call('read_item','ITEM-001','c1',{admin:true})],['bad reference',call('read_item','../private')]]) {
 it('rejects '+label+' before any action',async()=>{const r=runtime([response(invalid)]);await assert.rejects(r.run('Run'));assert.equal(r.confirmations.length,0);});
}
it('validates the complete batch before executing any tool',async()=>{
 const r=runtime([response(call('mark_item_reviewed'),call('delete_all','ITEM-002','c2'))]);await assert.rejects(r.run('Run'));assert.equal(r.confirmations.length,0);
});
it('rejects incomplete responses and repeated call IDs without executing another action',async()=>{
 const bad=runtime([{status:'incomplete',output:[call('mark_item_reviewed')]}]);await assert.rejects(bad.run('Run'));assert.equal(bad.confirmations.length,0);
 const r=runtime([response(call()),response(call('mark_item_reviewed'))]);await assert.rejects(r.run('Run'));assert.equal(r.confirmations.length,0);
});
it('preserves opaque reasoning and matching tool/result history',async()=>{
 const r=runtime([response({type:'reasoning',summary:[],encrypted_content:'opaque'},call()),response(message('Done'))]);await r.run('Read');assert.equal(r.requests[1].input.find(x=>x.type==='reasoning').encrypted_content,'opaque');
});
it('bounds rounds and permits explicit recovery after a provider error',async()=>{
 const r=runtime([response(call('read_item','ITEM-001','c1')),response(call('read_item','ITEM-001','c2')),response(call('read_item','ITEM-001','c3')),response(call('read_item','ITEM-001','c4'))]);await assert.rejects(r.run('Read'),/round limit/);assert.equal(r.requests.length,4);
 const e=runtime([new Error('Unavailable'),response(message('Recovered'))]);await assert.rejects(e.run('Read'),/Unavailable/);assert.equal(await e.run('Retry'),'Recovered');
});
