---
description: V3 app analytics and event tracking. Page views are tracked automatically by the fliplet-analytics-spa runtime; this doc covers what you get for free and when to add event() calls for intent-bearing user actions.
---

# V3 app analytics and event tracking

V3 apps get page-view tracking, session tracking, and device tracking for free — you don't need to wire any of it up. What you **do** need to add are `Fliplet.App.Analytics.event(...)` calls for meaningful user interactions that can't be inferred from a route change: form submissions, CTA clicks, flow completions, error acknowledgments.

This doc tells you what's automatic, what to add, and how to keep event taxonomy clean enough that the analytics dashboards stay readable at scale.

## Contents

- [What you get for free](#what-you-get-for-free)
- [What to add — custom events](#what-to-add--custom-events)
- [Taxonomy — category, action, label](#taxonomy--category-action-label)
- [Worked examples](#worked-examples)
- [What **not** to track](#what-not-to-track)
- [Related](#related)

## What you get for free

The `fliplet-analytics-spa` runtime library is preloaded on every V3 app and fires a `pageView` on every client-side route change. No code from the app is required.

What it covers:

- **Initial page load** — one `pageView` when `Fliplet.ready()` resolves.
- **Client-side navigation** — one `pageView` on every `history.pushState` / `history.replaceState` (from any framework), plus `popstate` (back/forward) and `hashchange`. Consecutive navigations to the same URL are de-duped.
- **Sessions** — the core analytics session (rotates every 30 minutes, per user) is managed by `fliplet-core`.
- **Device / platform context** — `_platform`, `_os`, `_userEmail`, `_analyticsSessionId`, `_pageId`, `_pageTitle` are added to every event by the core tracker.

Each auto `pageView` payload includes:

| Field | Example | Notes |
| --- | --- | --- |
| `_pageTitle` | `/orders/:id` | Matched route pattern from the V3 manifest; falls back to raw path if no pattern matches. |
| `_route` | `/orders/:id` | Same as `_pageTitle`, reserved for future payload enrichment. |
| `_routeRaw` | `/orders/123?ref=email#top` | Actual URL including query and hash. |
| `_routeParams` | `{ id: "123" }` | Params extracted from the pattern. |
| `_routeName` | `"Order"` | `name` from the manifest route entry (if set). |

Because page views are automatic, **do not call `Fliplet.App.Analytics.pageView(...)` yourself** from V3 app code. You'll double-count and pollute the pattern-matching.

## What to add — custom events

Use `Fliplet.App.Analytics.event(...)` for user-intent signals that can't be inferred from the URL. A rule of thumb: if a product manager would ask "how many people did X", X is probably an event.

```js
Fliplet.App.Analytics.event({
  category: 'contact-form',
  action: 'submit',
  label: 'support-request'
});
```

Good candidates:

- Form submissions (with the form's name as `label`).
- Primary CTAs — "Sign up", "Request demo", "Add to cart".
- Flow completions — e.g. the user reaches the "thank you" step of a checkout.
- Error acknowledgments — the user clicks "retry" or dismisses an error toast.
- Feature toggles — user opens a filter panel, switches tabs into a rarely-used view.

Poor candidates (skip these):

- Scroll position, hover, focus / blur — too noisy, high cardinality, rarely answer a business question.
- Anything tied to route changes — page views cover this.
- Keystrokes or character-by-character input — always noise.

## Taxonomy — category, action, label

Events are aggregated in the dashboards by these three fields. Keep them disciplined or the dashboards become unreadable.

- **`category`** — a stable, bounded namespace. Treat it like a table name. Examples: `'contact-form'`, `'onboarding'`, `'cart'`. Don't use free-form strings like `'Tracking user clicks on button 3'`.
- **`action`** — a verb describing what happened. Examples: `'submit'`, `'click'`, `'complete'`, `'dismiss'`, `'retry'`. Past-tense is fine (`'submitted'`), just be consistent.
- **`label`** — the specific instance, bounded. Examples: `'support-request'`, `'step-3'`, `'paywall'`. Never put PII here — no emails, phone numbers, names, user IDs, auth tokens, or free-form user input.

Cardinality rule: `category` × `action` × `label` should produce at most a few hundred unique combinations per app. If a value is effectively unbounded (e.g. per-user IDs), it does not belong in the analytics payload — query the data source instead.

## Worked examples

### Good — form submission on a contact form

```js
document.querySelector('#contact-form').addEventListener('submit', function() {
  Fliplet.App.Analytics.event({
    category: 'contact-form',
    action: 'submit',
    label: 'support-request'
  });
});
```

### Good — checkout flow completion

```js
function onOrderConfirmed(order) {
  Fliplet.App.Analytics.event({
    category: 'checkout',
    action: 'complete',
    label: order.plan // 'starter' | 'pro' | 'enterprise' — bounded set
  });
}
```

### Good — user dismisses an error toast

```js
toast.on('dismiss', function() {
  Fliplet.App.Analytics.event({
    category: 'error',
    action: 'dismiss',
    label: toast.code // 'network', 'validation', 'unauthorized' — bounded
  });
});
```

### Bad — duplicating automatic page views

```js
// DO NOT do this. Page views are auto-tracked.
router.afterEach(function(to) {
  Fliplet.App.Analytics.pageView({ _pageTitle: to.path });
});
```

### Bad — unbounded label containing PII

```js
// DO NOT do this. email is PII and has unbounded cardinality.
Fliplet.App.Analytics.event({
  category: 'login',
  action: 'submit',
  label: user.email
});
```

### Bad — every scroll

```js
// DO NOT do this. Scroll noise drowns out real signals.
window.addEventListener('scroll', function() {
  Fliplet.App.Analytics.event({ category: 'scroll', action: 'move' });
});
```

## What **not** to track

- **PII** — never put emails, phone numbers, names, address fragments, auth tokens, or session IDs into `label` or any custom field you pass to `event(...)`. Core adds `_userEmail` automatically if the user is logged in; that's the sanctioned channel.
- **Secrets** — same as PII: no auth tokens, no API keys, no one-time codes.
- **High-cardinality identifiers** — per-record IDs, UUIDs, free-text user input. Aggregate these in data sources; they don't belong in analytics.
- **Anything already on the URL** — auto page views already capture the route pattern and params. Don't add events that duplicate that information.

## Related

- [V3 routing](routing.md) — the route manifest that powers auto page-view pattern matching.
- [Core analytics API](../core/analytics.md) — full reference for `Fliplet.App.Analytics`, including `track`, `get`, and `count`.
