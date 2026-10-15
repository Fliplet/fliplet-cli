// Run the published fences. Fixtures replace transport, not the guide logic.
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';

const root = fileURLToPath(new URL('../../API/core/ai/', import.meta.url));
function fence(page, id) {
  const source = readFileSync(root + page + '.md', 'utf8');
  const match = source.match(new RegExp('<!-- example: ' + id + ' -->\\s*```(?:js|html|json)\\n([\\s\\S]*?)```'));
  assert.ok(match, 'Published fence exists: ' + id);
  return match[1];
}
function browser(page, html, scripts) {
  const dom = new JSDOM(fence(page, html), { runScripts: 'outside-only', url: 'https://app.example/' });
  const window = dom.window;
  window.marked = marked;
  window.DOMPurify = createDOMPurify(window);
  const lazy = async () => {};
  lazy.chain = async () => { throw new Error('Lazy dependency not registered'); };
  const requests = [];
  const extraction = { summary: 'Invoice', fields: [{ name: 'Total', value: '12.00', evidence: 'Printed total' }], warnings: [] };
  window.Fliplet = {
    AI: { createCompletion: async request => { requests.push(request); return structured(extraction); } },
    require: { lazy },
    Env: { get: () => 'https://api.example/' },
    Media: { Files: { get: async () => ({ name: 'invoice.pdf', contentType: 'application/pdf', isEncrypted: true }) }, authenticate: url => url + '?sig=private-test-signature' }
  };
  scripts.forEach(id => vm.runInContext(fence(page, id), dom.getInternalVMContext()));
  return { dom, window, requests, extraction, element: id => window.document.getElementById(id) };
}
const media = scripts => browser('media-inputs', 'media-html', scripts || ['media-core', 'media-form', 'media-private']);
const research = () => browser('grounded-answers', 'grounded-html', ['grounded-main']);
async function until(predicate, message = 'Expected async state was not reached') {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, message);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
function structured(value) { return { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }; }
function webResult(text, annotations = []) {
  return { status: 'completed', output: [{ type: 'web_search_call', status: 'completed' }, { type: 'message', content: [{ type: 'output_text', text, annotations }] }] };
}
function citation(start, end, url = 'https://source.example/article') { return { type: 'url_citation', start_index: start, end_index: end, title: 'Source <script>', url }; }
function pdf(b, size) {
  return new b.window.File(['%PDF-1.7\n', ...(size ? [new Uint8Array(size - 9)] : [])], 'invoice.pdf', { type: 'application/pdf' });
}
function streamResponse(bytes, { type = 'application/pdf', length = null } = {}) {
  let canceled = false;
  return {
    ok: true,
    headers: { get: key => key === 'content-type' ? type : length },
    body: new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); }, cancel() { canceled = true; } }),
    get canceled() { return canceled; }
  };
}

it('research uses Responses search and the declared real parser and sanitizer for inline returned sources', async () => {
  const b = research();
  const resources = JSON.parse(fence('grounded-answers', 'grounded-resources'));
  const dependencies = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url))).devDependencies;
  assert.ok(resources[0].latest.includes('marked@' + dependencies.marked + '/'));
  assert.ok(resources[1].latest.includes('dompurify@' + dependencies.dompurify + '/'));
  const cited = '[Provider citation](https://source.example/article)';
  const text = '**Useful finding** ' + cited + '\n\n- One item\n- Another item';
  const start = text.indexOf(cited);
  const result = webResult(text, [citation(start, start + cited.length, 'https://source.example/article?topic=(one)')]);
  const original = JSON.stringify(result);
  b.window.Fliplet.AI.createCompletion = async request => { b.requests.push(request); return result; };
  b.element('research-question').value = 'A question';
  b.element('research-form').dispatchEvent(new b.window.Event('submit', { cancelable: true }));
  await until(() => !b.element('research-submit').disabled);
  assert.equal(b.requests[0].useResponses, true);
  assert.equal(b.requests[0].model, 'gpt-6.1-sol');
  assert.equal(b.requests[0].tools[0].type, 'web_search');
  const output = b.element('research-answer');
  assert.equal(output.querySelector('strong').textContent, 'Useful finding');
  assert.equal(output.querySelectorAll('li').length, 2);
  assert.equal(output.textContent.includes('**'), false);
  assert.equal(output.textContent.includes('[Provider'), false);
  const links = output.querySelectorAll('a');
  assert.equal(links.length, 2);
  assert.equal(links[0].textContent, 'Provider citation');
  assert.equal(links[1].textContent, 'Source 1');
  assert.equal(links[1].href, result.output[1].content[0].annotations[0].url);
  assert.equal(links[1].rel, 'noopener noreferrer');
  assert.equal(links[1].title, 'Source <script>');
  assert.equal(JSON.stringify(result), original, 'Original text and annotations must remain unchanged');
  assert.match(b.element('research-status').textContent, /inline source/);
  b.window.close();
});

