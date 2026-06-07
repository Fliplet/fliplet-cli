---
title: "V3 React apps"
description: Constraints for building V3 apps in React. Covers the JSX transpilation problem (the #1 cause of first-deploy failures) with three alternatives, React Router 6 createHashRouter wiring (no basename — native- and preview-iframe-safe), and the no-build-step limits on CSS modules and TSX.
type: guide
tags: [js-api, v3, framework, react]
v3_relevant: true
deprecated: false

---

# V3 React apps

React works in V3, but it needs more thought than Vue because **JSX cannot run without a transpiler**. The browser will throw `SyntaxError: Unexpected token '<'` the first time it sees JSX in an uploaded source file. The V3 runtime does not transpile.

## Loading the framework

Add `react` and `react-dom` via `add_dependencies` with `lazy: true`, then:

```js
await Fliplet.require.lazy('react');
await Fliplet.require.lazy('react-dom');
const React = window.React;
const ReactDOM = window.ReactDOM;
```

`Fliplet.require.lazy(name)` resolves once the UMD bundle has executed; the module itself lands on `window` (`window.React`, `window.ReactDOM`, `window.htm`, `window.ReactRouterDOM`). Read it off `window` after the `await` — assigning the awaited value directly gives you the URL string, not the module.

For routing, `react-router-dom`'s UMD bundle is not self-contained — it delegates its named exports (`Navigate`, `Outlet`, `useNavigate`, `useLocation`, `Link`, `createHashRouter`, …) to two peer packages that must be loaded first as globals:

```js
await Fliplet.require.lazy('@remix-run/router');  // sets window.RemixRouter
await Fliplet.require.lazy('react-router');       // sets window.ReactRouter, needs RemixRouter
await Fliplet.require.lazy('react-router-dom');   // sets window.ReactRouterDOM, needs the two above
const ReactRouterDOM = window.ReactRouterDOM;
```

Add all three via `add_dependencies` with `lazy: true` and match the minor versions across them (e.g. `react-router-dom@6.26.x` + `react-router@6.26.x` + `@remix-run/router@1.19.x`). Skipping `react-router` or `@remix-run/router` leaves `ReactRouterDOM.Navigate` etc. as throwing getters that fail at first render.

Adding them via `add_dependencies` is not enough — listing a package as a lazy dep only registers the URL. The boot script must also `await Fliplet.require.lazy(name)` on all three (in the order above) before accessing any `ReactRouterDOM.*` export, or you'll hit `ReactRouterDOM.createHashRouter is not a function`.

## Features that need a build step

The big one:

### JSX

JSX is not valid JavaScript. Three ways to write React in V3 without a transpiler:

| Option | Cost | When to use |
|---|---|---|
| **`htm` tagged templates** | ~1KB | **Recommended.** Looks nearly identical to JSX; runs in the browser. Load via `Fliplet.require.lazy('htm')`. |
| `React.createElement` | 0 | Verbose but dependency-free. Fine for small apps or one-off components. |
| `@babel/standalone` | ~2MB, slow first boot | Only if the user explicitly insists on raw JSX. Add via `add_dependencies` with the CDN URL and lazy-load. Adds 1–2 seconds to app boot. |

Prefer `htm` unless the user has a specific reason to override.

### Others

| Feature | Why it fails | Do this instead |
|---|---|---|
| `.tsx`, `.ts` | No TypeScript transpiler | Plain JavaScript |
| Bare ESM imports (`import React from 'react'`) | No bundler resolves the specifier | `Fliplet.require.lazy('react')` |
| CSS Modules (`styles.module.css`) | No bundler to process them | Inline `<style>` or a plain `.css` uploaded as a media file |
| `import './styles.css'` | Same | Upload the CSS as a media file and inject a `<link>` with the authenticated URL |

## Wiring to Fliplet.Router

Full contract in [V3 routing](../routing). React-specific: use `createHashRouter` (no basename) on every platform:

```js
const router = ReactRouterDOM.createHashRouter(routes);   // no basename
```

`createHashRouter` is the V3 standard for React because it sidesteps two problems at once: `createBrowserRouter` renders blank in the V3 preview iframe (the initial URL has no path after the basename), and on native it throws a `file:` `SecurityError` (`file://` blocks `pushState` path changes). Hash mode only ever touches the fragment, so the same router works on web and native with no platform branch — unlike Vue and vanilla, which must branch on `Fliplet.Router.isNative()`. The boot-HTML lint flags both `createBrowserRouter` (`react-browser-router`) and the `<HashRouter>` component (`hash-router-react`); use the `createHashRouter` data-router form. Build routes from `Fliplet.Router.getRouteManifest()`; route loaders should call `Fliplet.Router.resolveRoute(path)`.

## Binding Fliplet.Media.authenticate

Authenticated URLs are async. Resolve them in `useEffect` and store in state:

```js
const [logoSrc, setLogoSrc] = useState('');
useEffect(() => {
  Fliplet.Media.authenticate(rawUrl).then(setLogoSrc);
}, [rawUrl]);
```

Then `<img src={logoSrc} />`. Calling `Fliplet.Media.authenticate` at module scope gives you a Promise, not a URL — the `src` will render empty.

## Common errors

| Symptom in `get_preview_logs('errors')` | Cause | Fix |
|---|---|---|
| `SyntaxError: Unexpected token '<'` | Raw JSX in an uploaded source file | Switch to `htm` tagged templates or `React.createElement` |
| `Cannot use import statement outside a module` | Bare ESM `import` | Use `Fliplet.require.lazy` |
| `ReferenceError: React is not defined` inside a component | Component file ran before `react` resolved | Load dependencies in the boot HTML and pass React into component factories, or use `Fliplet.require.lazy` inside the component |
| `TypeError: useEffect is not a function` | React and react-dom versions mismatched | Pin matching versions in `add_dependencies` |
| `TypeError: React.createElement is not a function` / `htm.bind is not a function` | Assigned the `await` result to `React`/`htm` directly — that value is the URL string | `await Fliplet.require.lazy('react'); const React = window.React;` (same for `htm`, `ReactDOM`, `ReactRouterDOM`) |
| `Cannot read properties of undefined (reading 'Navigate'\|'Outlet'\|'useNavigate'\|…)` thrown from inside `react-router-dom.*.min.js` | `react-router-dom` UMD loaded without its peer UMDs — named exports are getters that forward to `window.ReactRouter` / `window.RemixRouter` | Also load `@remix-run/router` and `react-router` (matching minor version) before `react-router-dom`. See [Loading the framework](#loading-the-framework). |

## DO / DON'T

- DO use `htm` tagged templates as the default JSX alternative.
- DO use `ReactRouterDOM.createHashRouter(routes)` (no basename) — it works in the preview iframe and on native unchanged.
- DO resolve `Fliplet.Media.authenticate` inside `useEffect` and store in state.
- DON'T ship raw JSX — it will always throw on first deploy.
- DON'T use `createBrowserRouter` or the `<HashRouter>` component — both are rejected by lint; use the `createHashRouter` data-router form.
- DON'T use `.tsx` or TypeScript — no transpiler available.
- DON'T use CSS Modules or `import './styles.css'` — no bundler.
- DON'T render with `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `element.append(htmlString)` inside screen files. If you wrote `el.innerHTML = ...` in a component, you wrote a templating engine — not React — and you introduced an XSS surface on every future edit.
- DON'T write a manual `escapeHtml()` helper. Needing one means you're using `innerHTML` somewhere — fix that instead. React and `htm` escape interpolated values by default.
- DON'T `if`-chain or `switch` on `location.pathname` to decide what to render, even with `react-router-dom` installed. That's what the router you just installed is for. (The boot-HTML lint flags this via `ruleId: path-dispatcher`.)
- DON'T use raw `<a href="/path">` for in-app navigation — it triggers a full page reload and defeats the SPA. Use `<Link>` or `useNavigate()` from `react-router-dom`.
- DON'T reach into screens from the boot file via `document.getElementById` / `querySelector`. Each screen owns its own state, fetches, and handlers; the boot owns routing and framework bootstrap only. If you're wiring screens from the outside, you've inverted the component model.

## Related

- [V3 app bootstrap](../app-bootstrap)
- [V3 routing](../routing)
- [V3 framework overview](overview)
