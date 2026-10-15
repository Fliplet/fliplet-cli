/**
 * DEV-1231/DEV-2276: regression tests for lib/api-credential.js.
 *
 * The bug these exist for: `fliplet test` moved the account token off the
 * query string and onto a header, but attached it with
 * page.setExtraHTTPHeaders(), which applies to EVERY request the page makes.
 * A widget preview that loaded a cross-origin image therefore sent the
 * developer's reusable account token to that third-party server (PR #319
 * review, P1). The token must reach the configured API and nothing else.
 *
 * Deliberately dependency-free: this repo has no test framework and `npm test`
 * was a placeholder, so adding one (and the ~170MB Chromium that a real
 * Puppeteer test needs) would be a bigger change than the fix. What is
 * asserted here is OUR decision — which requests get the header — driven
 * through the same handler the runner installs, with a stub `request` shaped
 * like Puppeteer's. What is NOT asserted here is Chromium's own behaviour
 * (that interception sees subresources and fires once per redirect hop); that
 * is Puppeteer's contract, and the review's own reproduction demonstrated it.
 *
 * Run with: npm test
 */

const assert = require('assert');
const { isApiOrigin, authenticateApiRequests, withoutCredential, CREDENTIAL_HEADER } = require('../lib/api-credential');

const API_URL = 'https://api.fliplet.test/';
const TOKEN = 'eu--test-account-token';

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    passed++;
    console.log('  ok   ' + description);
  } catch (err) {
    failed++;
    console.error('  FAIL ' + description);
    console.error('       ' + err.message);
  }
}

// A stand-in for Puppeteer's interceptable request. Records what the handler
// did so the test can assert both the headers AND that continue() was called
// exactly once — a request that is never continued hangs the page.
function stubRequest(url, headers) {
  const calls = [];

  return {
    url: () => url,
    headers: () => Object.assign({ 'user-agent': 'stub' }, headers || {}),
    continue: (overrides) => calls.push(overrides || null),
    calls,
    get sentHeaders() {
      return (calls[0] && calls[0].headers) || null;
    },
    get authHeader() {
      const sent = (calls[0] && calls[0].headers) || {};
      const key = Object.keys(sent).find((k) => k.toLowerCase() === 'auth-token');

      // Returns undefined for "absent" AND for the blank value the handler
      // sends on an untrusted hop, since neither authenticates anything.
      return key && sent[key] ? sent[key] : undefined;
    }
  };
}

function run(url) {
  const request = stubRequest(url);

  authenticateApiRequests(TOKEN, API_URL)(request);

  return request;
}

console.log('lib/api-credential — isApiOrigin');

it('accepts the API origin itself', () => {
  assert.strictEqual(isApiOrigin('https://api.fliplet.test/v1/user', API_URL), true);
});

it('accepts a different path and query on the API origin', () => {
  assert.strictEqual(isApiOrigin('https://api.fliplet.test/v1/apps/1/pages/2/preview?a=b', API_URL), true);
});

it('rejects a different host', () => {
  assert.strictEqual(isApiOrigin('https://cdn.example.com/image.png', API_URL), false);
});

it('rejects a lookalike host that merely starts with the API host', () => {
  assert.strictEqual(isApiOrigin('https://api.fliplet.test.example.com/steal', API_URL), false);
});

it('rejects a host that merely ends with the API host', () => {
  assert.strictEqual(isApiOrigin('https://evil-api.fliplet.test.example.com/', API_URL), false);
});

it('rejects a plain-HTTP downgrade of an HTTPS API', () => {
  assert.strictEqual(isApiOrigin('http://api.fliplet.test/v1/user', API_URL), false);
});

it('rejects a different port on the same host', () => {
  assert.strictEqual(isApiOrigin('https://api.fliplet.test:8443/v1/user', API_URL), false);
});

it('rejects data: URLs', () => {
  assert.strictEqual(isApiOrigin('data:text/html,<p>hi</p>', API_URL), false);
});

it('rejects about:blank', () => {
  assert.strictEqual(isApiOrigin('about:blank', API_URL), false);
});

it('rejects a relative or malformed URL', () => {
  assert.strictEqual(isApiOrigin('/v1/user', API_URL), false);
  assert.strictEqual(isApiOrigin('', API_URL), false);
  assert.strictEqual(isApiOrigin(undefined, API_URL), false);
});

it('matches a localhost API with a port', () => {
  assert.strictEqual(isApiOrigin('http://localhost:3000/v1/user', 'http://localhost:3000/'), true);
  assert.strictEqual(isApiOrigin('http://localhost:3001/v1/user', 'http://localhost:3000/'), false);
});

console.log('lib/api-credential — authenticateApiRequests');

it('attaches the token to an API request', () => {
  assert.strictEqual(run('https://api.fliplet.test/v1/user').authHeader, TOKEN);
});

