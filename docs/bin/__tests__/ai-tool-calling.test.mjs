import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../API/core/ai/tool-calling.md', import.meta.url), 'utf8');
function example(name) {
  const section = source.split(`<!-- example: ${name} -->`)[1];
  assert.ok(section, `Missing example ${name}`);
  return section.match(/```js\n([\s\S]*?)```/)[1];
}
const rule = example('item-security-rule');
const assistant = example('item-assistant');
const plain = value => JSON.parse(JSON.stringify(value));
function authorize(type, query, entry, session = { loggedIn: true, dataSourceId: 123, entryId: 101 }, user = { Name: 'Alice' }) {
  const context = { type, query: plain(query), entry: entry && plain(entry), session, user };
  const result = vm.runInNewContext(`(function() { ${rule} })()`, context);
  return { result: plain(result), query: context.query };
}
function call(name = 'read_item', reference = 'ITEM-001', id = 'call_1') {
  return { type: 'function_call', status: 'completed', name, call_id: id, arguments: JSON.stringify({ reference }) };
}
const response = (...output) => ({ status: 'completed', output });
const message = text => ({ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text }] });
function runtime(replies, options = {}) {
  const rows = [
    { id: 11, data: { Reference: 'ITEM-001', OwnerId: 101, Title: 'Checklist', Status: 'Open' } },
    { id: 22, data: { Reference: 'ITEM-002', OwnerId: 202, Title: 'Private equipment list', Status: 'Open' } }
  ];
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { textContent: '', value: '', disabled: false, addEventListener(name, fn) { this[name] = fn; } });
    return elements.get(id);
  };
  const requests = [];
  const confirmations = [];
  let writes = 0;
  let reads = 0;
  let token = 'test-app-token';
  const connection = {
    async find(query) {
      reads++;
      if (options.readError && options.readError(reads)) throw Error('Unavailable');
      const access = authorize('select', query.where, undefined, options.session, options.user);
      if (!access.result.granted) throw Error('Denied');
      // Use the submitted filters. Do not simulate server query rewriting.
      return rows.filter(row => Object.entries(query.where).every(([key, value]) => row.data[key] === value))
        .map(row => ({ id: row.id, data: Object.fromEntries(access.result.include.map(key => [key, row.data[key]])) }));
    },
    async update(id, data, controls) {
      assert.equal(controls.allowOffline, false);
      const row = rows.find(row => row.id === id);
      if (!authorize('update', data, row, options.session, options.user).result.granted) throw Error('Denied');
      writes++;
      if (!options.noSave) Object.assign(row.data, data);
      if (options.writeError) throw Error('Lost response');
      if (options.rotateOnWrite) token = 'new-token';
      return plain(row);
    }
  };
  const window = { confirm(text) { confirmations.push(text); return options.confirm !== false; } };
  const context = vm.createContext({
    window, document: { getElementById: element }, console,
    setTimeout: options.fastTimeout ? fn => setImmediate(fn) : setTimeout,
    clearTimeout: options.fastTimeout ? clearImmediate : clearTimeout,
    Fliplet: {
      Session: { get: async () => ({ entries: { dataSource: { id: options.session?.entryId || 101 } } }) },
      User: { getAuthToken: () => token }, Env: { get: () => 42 },
      DataSources: { connect: async (id, controls) => { assert.equal(id, 456); assert.equal(controls.offline, false); return connection; } },
      AI: { createCompletion: async request => {
        requests.push(plain(request));
        const next = replies.shift();
        assert.ok(next, 'Unexpected extra model call');
        return typeof next === 'function' ? next() : next;
      } }
    }
  });
  vm.runInContext(assistant, context);
  return { run: window.runItemAssistant, requests, confirmations, rows, connection, element,
    get writes() { return writes; }, get reads() { return reads; } };
}

it('server rule binds login source and rejects missing, forged or operator-based ownership filters', () => {
  const allowed = authorize('select', { Reference: 'ITEM-001', OwnerId: 101 });
  assert.equal(allowed.result.granted, true);
  assert.deepEqual(plain(allowed.query), { Reference: 'ITEM-001', OwnerId: 101 });
  for (const query of [{}, { Reference: 'ITEM-001' }, { Reference: 'ITEM-001', OwnerId: 202 }, { Reference: { $ne: '' }, OwnerId: 101 }, []]) {
    assert.equal(authorize('select', query).result.granted, false);
  }
  for (const session of [null, { loggedIn: false }, { loggedIn: true, dataSourceId: 999, entryId: 101 }]) {
    assert.equal(authorize('select', { Reference: 'ITEM-001' }, undefined, session).result.granted, false);
  }
  assert.equal(authorize('select', { Reference: 'ITEM-001' }, undefined, undefined, null).result.granted, false);
});