it('a citation covering prose preserves the full factual claim before its authoritative source link', () => {
  const b = research();
  const claim = 'Revenue increased **12%**.';
  const text = 'Finding: ' + claim + ' Review the report.';
  const start = text.indexOf(claim);
  const url = 'https://source.example/report?period=(2026)&view=full';
  const result = webResult(text, [citation(start, start + claim.length, url)]);
  const original = JSON.stringify(result);
  b.window.renderWebAnswer(result, b.element('research-answer'));
  const output = b.element('research-answer');
  assert.equal(output.textContent.trim(), 'Finding: Revenue increased 12%. Source 1 Review the report.');
  assert.equal(output.querySelector('strong').textContent, '12%');
  assert.equal(output.querySelector('a').href, url);
  assert.equal(output.querySelector('a').textContent, 'Source 1');
  assert.equal(JSON.stringify(result), original);
  b.window.close();
});

it('hostile Markdown and HTML are sanitized while citations remain faithful clickable sources', () => {
  const b = research();
  const text = '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1)) [credentials](https://user:password@source.example/) **Result** [cite](https://model.example/)';
  const start = text.indexOf('cite');
  b.window.renderWebAnswer(webResult(text, [citation(start, start + 4)]), b.element('research-answer'));
  const output = b.element('research-answer');
  assert.equal(output.querySelector('script,img,[onerror],a a'), null);
  assert.equal(output.querySelector('strong').textContent, 'Result');
  assert.equal(output.querySelectorAll('a').length, 1);
  assert.equal(output.querySelector('a').href, 'https://source.example/article');
  assert.equal(output.querySelector('a').textContent, 'Source 1');
  assert.equal(output.textContent.includes('FLIPLETCITATION'), false);
  b.window.close();
});

it('citations removed by Markdown formatting are withheld rather than reassigned', () => {
  const b = research();
  for (const text of ['<script>citation</script>', '<a title="citation">Link</a>']) {
    const start = text.indexOf('citation');
    assert.throws(() => b.window.renderWebAnswer(webResult(text, [citation(start, start + 8)]), b.element('research-answer')), /withheld/);
    assert.equal(b.element('research-answer').childNodes.length, 0);
  }
  b.window.close();
});

it('renderer dependency failures preserve the question and make zero AI calls', async () => {
  for (const failure of ['loader', 'parser', 'sanitizer']) {
    const b = research();
    if (failure === 'loader') b.window.Fliplet.require.lazy = async () => { throw new b.window.Error('Resource failed'); };
    if (failure === 'parser') delete b.window.marked;
    if (failure === 'sanitizer') b.window.DOMPurify = { isSupported: false };
    b.element('research-question').value = 'Keep this question';
    b.element('research-form').dispatchEvent(new b.window.Event('submit', { cancelable: true }));
    await until(() => !b.element('research-submit').disabled);
    assert.equal(b.requests.length, 0);
    assert.equal(b.element('research-question').value, 'Keep this question');
    assert.match(b.element('research-status').textContent, /Resource failed|formatting could not load/);
    assert.equal(b.element('research-answer').childNodes.length, 0);
    b.window.close();
  }
});

it('citation offsets remain local to each text part and repeated URLs retain separate passages', () => {
  const b = research();
  const result = webResult('First source.', [citation(6, 12)]);
  result.output[1].content.push({ type: 'output_text', text: 'Second source.', annotations: [citation(7, 13)] });
  b.window.renderWebAnswer(result, b.element('research-answer'));
  assert.deepEqual([...b.element('research-answer').querySelectorAll('a')].map(a => a.textContent), ['Source 1', 'Source 2']);
  b.window.close();
});

