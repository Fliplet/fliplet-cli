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

// Chromium reports request headers lower-cased, so every comparison and every
// override has to use this spelling or two variants of the same header end up
// in the object and the wrong one wins.
const CREDENTIAL_HEADER = 'auth-token';

/**
 * Copy `headers`, dropping any casing of the credential header.
 *
 * The blank value is deliberate and is the whole fix for the redirect case.
 * Chromium KEEPS a header it inherited from the previous hop when the
 * replacement object merely omits it — leaving it out is not the same as
 * removing it — so the only reliable way to stop it being sent is to send it
 * empty.
 */
function withoutCredential(headers) {
  const sanitised = {};

  Object.keys(headers || {}).forEach(function(key) {
    if (key.toLowerCase() !== CREDENTIAL_HEADER) {
      sanitised[key] = headers[key];
    }
  });

  sanitised[CREDENTIAL_HEADER] = '';

  return sanitised;
}

/**
 * Build the Puppeteer `request` handler used with setRequestInterception(true).
 *
 * Every intercepted request MUST be continued or aborted exactly once or the
 * page hangs, so both branches call continue().
 *
 * THE REDIRECT CASE, WHICH IS WHY THE UNTRUSTED BRANCH IS NOT A BARE continue()
 * Interception fires once per redirect hop, and a redirected request INHERITS
 * the headers of the hop before it. So after the API-origin request has been
 * given the credential, a 302 pointing at another host arrives here already
 * carrying it; `request.continue()` with no overrides would hand the
 * developer's account token to that host — the original leak, reached by one
 * more step. The header is therefore blanked explicitly on every hop this
 * handler does not trust.
 */
function authenticateApiRequests(authToken, apiUrl) {
  return function onRequest(request) {
    const headers = withoutCredential(request.headers());

    if (!isApiOrigin(request.url(), apiUrl)) {
      return request.continue({ headers });
    }

    headers[CREDENTIAL_HEADER] = authToken;

    return request.continue({ headers });
  };
}

module.exports = {
  isApiOrigin,
  authenticateApiRequests,
  withoutCredential,
  CREDENTIAL_HEADER
};
