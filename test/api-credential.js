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
const { isApiOrigin, authenticateApiRequests } = require('../lib/api-credential');

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

      return sent['Auth-token'];
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
  // No header overrides at all, so nothing can leak by accident.
  assert.strictEqual(request.calls[0], null);
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
  assert.strictEqual(request.sentHeaders['Auth-token'], TOKEN);
});

it('never puts the token on the query string', () => {
  const request = run('https://api.fliplet.test/v1/user');

  assert.strictEqual(request.url().indexOf('auth_token'), -1);
  assert.strictEqual(request.url().indexOf(TOKEN), -1);
});

console.log('');
console.log(passed + ' passing, ' + failed + ' failing');

if (failed) {
  process.exit(1);
}
