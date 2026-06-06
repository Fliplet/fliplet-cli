---
title: "V3 JS API coverage decisions"
description: "Per-package V3-relevance decisions from the May 2026 capabilities audit. The committed record of what we chose to document, what we excluded, and why."
type: reference
tags: [v3, coverage, audit, meta]
v3_relevant: true
deprecated: false
---

# V3 JS API coverage decisions

This is the committed record of the May 2026 capabilities audit. It captures one decision per public surface across every `fliplet-*` package and every namespace registered on the global `Fliplet` object: should it be documented for V3 apps, or explicitly excluded?

**Why this exists.** The audit walked all 46 `fliplet-*` packages and read all ~105 JS source files to surface every public namespace. We found 80 distinct surfaces — many that the catalog didn't enumerate, including substantial sub-namespaces under documented parents and several whole packages that had no doc at all. Without committing the decision per row, the same review work would happen again in six months when somebody asks "is X documented?"

**How to use this doc.** When a new surface appears in source, add a row. When you change your mind about a decision (e.g. promote something from "excluded" to "to be documented"), update it here AND open the doc. When you're tempted to leave something out of the catalog, see whether it already has a row — if so, use the existing rationale.

## Cross-repo drift — explicitly accepted

This audit is a one-shot review. There is **no automated mechanism** that catches a new `fliplet-*` package landing in the `Fliplet/api` repo. The plan considered building one (cross-repo CI hook in `fliplet/api` requiring a classification line on every new-package PR) and rejected it as over-investment given Fliplet's package-add cadence (1-2 per year). The trade-off is documented here so the next maintainer sees this was a deliberate choice, not an oversight: when `fliplet/api` adds a new package, expect this audit's coverage to drop until somebody re-runs the inventory.

If the cadence changes and the gap reopens visibly, the right response is to add the cross-repo hook — not to re-run the manual audit indefinitely.

## Audit method (lessons captured)

Three correction rounds informed the final list:

1. **Suspected-gaps-only audits miss surfaces.** First pass listed 9 "ambient surfaces with uneven coverage" from prior-conversation memory; missed 8 more (`Fliplet.User.Preferences`, `Fliplet.Navigate.Apps`, `Fliplet.Functions`, `Fliplet.App.PushNotifications/Analytics/Subscriptions/Settings/Orientation`). Forward-walk the source with grep first.
2. **fliplet-core isn't the only package that registers ambient surfaces.** Second pass walked `fliplet-core/1.0/core.js` only; missed `fliplet-auth` (whole package, 6 methods), `fliplet-auth-loader`, `Fliplet.UI.MapField`, `Fliplet.Communicate.AES`, `Fliplet.Media.PrivateFiles`, and confirmed `fliplet-runtime` registers Env/Registry/Studio/Navigator into ambient. Every `fliplet-*` package needs a grep.
3. **Greps miss non-`Fliplet.*` patterns.** Third pass added `window.X` and nested directories; surfaced `window.Overlay` (in `fliplet-pages/1.0/overlay/overlay.js`), `Fliplet.Organizations.{Logs,Analytics,Settings,switch}`, `Fliplet.Analytics.Aggregate`, `Fliplet.Media.{Folders,Files,Files.Storage}`, `Fliplet.DataSources.Database`, `Fliplet.Themes.Current`, V3-interact `ComponentNode`/`ViewContainer`/drag-handlers registry, top-level helpers (`Fliplet.parseHelperString`, `Fliplet.parseNumber`, `Fliplet.extend`, `Fliplet.require/lazy`, `Fliplet.initializeLocale`).

A repeat of this audit should walk every JS file in every `fliplet-*` package, including nested subdirectories, and look for `Fliplet.X = `, `Fliplet.X.Y = `, and `window.X = ` patterns. The systematic walk took ~30 minutes via 7 parallel subagents.

## Decision tables

Decision tallies: 30 "yes (V3-relevant)" + 1 "yes (per surfaces)" + 3 "partial" + 42 "excluded" + 4 "Studio-only" = **80 rows**.