it('missing citations and unconfirmed search are reported without inventing source links', () => {
  const b = research();
  assert.match(b.window.renderWebAnswer(webResult('Answer'), b.element('research-answer')), /unverified/);
  assert.equal(b.element('research-answer').querySelectorAll('a').length, 0);
  const result = webResult('Answer', [citation(0, 6)]);
  result.output.shift();
  assert.match(b.window.renderWebAnswer(result, b.element('research-answer')), /not confirmed/);
  b.window.close();
});

it('unsafe URLs, missing URLs, malformed and overlapping citation offsets withhold output', () => {
  const b = research();
  const bad = [
    [citation(0, 3, 'javascript:alert(1)')], [citation(0, 3, 'data:text/html,bad')],
    [citation(0, 3, 'https://user:password@source.example')], [citation(0, 3, '/relative')],
    [citation(0, 3, 'https://source.example/\ninjected')], [citation(0, 3, undefined)],
    [citation(-1, 3)], [citation(0, 99)], [citation(3, 3)], [citation(0.5, 3)],
    [citation(0, 3), citation(2, 4)]
  ];
  // The helper default fills undefined; remove the actual annotation URL.
  delete bad[5][0].url;
  for (const annotations of bad) {
    const output = b.element('research-answer'); output.replaceChildren();
    assert.throws(() => b.window.renderWebAnswer(webResult('Answer', annotations), output), /withheld/);
    assert.equal(output.childNodes.length, 0);
  }
  b.window.close();
});

it('refusal, incomplete, provider error and absent text never become a research answer', () => {
  const b = research();
  for (const result of [null, { status: 'incomplete' }, { status: 'completed', error: { message: 'bad' } }, { status: 'completed', output: [] }, { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }]) {
    assert.throws(() => b.window.renderWebAnswer(result, b.element('research-answer')));
  }
  b.window.close();
});

it('research keeps input on error, blocks duplicates and retries only after a fresh submission', async () => {
  const b = research(); let reject;
  b.window.Fliplet.AI.createCompletion = request => { b.requests.push(request); return new Promise((_, no) => { reject = no; }); };
  b.element('research-question').value = 'Keep my question';
  const submit = () => b.element('research-form').dispatchEvent(new b.window.Event('submit', { cancelable: true }));
  submit(); submit(); await until(() => b.requests.length === 1); assert.equal(b.requests.length, 1);
  reject(new b.window.Error('Network failed')); await until(() => !b.element('research-submit').disabled);
  assert.equal(b.element('research-question').value, 'Keep my question');
  assert.match(b.element('research-status').textContent, /Network failed/);
  assert.equal(b.element('research-submit').disabled, false);
  assert.equal(b.requests.length, 1);
  submit(); await until(() => b.requests.length === 2); assert.equal(b.requests.length, 2);
  reject(new b.window.Error('Network failed')); await until(() => !b.element('research-submit').disabled);
  b.window.close();
});

it('PDF file bytes and strict schema pass through Responses and output validates', async () => {
  const b = media();
  const value = await b.window.analyzeMedia(pdf(b), 'invoice.pdf');
  assert.equal(value.fields[0].value, '12.00');
  const request = b.requests[0];
  assert.equal(request.useResponses, true);
  assert.equal(request.text.format.type, 'json_schema');
  assert.equal(request.text.format.strict, true);
  assert.equal(request.text.format.schema.additionalProperties, false);
  assert.equal(request.input[0].content[1].type, 'input_file');
  assert.equal(Buffer.from(request.input[0].content[1].file_data.split(',')[1], 'base64').toString(), '%PDF-1.7\n');
  b.window.close();
});

it('PNG, JPEG and WebP use typed image input and the second task', async () => {
  const b = media();
  for (const [type, bytes] of [['image/png', [137,80,78,71,13,10,26,10]], ['image/jpeg', [255,216,255]], ['image/webp', [...Buffer.from('RIFFxxxxWEBP')]]]) {
    await b.window.analyzeMedia(new b.window.Blob([new Uint8Array(bytes)], { type }), 'photo', 'photo');
    const request = b.requests.at(-1);
    assert.equal(request.input[0].content[1].type, 'input_image');
    assert.match(request.input[0].content[1].image_url, new RegExp('^data:' + type + ';base64,'));
    assert.match(request.input[0].content[0].text, /visible objects/);
  }
  b.window.close();
});