it('server update checks stored owner and exact fields; unsupported operations cannot mutate rows', () => {
  const entry = { id: 11, data: { OwnerId: 101, Reference: 'ITEM-001', Status: 'Open' } };
  assert.equal(authorize('update', { Status: 'Reviewed' }, entry).result.granted, true);
  for (const data of [{ Status: 'Open' }, { Status: 'Reviewed', OwnerId: 101 }, [{ Status: 'Reviewed' }], {}]) {
    assert.equal(authorize('update', data, entry).result.granted, false);
  }
  assert.equal(authorize('update', { Status: 'Reviewed' }, { ...entry, data: { ...entry.data, OwnerId: 202 } }).result.granted, false);
  for (const type of ['insert', 'delete']) assert.equal(authorize(type, { Status: 'Reviewed' }, entry).result.granted, false);
});

it('authorized read result influences continuation without exposing owner or hidden fields', async () => {
  const app = runtime([response(call()), response(message('Checklist is Open.'))]);
  assert.equal(await app.run('Read ITEM-001'), 'Checklist is Open.');
  const result = app.requests[1].input.find(item => item.type === 'function_call_output');
  assert.equal(result.call_id, 'call_1');
  assert.equal(JSON.parse(result.output).item.title, 'Checklist');
  assert.doesNotMatch(result.output, /OwnerId|Private equipment/);
  assert.equal(app.writes, 0);
});

it('denied reads stop before sending private record data in a continuation', async () => {
  const app = runtime([response(call('read_item', 'ITEM-002'))]);
  await assert.rejects(app.run('Read ITEM-002'), /unavailable/);
  assert.equal(app.requests.length, 1);
  assert.equal(app.writes, 0);
});

it('confirmed fixed update has exact confirmation and server readback', async () => {
  const app = runtime([response(call('mark_item_reviewed')), response(message('The item is reviewed.'))]);
  await app.run('Review ITEM-001');
  assert.equal(app.writes, 1);
  assert.equal(app.reads, 2);
  assert.equal(app.rows[0].data.Status, 'Reviewed');
  assert.match(app.confirmations[0], /ITEM-001 \(record 11\).*Checklist.*Open to Reviewed/);
  assert.equal(JSON.parse(app.requests[1].input.at(-1).output).outcome, 'reviewed');
});

it('declined confirmation does not write and is correlated as declined', async () => {
  const app = runtime([response(call('mark_item_reviewed')), response(message('No change made.'))], { confirm: false });
  await app.run('Review ITEM-001');
  assert.equal(app.writes, 0);
  assert.equal(JSON.parse(app.requests[1].input.at(-1).output).outcome, 'declined');
});

it('lost write response reconciles observed state without claiming the write was acknowledged', async () => {
  const app = runtime([response(call('mark_item_reviewed')), response(message('The observed status is Reviewed.'))], { writeError: true });
  await app.run('Review ITEM-001');
  assert.equal(app.writes, 1);
  assert.equal(JSON.parse(app.requests[1].input.at(-1).output).outcome, 'observed_reviewed');
});

it('unknown or unconfirmed write outcome stops with no retry or model continuation', async () => {
  for (const options of [{ writeError: true, readError: n => n > 1 }, { writeError: true, noSave: true }]) {
    const app = runtime([response(call('mark_item_reviewed'))], options);
    await assert.rejects(app.run('Review ITEM-001'), /unknown|not confirmed/);
    assert.equal(app.writes, 1);
    assert.equal(app.requests.length, 1);
  }
});

it('all calls are validated before any effects, including malformed and duplicate calls', async () => {
  const invalid = [
    { ...call(), name: 'delete_all' }, { ...call(), arguments: '{' },
    { ...call(), arguments: '{"reference":"ITEM-001","OwnerId":101}' },
    { ...call(), status: 'in_progress' }, call('read_item', 'ITEM-001', 'write')
  ];
  for (const bad of invalid) {
    const app = runtime([response(call('mark_item_reviewed', 'ITEM-001', 'write'), bad)]);
    await assert.rejects(app.run('Review ITEM-001'));
    assert.equal(app.writes, 0);
    assert.equal(app.reads, 0);
  }
});

it('refusal, incomplete output, unsupported items and oversize output do not execute tools', async () => {
  for (const reply of [
    { status: 'incomplete', output: [call('mark_item_reviewed')] },
    response(call('mark_item_reviewed'), { ...message(''), content: [{ type: 'refusal', refusal: 'No' }] }),
    response(call('mark_item_reviewed'), { type: 'unknown' }),
    response(message('x'.repeat(25000)))
  ]) {
    const app = runtime([reply]);
    await assert.rejects(app.run('Review ITEM-001'));
    assert.equal(app.writes, 0);
    assert.equal(app.reads, 0);
  }
});