### Documented or to be documented (V3-relevant) — 30 entries

These are the user-facing JS surfaces V3 apps can call. Some already have docs; others need new docs or expansions of existing ones.

| # | Package / Namespace | Type | Source | Current doc? |
|---|---|---|---|---|
| 4 | `fliplet-router` | installable | `fliplet-router/1.0/` | ✓ API/v3/fliplet-router.md (not yet in V3 catalog because of path) |
| 5 | `fliplet-runtime` | installable | `fliplet-runtime/1.0/` | needs doc |
| 6 | `fliplet-service-worker` | installable | `fliplet-service-worker/1.0/` | needs doc |
| 7 | `fliplet-analytics-spa` | installable | `fliplet-analytics-spa/1.0/` | partial — API/v3/analytics.md (guide, covers Fliplet.App.Analytics surface but not the runtime) |
| 8 | `fliplet-error-tracking` | installable | `fliplet-error-tracking/1.0/` | needs doc |
| 17 | `Fliplet.Native.AppManagement` | sub-namespace of fliplet-native | `native/js/app-management.js` (active) | needs doc |
| 19 | `Fliplet.Native.Interaction` | sub-namespace of fliplet-native | `native/js/app-interaction.js` (dormant 2022) | needs doc — note: namespace is `.Interaction`, not `.AppInteraction` |
| 20 | `Fliplet.Native.Updates` | sub-namespace of fliplet-native | `native/js/app-updates.js` (active) | needs doc |
| 23 | `Fliplet.Native.Downloads` | sub-namespace of fliplet-native | `native/js/downloads.js` (active) | needs doc |
| 24 | `Fliplet.Native.Locale` | sub-namespace of fliplet-native | `native/js/locale.js` (dormant 2022) | needs doc |
| 25 | `Fliplet.Native.Maintenance` | sub-namespace of fliplet-native | `native/js/maintenance.js` (active) | needs doc |
| 27 | `Fliplet.Native.Notifications` | sub-namespace of fliplet-native | `native/js/notifications.js` (active) — note: click-handler, NOT push sender | needs doc |
| 28 | `Fliplet.Native.StatusBar` | sub-namespace of fliplet-native | `native/js/status-bar.js` (became active 2026-06-01) | needs doc |
| 34 | `Fliplet.App.Locales` | ambient sub-namespace | `core.js:4996` | partial — example use in core/app.md + fliplet-session.md, no standalone ref |
| 37 | `Fliplet.App.Releases` | ambient sub-namespace | `core.js:5656` | needs doc |
| 38 | `Fliplet.App.Logs` | ambient sub-namespace | `core.js:4932` | partial — example use in core/app.md, no standalone ref |
| 39 | `Fliplet.App.V3.Actions` | ambient sub-namespace | `core.js:4107` | ✓ API/core/app-actions-v3.md (titled "App Actions V3" — namespace path is hidden in catalog) |
| 44 | `Fliplet.App.Analytics` | ambient sub-namespace | `core.js:5064` | partial — used in API/v3/analytics.md, no standalone ref |
| 45 | `Fliplet.App.Subscriptions` | ambient sub-namespace | `core.js:5449` | needs doc — push-notification device subscriptions (NOT paid subs) |
| 46 | `Fliplet.App.Settings` | ambient sub-namespace | `core.js:5467` | partial — example in core/app.md + Custom-Headers.md, no standalone ref |
| 47 | `Fliplet.App.Orientation` | ambient sub-namespace | `core.js:5542` | partial — example in core/app.md, no standalone ref |
| 60 | `Fliplet.Organizations.Logs` | ambient sub-namespace | `core.js:3378` | needs doc — likely extend core/organizations.md |
| 61 | `Fliplet.Organizations.Analytics` | ambient sub-namespace | `core.js:3387` | needs doc — likely extend core/organizations.md |
| 64 | `Fliplet.Analytics.Aggregate` | ambient sub-namespace | `core.js:5406` | needs doc — likely extend core/analytics.md |
| 65 | `Fliplet.Media.Folders` | ambient sub-namespace | core / fliplet-media | partial — mentioned in code-api-patterns.md guide, not in fliplet-media.md API ref |
| 66 | `Fliplet.Media.Files` | ambient sub-namespace | core / fliplet-media | partial — same as above |
| 67 | `Fliplet.Media.Files.Storage` | ambient sub-namespace | fliplet-media + core | ✓ in API/fliplet-media.md |
| 68 | `Fliplet.DataSources.Database` | sub-namespace of fliplet-datasources | `fliplet-datasources/1.0/database.js:14` | needs doc — likely extend fliplet-datasources.md |
| 73 | `Fliplet.require` + `.require.lazy` | top-level Fliplet.* function | `fliplet-runtime/1.0/runtime.js:623, 692` | needs doc — likely new core/require.md or part of runtime doc |
| 74 | `Fliplet.initializeLocale` | top-level Fliplet.* function | `fliplet-runtime/1.0/runtime.js:177` | ✓ indirectly via core/localization.md (Fliplet.Locale namespace) |

