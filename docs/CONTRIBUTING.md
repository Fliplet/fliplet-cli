---
title: "Contributing to developer documentation"
description: "How to author docs in fliplet-cli/docs — frontmatter schema, capability tagging, the V3 catalog, and the CI checks that run on every PR."
type: guide
tags: [contributing, authoring, meta]
v3_relevant: true
deprecated: false
---

# Contributing to developer documentation

This is the contributor checklist for adding or updating Fliplet developer documentation. Lint errors in the build pipeline link back to this page, so what's here is what CI is checking for.

The reference reading underneath this checklist is `docs/CLAUDE.md` — the canonical schema for frontmatter, the build pipeline, and the rules for what NOT to add. This page is the human-facing walkthrough.

## Adding a new package doc

When you add a new `fliplet-*` package, follow this 10-step checklist:

1. **Start from the template.** Copy `_templates/doc-template.md` (or `_templates/js-api.md` for a JavaScript API reference) to `docs/API/fliplet-<package>.md`. Filename must match the npm package name, prefixed with `fliplet-`.

2. **Set the required frontmatter.** Every doc needs:
   - `title:` matching the H1 (minus enclosing backticks)
   - `description:` 1–2 sentences, ≤160 chars, standalone
   - `type:` one of `api-reference` / `guide` / `how-to` / `concept` / `tutorial` / `reference` / `integration`
   - `tags:` first tag is the canonical area (`js-api`, `rest-api`, etc.), then 1–5 specifics, lowercase dash-separated
   - `v3_relevant: true` (default; set `false` only for clearly V1-only content)
   - `deprecated: false` (default)

3. **Add `capabilities:` — 6–12 lowercase keywords.** Describe what this API does in user-facing terms ("stripe", "barcode scan", "send email"), including named third-party services where relevant. The V3 AI builder uses these to anchor user-described capabilities to your API without a `search_libraries` round-trip. Examples:
   ```yaml
   capabilities: [stripe, checkout, subscription, recurring billing, refund, webhook, customer portal, payment intent, ecommerce]
   capabilities: [barcode scan, qr code, ean, upc, code 128, code 39, camera scanner]
   ```

4. **Add `category:` — pick exactly one.** Allowed values (see `docs/v3/capabilities` for what's in each):
   - `data` — persistence, query, real-time, encryption, offline storage
   - `identity` — auth, sessions, biometrics, profile, orgs, tokens
   - `communications` — email / SMS / push, chat, websockets
   - `media` — upload, transform, audio, scanning, barcode
   - `native` — native-only APIs (Cordova bridge)
   - `commerce` — payments, subscriptions, app store / play store metadata
   - `integration` — REST API, OAuth, webhooks
   - `automation` — AI, app actions runtime, hooks, scheduling
   - `analytics` — event tracking, custom metrics, page views (user behaviour)
   - `observability` — logs, error capture, audit trails (app health — distinct from `analytics`)
   - `framework` — runtime, registry, environment, widget, locale, dynamic loading (framework-level glue)
   - `navigation` — screen navigation, URL routing, screen listing
   - `meta` — residual catch-all (app metadata, encoding helpers, error parsing, common functions). Keep small — if `meta` exceeds 6-8 entries, propose a split rather than letting it absorb new entries

   Pick the dominant facet. A cross-cutting API like `Fliplet.Notifications` (communications + native) picks `communications` because that's how end-users describe what it does.

5. **Set `exclude_from_v3_catalog: true` ONLY if the package shouldn't appear in the V3 builder's anchored prompt.** Cases where exclusion is correct:
   - The package is a UI primitive replaced by the V3 design system (`fliplet-ui-*`, `fliplet-table`, `fliplet-modal`)
   - The package is deprecated, V1-only, or a redirect stub
   - The doc is meta (overview pages, framework docs)

   Most installable docs SHOULD be in the catalog. Add a one-line `notes:` field too if the exclusion needs context.

6. **Write the intro paragraph between H1 and the first H2.** The `llms.txt` extractor and the agent-skills/SKILL.md generators both depend on prose between the title and the first subheading. Don't jump straight from `# Title` into `## Subheading`.

7. **Document each public method with a runnable code example.** Code examples must work — the V3 AI builder follows the docs literally. Verify signatures against `~/Sites/fliplet/api/public/assets/<package>/` source before publishing.

8. **Verify the doc against source.** For JS APIs, cross-check every method name, parameter list, and return shape against the package source. If a method exists in source but isn't documented, decide whether it's public-API-worthy (document) or internal (omit). Don't document methods that don't exist.

9. **Run `--strict` locally.** From `docs/`:
   ```bash
   node bin/build-agent-indexes.mjs --strict
   ```
   Fix any errors before opening a PR. The lint will catch:
   - Empty/non-lowercase/duplicate `capabilities[]` tokens
   - Tokens >40 chars (likely a missing comma)
   - Tokens that start with `[` (bracket-mismatch in your YAML flow list)
   - Missing `category:` or values outside the allowed enum
   - Standard frontmatter violations from `validateFrontmatter`

10. **Open the PR.** CF Pages will build a branch preview. Visit the preview URL to confirm:
    - Your doc renders with the right layout
    - It appears under the correct section on `/v3/capabilities` (auto-generated index)
    - The `.well-known/llms-v3-libraries.json` diff in the PR shows your new entry with the right `category`, `capabilities`, and `preloaded` flag

## Updating an existing doc

The same rules apply with two adjustments:
- Don't change `title:` casually — the V3 AI builder embeds the namespace title in its system prompt; renaming silently shifts what the agent recognises.
- Don't reorder `capabilities[]` — the field is hashed downstream; reordering = diff churn without semantic change.

## Where does each thing live?

- **`docs/API/fliplet-*.md`** — installable packages (catalog: `preloaded: false`)
- **`docs/API/core/*.md`** — ambient namespaces preloaded via `fliplet-core` (catalog: `preloaded: true`)
- **`docs/API/components/*.md`** — components framework (not in V3 catalog)
- **`docs/API/helpers/*.md`** — helpers framework (not in V3 catalog)
- **`docs/REST-API/*.md`** — REST endpoints (not in V3 catalog)
- **`docs/v3/*.md`** — V3-specific generated pages (e.g. `capabilities.md` — do not hand-edit)

## What gets generated, what doesn't

`bin/build-agent-indexes.mjs` runs on every CF Pages deploy and regenerates these on every push:

- `.well-known/llms.txt` — per-page index
- `.well-known/llms-full.txt` — concatenated content
- `.well-known/llms-v3-libraries.json` — the V3 library catalog
- `.well-known/agent-skills/*` — cluster-shaped skill registry
- `v3/capabilities.md` — the auto-generated capabilities index

You can edit any of these manually but the next build will overwrite. The single source of truth is your doc's frontmatter + body.

## See also

- [`docs/CLAUDE.md`](https://github.com/Fliplet/fliplet-cli/blob/master/docs/CLAUDE.md) — full schema, build pipeline, "what NOT to add"
- [`docs/v3/capabilities`](v3/capabilities) — the live capabilities index (auto-generated from `category:` frontmatter)