it('opaque reasoning is retained and output-only fields are not blindly replayed', async () => {
  const reasoning = { type: 'reasoning', id: 'rs_1', summary: [], encrypted_content: 'opaque-token', outputOnly: 'discard' };
  const app = runtime([response(reasoning, call()), response(message('Read complete.'))]);
  await app.run('Read ITEM-001');
  const replay = app.requests[1].input.find(item => item.type === 'reasoning');
  assert.equal(replay.encrypted_content, 'opaque-token');
  assert.equal(replay.outputOnly, undefined);
  assert.equal(app.requests[0].store, false);
  assert.deepEqual(app.requests[0].include, ['reasoning.encrypted_content']);
  assert.equal(Object.hasOwn(app.requests[0], 'context_management'), false);
});

it('repeated writes and round limits stop without additional mutations', async () => {
  const app = runtime([response(call('mark_item_reviewed')), response(call('mark_item_reviewed', 'ITEM-001', 'again'))]);
  await assert.rejects(app.run('Review ITEM-001'), /repeated write/);
  assert.equal(app.writes, 1);
  const endless = runtime(Array.from({ length: 4 }, (_, n) => response(call('read_item', 'ITEM-001', 'call_' + n))));
  await assert.rejects(endless.run('Read ITEM-001'), /round limit/);
  assert.equal(endless.reads, 3);
});

it('identity change after dispatch prevents further model continuation', async () => {
  const app = runtime([response(call('mark_item_reviewed'))], { rotateOnWrite: true });
  await assert.rejects(app.run('Review ITEM-001'), /unknown/);
  assert.equal(app.writes, 1);
  assert.equal(app.requests.length, 1);
});

it('overlapping runs are rejected while the original request remains pending', async () => {
  let release;
  const app = runtime([() => new Promise(resolve => { release = resolve; })]);
  const first = app.run('Read ITEM-001');
  await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(app.run('Read ITEM-002'), /already running/);
  release(response(message('Done.')));
  assert.equal(await first, 'Done.');
});


it('local timeout ignores a late model tool call without retrying or executing it', async () => {
  let finish;
  const app = runtime([() => new Promise(resolve => { finish = resolve; })], { fastTimeout: true });
  await assert.rejects(app.run('Review ITEM-001'), /timed out/);
  finish(response(call('mark_item_reviewed')));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.requests.length, 1);
  assert.equal(app.reads, 0);
  assert.equal(app.writes, 0);
});

it('call limits reject an entire oversized batch before reading or writing', async () => {
  const app = runtime([response(...Array.from({ length: 7 }, (_, n) => call('read_item', 'ITEM-001', 'call_' + n)))]);
  await assert.rejects(app.run('Read ITEM-001'), /call limit/);
  assert.equal(app.reads, 0);
});

it('verified operation outcome remains visible when final model generation fails', async () => {
  const app = runtime([response(call('mark_item_reviewed')), () => { throw Error('Model unavailable'); }]);
  await assert.rejects(app.run('Review ITEM-001'), /Model unavailable/);
  assert.match(app.element('item-assistant-effects').textContent, /ITEM-001: observed status Reviewed/);
  assert.equal(app.writes, 1);
});


it('canonical office rule validates submitted filters without relying on query mutation', () => {
  const security = readFileSync(new URL('../../Data-source-security.md', import.meta.url), 'utf8');
  const script = security.split('<!-- example: office-filter-rule -->')[1].match(/```js\n([\s\S]*?)```/)[1];
  for (const [query, type, user, expected] of [
    [{ Office: 'London' }, 'select', { Office: 'London' }, true],
    [{}, 'select', { Office: 'London' }, false],
    [{ Office: 'Paris' }, 'select', { Office: 'London' }, false],
    [{ Office: { $ne: '' } }, 'select', { Office: 'London' }, false],
    [{ Office: 'London', OwnerId: 202 }, 'select', { Office: 'London' }, false],
    [{ Office: 'London' }, 'select', undefined, false],
    [{ Office: 'London' }, 'insert', { Office: 'London' }, false],
    [{ Office: 'London' }, 'update', { Office: 'London' }, false]
  ]) {
    const before = plain(query);
    const result = vm.runInNewContext(`(function() { ${script} })()`, { query, type, user });
    assert.equal(result.granted, expected);
    assert.deepEqual(query, before);
  }
});

it('setup declares both registered dependencies used by the worked example', () => {
  const dependencies = JSON.parse(source.match(/```json\n([\s\S]*?)```/)[1]);
  assert.deepEqual(dependencies, ['fliplet-session', 'fliplet-datasources']);
});