### Effectively documented via the surfaces they register — 1 entry

| # | Package / Namespace | Resolution |
|---|---|---|
| 52 | `fliplet-runtime` | Already covered: registers `Fliplet.Env` → `core/environment.md`, `Fliplet.Registry` → `core/registry.md`, `Fliplet.Studio` → `core/studio.md`, `Fliplet.Navigator` → `core/navigator.md`. The package itself doesn't need its own doc; entry 5 above tracks any remaining runtime-specific gaps (`Fliplet.require`, `initializeLocale`). |

### Partial — needs scope review — 3 entries

| # | Package / Namespace | What "partial" means |
|---|---|---|
| 3 | `fliplet-native` (parent) | Handled by per-sub-module rows 17, 19, 20, 23-28. Some sub-modules are dormant since 2022 (`Native.Data`, `Native.Authentication`, `Native.Config`, `Native.Templates`); see Phase A scope review for delete-or-document decisions. |
| 15 | `fliplet-pages` (V1) | Whole package is V1-only deprecated, BUT some V1 surfaces (`window.Overlay`, `Fliplet.UI.Toast`, `Fliplet.UI.Actions`, `Fliplet.App.About`, `Fliplet.Page.Context`) are still callable in V3 contexts. User-decided NO on each individually (rows 54-58) — fliplet-pages stays excluded for V3. |
| 26 | `Fliplet.Native` (top-level) | Bootstrap module; covered as part of the consolidated `Fliplet.Native` doc once Phase A approves the grouping. |

### Excluded — not for V3 / handled elsewhere / out of scope — 42 entries

