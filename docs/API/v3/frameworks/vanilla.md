---
description: Constraints for building V3 apps in vanilla JavaScript. The simplest baseline — no framework deps to load, no transpile traps. Covers History API routing under Fliplet.Router.getBasePath and media asset binding timing.
---

# V3 vanilla-JS apps

Vanilla JS is the lowest-friction V3 target because there is no framework to load and no syntax the browser can't parse. Most of the work is just respecting the V3 bootstrap contract and the routing lint.

## Loading the framework

Nothing to load. Still call `Fliplet().then(...)` before touching Fliplet APIs — the runtime needs to finish registering globals.

## Features that need a build step

Vanilla JS is the cheapest option precisely because nothing here needs a build step. Two things to still be careful of:

- **No bare ESM imports across source files.** `import { helper } from './helpers'` fails because there is no bundler to resolve the specifier. Load shared code either as a single uploaded source file evaluated via `Fliplet.Media.getContents`, or as a registered dependency via `Fliplet.require.lazy`.
- **Top-level `await` across files** won't work for the same reason — no module graph.

Modern browser syntax (optional chaining, nullish coalescing, destructuring, async/await inside functions) is fine. The target is a current Chromium.

## Wiring to Fliplet.Router

Use the History API directly. The navigation call is:

```js
history.pushState({}, '', Fliplet.Router.getBasePath() + path);
window.dispatchEvent(new PopStateEvent('popstate'));
```

Read the current route by stripping `Fliplet.Router.getBasePath()` from `location.pathname`. Route resolution (access check + screen-source fetch) goes through `Fliplet.Router.resolveRoute(path)` — see [V3 routing](../routing.md).

## Binding Fliplet.Media.authenticate

Authenticated URLs resolve asynchronously. Compute the URL, then assign it to the DOM element:

```js
const url = await Fliplet.Media.authenticate(rawUrl);
imgEl.src = url;
```

Don't compute the URL at module load and hope it's ready — the element will have `src=""` (or the unauthenticated URL) for long enough to render broken.

## Common errors

| Symptom in `get_preview_logs('errors')` | Cause | Fix |
|---|---|---|
| `ReferenceError: Fliplet is not defined` | Code ran before `Fliplet().then(...)` resolved | Move initialization inside the `Fliplet().then(...)` callback |
| `SyntaxError: Cannot use import statement outside a module` | ESM `import` in an uploaded source file | Load the dependency via `Fliplet.require.lazy` or inline the helper |
| Image/font renders broken then disappears | Raw media URL used without `Fliplet.Media.authenticate` | Wrap the URL and assign after the promise resolves |

## DO / DON'T

- DO navigate with `history.pushState(state, '', Fliplet.Router.getBasePath() + path)`.
- DO dispatch `popstate` after `pushState` so listeners re-render.
- DON'T read or write `window.location.hash` — rejected by the routing lint.
- DON'T use `href="#/..."` for internal links — rejected by the routing lint.
- DON'T `import` across uploaded source files — resolve shared code via `Fliplet.require.lazy` or a single boot file.

## Related

- [V3 app bootstrap](../app-bootstrap.md)
- [V3 routing](../routing.md)
- [V3 framework overview](overview.md)
