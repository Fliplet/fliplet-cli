---
description: Constraints for building V3 apps in Alpine.js. Alpine is attribute-driven HTML with no build step, so it maps cleanly to the V3 runtime. Covers x-init timing relative to Fliplet().then and History API routing pairing.
---

# V3 Alpine.js apps

Alpine fits V3 well because it's attribute-driven HTML with no compile step. Components are just `<div x-data="{...}">` — the kind of markup V3 already evaluates natively. Best fit: form-heavy UIs, settings panels, and single-page CRUD where you'd otherwise reach for jQuery.

## Loading the framework

Add `alpinejs` via `add_dependencies`, then:

```js
const Alpine = await Fliplet.require.lazy('alpinejs');
Alpine.start();
```

**Call `Alpine.start()` inside your `Fliplet().then(...)` callback**, not at module load. Alpine scans the DOM and initializes `x-data` components when it starts — if it starts before the Fliplet runtime resolves, any `x-init` or `x-data` expression that calls `Fliplet.*` will error.

## Features that need a build step

None that Alpine itself requires. The generic V3 constraints still apply:

- No bare ESM `import` across uploaded source files — use `Fliplet.require.lazy` for external deps.
- No TypeScript.
- No CSS preprocessing.

## Wiring to Fliplet.Router

Alpine has no router. Pair it with History API routing the same way as vanilla JS:

```js
function goTo(path) {
  history.pushState({}, '', Fliplet.Router.getBasePath() + path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
```

Use `Fliplet.Router.checkRouteAccess(path)` in your `popstate` handler. See [V3 routing](../routing.md).

## Binding Fliplet.Media.authenticate

Compute the authenticated URL inside `x-init` or a method, then set a data property:

```html
<img x-data="{ src: '' }"
     x-init="Fliplet.Media.authenticate(rawUrl).then(u => src = u)"
     :src="src">
```

The `:src="src"` binding updates once the promise resolves. Do not try `:src="Fliplet.Media.authenticate(rawUrl)"` — that binds the Promise, not the URL.

## Common errors

| Symptom in `get_preview_logs('errors')` | Cause | Fix |
|---|---|---|
| `Alpine Expression Error: Fliplet is not defined` | `Alpine.start()` called before `Fliplet()` resolved | Move `Alpine.start()` inside `Fliplet().then(...)` |
| `<img>` renders with a Promise in `src` | Using `Fliplet.Media.authenticate(url)` directly in `:src` | Resolve into a state variable first (see above) |
| Components don't react | `Alpine.start()` called before the target markup was in the DOM | Ensure the screen source is inserted before Alpine starts, or use `Alpine.initTree(el)` on newly inserted markup |

## DO / DON'T

- DO call `Alpine.start()` inside `Fliplet().then(...)`.
- DO resolve authenticated URLs into a reactive `x-data` field before binding.
- DO pair Alpine with History API routing from `Fliplet.Router.getBasePath()`.
- DON'T bind a Promise directly into an attribute (`:src`, `:href`).
- DON'T use hash-based navigation — rejected by lint.

## Related

- [V3 app bootstrap](../app-bootstrap.md)
- [V3 routing](../routing.md)
- [V3 framework overview](overview.md)