| # | Package / Namespace | Reason |
|---|---|---|
| 2 | `fliplet-chart` | V1 widget stub — 14-line Highcharts namespace registration, no JS API surface |
| 9 | `fliplet-like` | V1 like-button widget (`window.LikeButton`). `like-buttons.md` exists but outside V3 catalog path |
| 10 | `fliplet-icons` | CSS icon font only, no JS surface |
| 11 | `fliplet-utils` | Preloaded via `Fliplet.Utils` namespace; no standalone doc planned |
| 13 | `fliplet-studio-ui` | Studio-only UI shim, not for end-user apps |
| 14 | `fliplet-ravenjs` | Vendor Sentry/Raven proxy, auto-loaded |
| 16 | `fliplet-interact` | V1-only widget framework (jQuery-coupled) — superseded by V3 design system |
| 18 | `Fliplet.Native.Data` | Dormant since 2022 (per-widget-instance telemetry queue) — not for V3 |
| 21 | `Fliplet.Native.Authentication` | Dormant since 2022 (NativeStorage auth-token wrapper) — superseded by `Fliplet.User`/`fliplet-session` |
| 22 | `Fliplet.Native.Config` | Dormant since 2022 (2-key config storage) — internal native-runtime detail |
| 29 | `Fliplet.Native.Templates` | Dormant placeholder — Handlebars template strings, no methods |
| 30 | `Fliplet.Static` | Internal — static asset serving |
| 31 | `Fliplet.Domains` | Admin-level domain config (custom DNS, certs) — not app-author concern |
| 32 | `Fliplet.TagManager` | Internal GTM bridge |
| 33 | `Fliplet.App.Fonts` | Internal — font management used by Studio appearance system |
| 35 | `Fliplet.App.Hooks` | Internal lifecycle hooks |
| 36 | `Fliplet.App.Tasks` (alias of `App.Actions`) | V2 alias; V3 uses `Fliplet.App.V3.Actions` (entry 39) |
| 40 | `Fliplet.User.Preferences` | Internal — user preferences cache |
| 41 | `Fliplet.Navigate.Apps` | Internal — used by between-apps deep linking |
| 42 | `Fliplet.Functions` | Internal — V1/V2 App Actions function registry; V3 uses App Actions V3 |
| 43 | `Fliplet.App.PushNotifications` | Internal — pairs with `App.Subscriptions` (entry 45, which IS documented) |
| 48 | `fliplet-auth` | **Skipped for now** — documentation may follow alongside AI skills work; not in current scope |
| 49 | `Fliplet.Communicate.AES` | Internal AES helper — sub-namespace of fliplet-communicate |
| 50 | `Fliplet.Media.PrivateFiles` | Internal — private media file storage |
| 51 | `Fliplet.UI.MapField` | V1 widget |
| 53 | `fliplet-auth-loader` | Studio-only auth UI renderer |
| 54 | `window.Overlay` | V1 widget (fliplet-pages) |
| 55 | `Fliplet.UI.Toast` | V1 widget — V3 design system has its own toast |
| 56 | `Fliplet.UI.Actions` | V1 widget — action sheet |
| 57 | `Fliplet.App.About` | V1 widget |
| 58 | `Fliplet.Page.Context` | V1 sub-namespace |
| 59 | `Fliplet.Page.getAutocompletions` | V1 IDE helper |
| 62 | `Fliplet.Organizations.Settings` | Internal — peer of Logs/Analytics but not user-facing |
| 63 | `Fliplet.Organizations.switch` | Internal multi-org method |
| 69 | `Fliplet.Themes.Current` | Internal — read-only theme introspection |
| 70 | `Fliplet.OAuth2.configure / .use` | Experimental V2 OAuth2 auth-type — do not surface for V3 |
| 71 | `Fliplet.parseHelperString` | Internal — helper-template parser |
| 72 | `Fliplet.parseNumber` / `parseError` / common helpers | `parseError` is in core/error.md; rest are internal helpers |
| 78 | `Fliplet.Helper` (whole namespace) | Currently a redirect stub (`fliplet-helper.md` in `EXCLUDED_FILES`). Has substantive surface (12 static + ~10 instance methods) but covered by the components-framework docs rather than as a standalone API |
| 79 | `Fliplet.Utils` (whole namespace) | Preloaded utility namespace; no standalone doc planned |
| 80 | `fliplet-runtime` side effects | Not a public surface — load-time only |
| 81 | `fliplet-analytics-spa` side effects | Not a public surface — load-time only |

### Studio-only — relevant for V3 but not for app authors / AI — 4 entries

These exist in V3 but are part of how Studio itself works, not how apps should be coded by AI or developers.

| # | Package / Namespace | Source |
|---|---|---|
| 12 | `fliplet-studio-preview` | In-Studio preview iframe (log capture, postMessage handlers, live-update for appearance changes) |
| 75 | `fliplet-interact V3 drag-handlers registry` | Studio rich-editor drag/drop infrastructure |
| 76 | `ComponentNode` class (V3 interact) | Studio component-tree class |
| 77 | `ViewContainer` class (V3 interact) | Studio view-container class |

## Living spreadsheet

The source-of-truth spreadsheet used for the audit lives at:
`https://docs.google.com/spreadsheets/d/1IoYblMJfekfKRSYf8Q19ohu40jlN_vDpJyFyd7xD4u8/edit`

If a new surface needs a decision, add a row there first (with V3-relevance + rationale), then mirror it into this doc.
