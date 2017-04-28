# Fliplet SDK

The Fliplet SDK enables you to use all the JS APIs outside of our environment. This means you can use them on any client-side code which is not sitting on Fliplet's domains.

---

## How to use the SDK?

Simply include a script tag to our JS SDK with your auth token (although it's not strictly required to use the JS APIs).

```html
<script type="text/javascript" src="http://api.fliplet.dev/sdk.js?auth_token=123"></script>

<script type="text/javascript">
  Fliplet().then(function () {
    Fliplet.Apps.get().then(console.log)
  });
</script>
```

## Include other dependencies

Other dependencies can be included by providing a comma-separated list of the package names via the `packages` query parameter.

e.g. `packages?lodash,fliplet-datasources,fliplet-media`

```html
<script type="text/javascript" src="http://api.fliplet.dev/sdk.js?packages=fliplet-media&auth_token=123"></script>
```