it('empty, unsupported, spoofed, oversize and invalid selection inputs make zero AI calls', async () => {
  const b = media();
  const cases = [[undefined, 'x'], [new b.window.Blob([],{type:'application/pdf'}),'x'],
    [new b.window.Blob(['x'],{type:'text/html'}),'x'], [new b.window.Blob(['bad'],{type:'application/pdf'}),'x'],
    [pdf(b, 5*1024*1024+1),'x'], [pdf(b),''], [pdf(b),'a\nb.pdf'], [pdf(b),'x','bad'], [pdf(b),'x','photo']];
  for (const args of cases) await assert.rejects(b.window.analyzeMedia(...args));
  assert.equal(b.requests.length, 0);
  b.window.close();
});

it('the exact 5 MiB file boundary succeeds and the encoded request cap is independently checked', async () => {
  const b = media();
  await b.window.analyzeMedia(pdf(b, 5*1024*1024), 'boundary.pdf');
  assert.equal(b.requests.length, 1);
  // Simulate a failed/expanded encoder to exercise the actual JSON byte guard.
  b.window.mediaDataUrl = async () => 'data:application/pdf;base64,' + Buffer.from('%PDF-1.7\n').toString('base64') + 'A'.repeat(7*1024*1024);
  await assert.rejects(b.window.analyzeMedia(pdf(b), 'small.pdf'), /encoded request is too large/);
  assert.equal(b.requests.length, 1);
  b.window.close();
});

it('structured extraction rejects refusal, incomplete, invalid JSON, extra keys and invalid field shapes', async () => {
  const b = media();
  const results = [null, { status: 'incomplete' }, { status: 'completed', error: {} },
    { status: 'completed', output: [{type:'message',content:[{type:'refusal',refusal:'No'}]}] },
    { status: 'completed', output: [{type:'message',content:[{type:'output_text',text:'not JSON'}]}] },
    structured({ ...b.extraction, secret: 'extra' }), structured({ ...b.extraction, fields:[{name:'Total',value:12,evidence:'x'}] }),
    structured({ ...b.extraction, fields: Array(33).fill(b.extraction.fields[0]) }), structured({ ...b.extraction, warnings: 'bad' }), structured({ ...b.extraction, fields: [] }),
    structured({ ...b.extraction, fields: [b.extraction.fields[0], { ...b.extraction.fields[0], name: ' TOTAL ' }] })];
  for (const result of results) {
    b.window.Fliplet.AI.createCompletion = async () => result;
    await assert.rejects(b.window.analyzeMedia(pdf(b), 'invoice.pdf'));
  }
  b.window.close();
});

it('editable preview renders hostile text safely and distinguishes missing values', () => {
  const b = media();
  const result = { summary:'<img src=x onerror=bad()>', fields:[{name:'<script>',value:null,evidence:'<b>unknown</b>'}], warnings:['<iframe>'] };
  b.window.renderExtraction(result,b.element('media-analysis-preview'));
  assert.equal(b.element('media-analysis-preview').querySelector('img,script,b,iframe'),null);
  const input = b.element('media-analysis-preview').querySelector('input');
  assert.equal(input.value,''); input.value='Corrected'; assert.equal(input.value,'Corrected');
  assert.match(b.element('media-analysis-preview').textContent,/not found/);
  assert.match(b.element('media-analysis-preview').textContent,/Field names and completeness have not been checked/);
  assert.equal(b.requests.length,0);
  b.window.close();
});

