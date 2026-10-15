/**
 * DEV-1231/DEV-2276: browser-boundary regression test for the account-token
 * transport in `fliplet test`.
 *
 * WHY THIS EXISTS AND test/api-credential.js IS NOT ENOUGH
 * The unit tests drive the handler with a stub request. A stub builds each
 * request fresh, so it cannot reproduce the thing that actually leaked: on a
 * REDIRECT, Chromium hands the next hop the headers of the previous one, so a
 * request to another origin arrives already carrying the `Auth-token` that was
 * added for the API hop. `request.continue()` with no overrides then forwards
 * it, and — the part no stub would ever show — omitting the header from a
 * replacement object does NOT remove an inherited one either. It has to be
 * sent empty.
 *
 * So this runs the real thing: the repository's own Puppeteer and Chromium, two
 * HTTP origins on different ports, and assertions on what the DESTINATION
 * server actually received. Nothing is mocked at the boundary under test.
 *
 * Run with: npm run test:browser  (or npm test, which runs both files)
 */

const assert = require('assert');
const http = require('http');
const puppeteer = require('puppeteer');

const { authenticateApiRequests, CREDENTIAL_HEADER } = require('../lib/api-credential');

const TOKEN = 'eu--browser-regression-token';

let passed = 0;
let failed = 0;

function check(description, fn) {
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

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function run() {
  // Records every request it receives so the test can assert on headers the
  // destination genuinely saw, rather than on what we believe we sent.
  const external = { requests: [] };
  const externalServer = http.createServer((req, res) => {
    external.requests.push({ url: req.url, headers: req.headers });
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
  });

  const api = { requests: [] };
  let externalPort;
  const apiServer = http.createServer((req, res) => {
    api.requests.push({ url: req.url, headers: req.headers });

    const externalOrigin = `http://127.0.0.1:${externalPort}`;

    // A page that pulls in a cross-origin subresource directly.
    if (req.url.startsWith('/page-direct')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      return res.end(`<html><body><img src="${externalOrigin}/direct.svg"></body></html>`);
    }

    // A page whose subresource is an API-origin URL that redirects away.
    if (req.url.startsWith('/page-redirect')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      return res.end('<html><body><img src="/redirect-image"></body></html>');
    }

    // The API-origin hop that bounces to another host. This is the leak path:
    // the request to /redirect-image is authenticated, and the hop it
    // redirects to inherits that request's headers.
    if (req.url.startsWith('/redirect-image')) {
      res.writeHead(302, { Location: `${externalOrigin}/redirected.svg` });

      return res.end();
    }

    // A top-level navigation that redirects off the API origin.
    if (req.url.startsWith('/nav-redirect')) {
      res.writeHead(302, { Location: `${externalOrigin}/redirected-nav.html` });

      return res.end();
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body>ok</body></html>');
  });

  externalPort = await listen(externalServer);
  const apiPort = await listen(apiServer);
  const apiUrl = `http://127.0.0.1:${apiPort}/`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  async function visit(path) {
    external.requests.length = 0;
    api.requests.length = 0;

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', authenticateApiRequests(TOKEN, apiUrl));

    try {
      await page.goto(`${apiUrl.replace(/\/$/, '')}${path}`, { waitUntil: 'networkidle0', timeout: 15000 });
    } catch (err) {
      // A navigation that ends on another origin can still settle; the
      // assertions below read the servers' records either way.
    }

    await page.close();
  }

  function credentialsSeenBy(record) {
    return record.requests
      .map((r) => r.headers[CREDENTIAL_HEADER])
      .filter((value) => !!value);
  }

  try {
    console.log('fliplet test credential transport — real Chromium');

    // --- 1. the API hop itself must still authenticate
    await visit('/page-direct');
    check('the API-origin page request carries the token', () => {
      assert.ok(
        api.requests.some((r) => r.headers[CREDENTIAL_HEADER] === TOKEN),
        'no API request carried the token; headers seen: '
          + JSON.stringify(api.requests.map((r) => r.headers[CREDENTIAL_HEADER]))
      );
    });

    // --- 2. a direct cross-origin subresource (fixed in the first pass)
    check('a direct cross-origin image receives NO token', () => {
      assert.ok(external.requests.length > 0, 'the external server was never called');
      assert.deepStrictEqual(credentialsSeenBy(external), []);
    });

    // --- 3. THE REGRESSION: an API-origin subresource that 302s off-origin
    await visit('/page-redirect');
    check('the redirected subresource reached the external origin', () => {
      assert.ok(
        external.requests.some((r) => r.url === '/redirected.svg'),
        'the redirect never arrived; external saw: ' + JSON.stringify(external.requests.map((r) => r.url))
      );
    });
    check('a subresource redirected off-origin receives NO token', () => {
      assert.deepStrictEqual(
        credentialsSeenBy(external),
        [],
        'external server received the account token on a redirect hop'
      );
    });

    // --- 4. THE REGRESSION: a top-level navigation that 302s off-origin
    await visit('/nav-redirect');
    check('the redirected navigation reached the external origin', () => {
      assert.ok(
        external.requests.some((r) => r.url === '/redirected-nav.html'),
        'the navigation redirect never arrived'
      );
    });
    check('a navigation redirected off-origin receives NO token', () => {
      assert.deepStrictEqual(
        credentialsSeenBy(external),
        [],
        'external server received the account token on a navigation redirect'
      );
    });

    // --- 5. the blanked header must not masquerade as a credential
    check('the external request saw either no header or an empty one', () => {
      external.requests.forEach((r) => {
        const value = r.headers[CREDENTIAL_HEADER];

        assert.ok(
          value === undefined || value === '',
          'unexpected credential header value: ' + JSON.stringify(value)
        );
      });
    });
  } finally {
    await browser.close();
    await close(apiServer);
    await close(externalServer);
  }

  console.log('');
  console.log(passed + ' passing, ' + failed + ' failing');

  if (failed) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