it('does NOT attach the token to a cross-origin subresource', () => {
  const request = run('https://cdn.example.com/widget-image.png');

  assert.strictEqual(request.authHeader, undefined);
  // Headers ARE supplied, with the credential blanked. A bare continue() would
  // forward whatever a redirect hop inherited, so the override is required —
  // this assertion used to demand the opposite and is why the redirect leak
  // survived the first fix.
  assert.notStrictEqual(request.calls[0], null);
  assert.strictEqual(request.sentHeaders['auth-token'], '');
});

it('does NOT attach the token to a cross-origin script or iframe', () => {
  assert.strictEqual(run('https://unpkg.com/some-lib.js').authHeader, undefined);
  assert.strictEqual(run('https://www.youtube.com/embed/abc').authHeader, undefined);
});

it('does NOT attach the token to a redirect destination off the API origin', () => {
  // Interception fires once per hop, so the destination is just another URL
  // this handler judges on its own origin.
  assert.strictEqual(run('https://tracking.example.com/r?u=api').authHeader, undefined);
});

it('does NOT leak the token via a data: or blob: subresource', () => {
  assert.strictEqual(run('data:image/png;base64,AAAA').authHeader, undefined);
  assert.strictEqual(run('blob:https://api.fliplet.test/abc-123').authHeader, undefined);
});

it('continues every request exactly once', () => {
  assert.strictEqual(run('https://api.fliplet.test/v1/user').calls.length, 1);
  assert.strictEqual(run('https://cdn.example.com/x.png').calls.length, 1);
  assert.strictEqual(run('data:text/plain,x').calls.length, 1);
});

it('preserves the request\'s own headers when adding the token', () => {
  const request = stubRequest('https://api.fliplet.test/v1/user', { accept: 'text/html' });

  authenticateApiRequests(TOKEN, API_URL)(request);

  assert.strictEqual(request.sentHeaders.accept, 'text/html');
  assert.strictEqual(request.sentHeaders['user-agent'], 'stub');
  // Chromium reports and expects the lower-case spelling; HTTP header names
  // are case-insensitive, and the browser test confirms the API hop still
  // authenticates at a real server.
  assert.strictEqual(request.sentHeaders['auth-token'], TOKEN);
});

it('never puts the token on the query string', () => {
  const request = run('https://api.fliplet.test/v1/user');

  assert.strictEqual(request.url().indexOf('auth_token'), -1);
  assert.strictEqual(request.url().indexOf(TOKEN), -1);
});

console.log('lib/api-credential — an inherited credential on an untrusted hop');

// On a redirect, Chromium hands the next hop the headers of the previous one,
// so a request to another origin arrives ALREADY carrying the token added for
// the API hop. The original stub could not show this because it built every
// request fresh. These cases hand the handler a request that already has the
// header, which is the shape a redirected hop really has.
function runWithInherited(url) {
  const request = stubRequest(url, { [CREDENTIAL_HEADER]: TOKEN });

  authenticateApiRequests(TOKEN, API_URL)(request);

  return request;
}

it('blanks an inherited token when the hop is cross-origin', () => {
  const request = runWithInherited('https://cdn.example.com/redirected.svg');

  assert.strictEqual(request.sentHeaders[CREDENTIAL_HEADER], '');
});

it('always sends explicit headers on an untrusted hop, never a bare continue', () => {
  // A bare continue() forwards whatever the hop inherited, so the override
  // object is not optional here.
  const request = runWithInherited('https://cdn.example.com/redirected.svg');

  assert.notStrictEqual(request.calls[0], null);
  assert.ok(request.sentHeaders, 'no headers were supplied to continue()');
});

it('re-authenticates an inherited token when the hop is still the API', () => {
  const request = runWithInherited('https://api.fliplet.test/v1/user');

  assert.strictEqual(request.sentHeaders[CREDENTIAL_HEADER], TOKEN);
});

it('strips a differently-cased inherited header rather than duplicating it', () => {
  // Chromium lower-cases, but a mixed-case key must never survive alongside
  // the canonical one or the wrong value can win.
  const request = stubRequest('https://cdn.example.com/x.png', { 'Auth-Token': TOKEN });

  authenticateApiRequests(TOKEN, API_URL)(request);

  const keys = Object.keys(request.sentHeaders).filter(
    (k) => k.toLowerCase() === CREDENTIAL_HEADER
  );

  assert.strictEqual(keys.length, 1);
  assert.strictEqual(request.sentHeaders[keys[0]], '');
});

it('withoutCredential drops every casing and blanks the canonical key', () => {
  const cleaned = withoutCredential({ 'Auth-Token': 'a', 'auth-token': 'b', accept: 'text/html' });

  assert.strictEqual(cleaned.accept, 'text/html');
  assert.strictEqual(cleaned[CREDENTIAL_HEADER], '');
  assert.strictEqual(Object.keys(cleaned).filter((k) => k.toLowerCase() === CREDENTIAL_HEADER).length, 1);
});

it('withoutCredential tolerates missing headers', () => {
  assert.strictEqual(withoutCredential(undefined)[CREDENTIAL_HEADER], '');
  assert.strictEqual(withoutCredential(null)[CREDENTIAL_HEADER], '');
});

console.log('');
console.log(passed + ' passing, ' + failed + ' failing');

if (failed) {
  process.exit(1);
}
