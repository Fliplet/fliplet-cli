---
description: Constraints for building V3 apps in React. Covers the JSX transpilation problem (the #1 cause of first-deploy failures) with three alternatives, React Router 6 basename wiring to Fliplet.Router.getBasePath, and the no-build-step limits on CSS modules and TSX.
---

# V3 React apps

React works in V3, but it needs more thought than Vue because **JSX cannot run without a transpiler**. The browser will throw `SyntaxError: Unexpected token '<'` the first time it sees JSX in an uploaded source file. The V3 runtime does not transpile.

## Loading the framework

Add `react` and `react-dom` via `add_dependencies`, then:

```js
const React = await Fliplet.require.lazy('react');
const ReactDOM = await Fliplet.require.lazy('react-dom');
```

For routing, add `react-router-dom` the same way.

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

Full contract in [V3 routing](../routing.md). React-specific: pass `basename` when creating the router:

```js
const router = createBrowserRouter(routes, {
  basename: Fliplet.Router.getBasePath()
});
```

`HashRouter` is rejected by the boot-HTML lint (rule `hash-router-react`). Build routes from `Fliplet.Router.getRouteManifest()`; route loaders should call `Fliplet.Router.checkRouteAccess(path)`.

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

## DO / DON'T

- DO use `htm` tagged templates as the default JSX alternative.
- DO pass `basename: Fliplet.Router.getBasePath()` to `createBrowserRouter`.
- DO resolve `Fliplet.Media.authenticate` inside `useEffect` and store in state.
- DON'T ship raw JSX — it will always throw on first deploy.
- DON'T use `HashRouter` — rejected by lint.
- DON'T use `.tsx` or TypeScript — no transpiler available.
- DON'T use CSS Modules or `import './styles.css'` — no bundler.

## Related

- [V3 app bootstrap](../app-bootstrap.md)
- [V3 routing](../routing.md)
- [V3 framework overview](overview.md)
