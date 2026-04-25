---
title: Fliplet SDK
description: "Load Fliplet JS APIs on any external website via sdk.js with an auth token and optional comma-separated package list (e.g. fliplet-media, fliplet-datasources)."
type: reference
tags: [sdk]
v3_relevant: true
deprecated: false
---
# Fliplet SDK

Load Fliplet JS APIs on any external website by including `sdk.js` with an auth token and an optional comma-separated package list (e.g. `fliplet-media`, `fliplet-datasources`). This lets you call the same JS APIs from client-side code that isn't hosted on Fliplet's domains.

---

## How to use the SDK?

Simply include a script tag to our JS SDK with your auth token (although it's not strictly required to use the JS APIs).

```html
<script type="text/javascript" src="https://cdn.api.fliplet.com/sdk.js?auth_token=123"></script>

<script type="text/javascript">
  Fliplet().then(function () {
    Fliplet.Apps.get().then(console.log)
  });
</script>
```

Please note that all code uding the JS APIs should run once the `Fliplet()` promise is resolved (like the above example) to ensure all files have been loaded.

## Include other dependencies

Other dependencies can be included by providing a comma-separated list of the package names via the `packages` query parameter.

e.g. `packages=lodash,fliplet-datasources,fliplet-media`

```html
<script type="text/javascript" src="https://cdn.api.fliplet.com/sdk.js?packages=fliplet-media&auth_token=123"></script>
```

**Note:** `fliplet-core` is included by default, hence doesn't need to be listed.

---

[Back](README.md)
{: .buttons}