it('media form retains selection, clears old preview on failure and blocks duplicate requests', async () => {
  const b=media(); let reject;
  Object.defineProperty(b.element('media-analysis-file'),'files',{ value:[pdf(b)] });
  b.window.Fliplet.AI.createCompletion = request => { b.requests.push(request); return new Promise((_, no)=>{reject=no;}); };
  const submit=()=>b.element('media-analysis-form').dispatchEvent(new b.window.Event('submit',{cancelable:true}));
  b.element('media-analysis-preview').textContent='Old result';
  submit(); submit(); await until(() => b.requests.length === 1, 'Media request did not start after FileReader finished');
  assert.equal(b.requests.length,1); assert.equal(b.element('media-analysis-preview').textContent,'');
  reject(new b.window.Error('Provider unavailable')); await until(() => !b.element('media-analysis-submit').disabled);
  assert.match(b.element('media-analysis-status').textContent,/Provider unavailable/);
  assert.equal(b.element('media-analysis-file').files[0].name,'invoice.pdf');
  assert.equal(b.element('media-analysis-submit').disabled,false);
  assert.equal(b.requests.length,1);
  b.window.close();
});

it('eager media uses direct metadata and authenticated content fetch without requiring lazy registration or leaking auth URLs', async () => {
  const b=media(); const fetches=[];
  b.window.fetch=async (url,options)=>{fetches.push({url,options});return streamResponse(new Uint8Array(Buffer.from('%PDF-1.7\n')));};
  await b.window.analyzeStoredMedia(42);
  assert.equal(fetches[0].url,'https://api.example/v1/media/files/42/contents?sig=private-test-signature');
  assert.equal(fetches[0].options.redirect,'error');
  assert.equal(b.requests.length,1);
  assert.doesNotMatch(JSON.stringify(b.requests[0]),/private-test-signature|api\.example|auth_token|stateToken/);
  b.window.close();
});

it('missing eager media dependency fails visibly before metadata, content or AI requests', async () => {
  const b = media();
  let fetches = 0;
  b.window.fetch = async () => { fetches++; throw new Error('Unexpected fetch'); };
  delete b.window.Fliplet.Media.Files;
  await assert.rejects(b.window.analyzeStoredMedia(42), /Load the fliplet-media app dependency/);
  assert.equal(fetches, 0);
  assert.equal(b.requests.length, 0);
  b.window.close();
});

it('denied metadata and denied contents each stop before AI with zero provider requests', async () => {
  const b=media(); let fetches=0;
  b.window.Fliplet.Media.Files.get=async()=>{throw new b.window.Error('Forbidden');};
  b.window.fetch=async()=>{fetches++;return {ok:false};};
  await assert.rejects(b.window.analyzeStoredMedia(42),/Forbidden/);
  assert.equal(fetches,0);
  b.window.Fliplet.Media.Files.get=async()=>({isEncrypted:true,contentType:'application/pdf',name:'private.pdf'});
  await assert.rejects(b.window.analyzeStoredMedia(42),/cannot read/);
  assert.equal(fetches,1); assert.equal(b.requests.length,0);
  b.window.close();
});

it('stored-file adapter rejects insecure setup, type mismatch, declared oversize and streamed oversize', async () => {
  const b=media(); let fetches=0;
  b.window.fetch=async()=>{fetches++;return streamResponse(new Uint8Array(Buffer.from('%PDF-1.7\n')));};
  for(const id of [0,-1,'42',1.5]) await assert.rejects(b.window.analyzeStoredMedia(id));
  b.window.Fliplet.Media.Files.get=async()=>({isEncrypted:false,contentType:'application/pdf',name:'x.pdf'});
  await assert.rejects(b.window.analyzeStoredMedia(42),/encrypted/);
  b.window.Fliplet.Media.Files.get=async()=>({isEncrypted:true,contentType:'application/pdf',name:'x.pdf'});
  b.window.Fliplet.Env.get=()=> 'http://api.example/';
  await assert.rejects(b.window.analyzeStoredMedia(42),/secure/); assert.equal(fetches,0);
  b.window.Fliplet.Env.get=()=> 'https://api.example/';
  b.window.fetch=async()=>streamResponse(new Uint8Array([1]),{type:'text/html'});
  await assert.rejects(b.window.analyzeStoredMedia(42),/content type/);
  b.window.fetch=async()=>streamResponse(new Uint8Array([1]),{length:String(5*1024*1024+1)});
  await assert.rejects(b.window.analyzeStoredMedia(42),/exceeds/);
  b.window.fetch=async()=>streamResponse(new Uint8Array(5*1024*1024+1));
  await assert.rejects(b.window.analyzeStoredMedia(42),/exceeds/);
  assert.equal(b.requests.length,0);
  b.window.close();
});
