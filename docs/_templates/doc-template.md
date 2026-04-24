---
title: My new Fliplet feature
description: One-sentence summary under 160 characters that names the feature and what it lets a developer do.
type: guide
tags: [area, feature]
v3_relevant: true
deprecated: false
---
# My new Fliplet feature

Open with a 1–2 sentence paragraph that works as a standalone summary — it is
what the llms.txt index extracts for AI clients and what humans skim before
reading further. Do not start with "This page describes..." or "In this
document...".

## First subheading

Content goes here.

## Another subheading

- Bullet
- Bullet

```js
// Code example
```

<!--
Frontmatter field guide:

title        Must match the H1. Wrap the H1 in backticks if it names a
             JS namespace (e.g. `Fliplet.Foo`); keep `title:` unquoted and
             plain (e.g. `Fliplet.Foo`).

description  <= 160 chars. Plain English, no markdown, no trailing period
             required. Mirrors the first paragraph but can be keyword-denser.

type         api-reference | guide | how-to | concept | tutorial | reference | integration

tags         Lowercase dash-separated, 1–6 of them. First tag is usually the
             canonical area: `js-api`, `rest-api`, `components-framework`,
             `app-build`. Add specifics: `datasources`, `auth`, `v3`.

v3_relevant  true if the doc is applicable to V3 apps (most are). Set false
             only for clearly V1-only content (e.g. deprecated app-actions
             V1/V2).

deprecated   true for docs describing deprecated APIs or features. The llms.txt
             index still emits them; agents should prefer non-deprecated.
-->
