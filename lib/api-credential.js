/**
 * DEV-1231: deciding which of a browser page's requests may carry the
 * developer's account token.
 *
 * `fliplet test` renders a widget preview in Puppeteer. The page used to be
 * opened with the token on the query string; sending it as a header instead
 * means attaching it per request, because a navigation cannot carry headers of
 * its own.
 *
 * The obvious way to do that — `page.setExtraHTTPHeaders()` — attaches the
 * header to EVERY request the page makes. A widget preview routinely loads
 * cross-origin images, fonts, scripts and iframes, so that hands the
 * developer's reusable account token to every third-party server involved:
 * worse than the query string it replaced, because the query string at least
 * only reached the API. Hence an explicit origin check per request.
 *
 * This lives in its own module so it can be tested without starting the
 * runner (fliplet-test.js calls runner() on require) or a real browser.
 */

/**
 * Whether a request URL is for the given API base, and may therefore be given
 * the account token.
 *
 * Compares the full origin — scheme, host AND port — so a lookalike host
 * (`api.fliplet.test.example.com`), a different port, or a plain-HTTP
 * downgrade of an HTTPS API all fail to match.
 *
 * Anything unparseable or origin-less (`data:`, `blob:`, `about:blank`) is not
 * the API, so it never receives the credential.
 */
function isApiOrigin(requestUrl, apiUrl) {
  let request;
  let api;

  try {
    request = new URL(requestUrl);
    api = new URL(apiUrl);
  } catch (err) {
    return false;
  }

  // Only real network schemes can carry a request header anywhere, and the
  // scheme has to be checked separately from the origin: `new URL()` reports
  // the INNER origin for a blob: URL, so `blob:https://api.host/uuid` compares
  // equal to the API's origin while being a purely in-memory object.
  if (request.protocol !== 'http:' && request.protocol !== 'https:') {
    return false;
  }

  // `null` is what the URL parser reports for an opaque origin, and two opaque
  // origins are not the same origin — so never let them compare equal.
  if (!request.origin || request.origin === 'null') {
    return false;
  }

  return request.origin === api.origin;
}

/**
 * Build the Puppeteer `request` handler used with setRequestInterception(true).
 *
 * Every intercepted request MUST be continued or aborted exactly once or the
 * page hangs, so both branches call continue(). Interception fires once per
 * redirect hop, which is what makes a redirect off the API origin drop the
 * header rather than following it to the new host.
 */
function authenticateApiRequests(authToken, apiUrl) {
  return function onRequest(request) {
    if (!isApiOrigin(request.url(), apiUrl)) {
      return request.continue();
    }

    return request.continue({
      headers: Object.assign({}, request.headers(), { 'Auth-token': authToken })
    });
  };
}

module.exports = { isApiOrigin, authenticateApiRequests };
