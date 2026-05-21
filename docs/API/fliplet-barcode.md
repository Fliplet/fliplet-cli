---
title: Fliplet.Barcode
description: Generate QR codes and 1D/2D barcodes on screen, and scan them from the device camera, via the fliplet-barcode package.
type: api-reference
tags: [js-api, barcode]
v3_relevant: true
deprecated: false
capabilities: [barcode, qr code, qrcode, scan, scanner, camera scan, generate barcode, ean, upc, 1d barcode, 2d barcode]
notes: "Fliplet.Barcode.scan()'s internal web/native dispatch is unreliable in Studio preview and some published-web builds (the platform field can be wrong in a browser). On web, detect Cordova at runtime — NOT via Fliplet.Env.is — and call Html5Qrcode directly. See the doc body's 'Recommended pattern (web + native)' section for the canonical guidance and the two non-obvious code expressions. Never collapse errors to 'preview only' / 'device build required' copy."
---
# `Fliplet.Barcode`

Scan QR codes and other 1D/2D barcodes from the device camera, and generate barcode images on screen, via the `fliplet-barcode` package. For apps that scan on both **web** (browser camera) and **native** (Cordova plugin), use the [Recommended pattern (web + native)](#recommended-pattern-web--native) below — it works reliably in Studio preview, published-web builds, and native shells on the first attempt.

## Install

Add the `fliplet-barcode` dependency to your screen or app resources.

## Fliplet.Barcode.scan()

(Returns `Promise`)

Scan a QR code or barcode.

**Note**: For apps that target both **web** and **native**, use the [Recommended pattern (web + native)](#recommended-pattern-web--native) below. Calling `Fliplet.Barcode.scan()` alone is unreliable on web — its internal platform check can be wrong in Studio preview and some published-web builds, causing it to silently take the Cordova path on web (which rejects, because Cordova isn't loaded).

### Recommended pattern (web + native)

`Fliplet.Barcode.scan()` decides web-vs-native internally by calling `Fliplet.Env.is('web')`, which reads `window.ENV.platform`. That value is set to `"native"` in Studio preview iframes and in some published-web builds, so the call rejects on web because the Cordova plugin isn't loaded in a browser. Detect Cordova yourself at runtime and call `Html5Qrcode` directly on web; only call `Fliplet.Barcode.scan()` on native.

**Runtime web check.** Compute this once in your scan handler before deciding which scanner to start. Use exactly this expression — do NOT substitute `Fliplet.Env.is('web')` or any check on `window.ENV.platform`:

```js
const isWeb = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  && !(window.cordova || window.PhoneGap || window.Cordova);
```

**On web** (`isWeb === true`): render an inline `<div id="web-scanner" class="web-scanner">` in your template (controlled by a `v-if`/conditional so it only mounts while scanning is active), give it `min-height: 320px` and a sensible width in CSS (without explicit dimensions the camera feed has no room to render), then load the chain and start the scanner. `html5-qrcode` ships transitively inside the `fliplet-barcode` chain, so `window.Html5Qrcode` becomes available after the chain loads:

```js
await Fliplet.require.lazy.chain('fliplet-barcode'); // exposes window.Html5Qrcode
const scanner = new window.Html5Qrcode('web-scanner');
await scanner.start(
  { facingMode: 'environment' },
  { fps: 10, qrbox: { width: 250, height: 250 } },
  (decodedText) => { scanner.stop(); /* handle decodedText */ },
  () => {} // ignore continuous decode failures
);
```

Hold the `scanner` instance in component state (e.g. `this.webScanner = scanner`) so you can dismiss it later. On unmount or when the user dismisses the scanner, call `scanner.stop()` then `scanner.clear()` wrapped in `try/catch` — both throw when the scanner has already stopped.

**On native** (`isWeb === false`): call `Fliplet.Barcode.scan(options)` directly. It works correctly when Cordova is actually loaded — the bug only affects the web path.

**Error handling.** Surface `error.message` to the user; distinguish at minimum these `error.name` values:

- `NotAllowedError` / `PermissionDeniedError` → "Camera access was blocked. Allow it in your browser settings and try again."
- `NotFoundError` / `DevicesNotFoundError` → "No camera was found on this device."
- `NotReadableError` / `TrackStartError` → "The camera is in use by another app or tab."
- `window.location.protocol !== 'https:'` and the hostname is not `localhost` → "Browser camera access needs HTTPS."

**Do NOT** collapse all errors to "preview only" or "device build required" copy. Those messages mislead users and block working scanners on web. The scanner *does* work on web — the runtime check above is the only thing that needs to be right.

### Simple native-only usage

If your app only ever ships as a native build (no web access), you can skip the platform branch and call `Fliplet.Barcode.scan()` directly:

```js
Fliplet.Barcode.scan(options).then(function (result) {
  // result.text
  // result.format
  // result.cancelled
}).catch(function (error) {
  // scan failed
});
```

* **options** (Object) A map of optional configurations for the scanner. See [**PhoneGap Plugin BarcodeScanner** documentation](https://github.com/phonegap/phonegap-plugin-barcodescanner) for a full list of supported options. The default options used by Fliplet is listed below.

```js
options = {
  preferFrontCamera: false, // iOS and Android
  showFlipCameraButton: true, // iOS and Android
  showTorchButton: true, // iOS and Android
  torchOn: false, // Android, launch with the torch switched on (if available)
  saveHistory: true, // Android, save scan history (default false)
  prompt: 'Place a barcode inside the scan area', // Android
};
```

## Fliplet.Barcode.show()

(Returns **`Promise`**)

Encode text into QR code or barcode and show it on the screen.

**Note**: A QR code is generated by default unless an alternative format is provided (see below).

### Usage

```js
Fliplet.Barcode.show(text).then(function (data) {
  // data (String) Encoded Base64 string
}).catch(function (error) {
  // encoding failed
});
```

* **text** (String) String to be encoded into a QR code and displayed

```js
Fliplet.Barcode.show(text, options).then(function (data) {
  // data (String) Encoded Base64 string
}).catch(function (error) {
  // encoding failed
});
```

* **text** (String) String to be encoded into a QR code or barcode and displayed
* **options** (Object) A map of options for the encoding
  * **format** (String) Format to encode the provided text with. See below for a list of supported formats:
    * `qr` (**Default**)
    * `barcode` - This will encode the provided text in `code128` format. See below for a specific list of supported formats [as supported by JsBarcode](https://github.com/lindell/JsBarcode/wiki#barcodes).
    * `code39`, `code128`, `code128A`, `code128B`, `code128C`, `ean13`, `ean8`, `ean5`, `ean2`, `upc`, `upce`, `itf14`, `itf`, `msi`, `msi10`, `msi11`, `msi1010`, `msi1110`, `pharmacode`, `codabar`, `genericbarcode`
  * **color** (String) Foreground color for the barcode. This can be a color keyword (e.g. `green`) or hexcode (e.g. `#00ff00`). **Default** `#000000`
  * **background** (String) Background color for the barcode. This can be a color keyword (e.g. `green`) or hexcode (e.g. `#00ff00`). **Default** `#ffffff`
  * **title** (String) Optional title to show to the user
  * **message** (String) Optional message to show to the user
  * **height** (Number) **Barcode only** - Height of barcode image. **Default** `150`
  * **lineWidth** (Number) **Barcode only** - Width of a single bar. The higher this number, the wider the result image. **Default** `2`

**Note** If a barcode is generated instead of a QR code, adjust `height` and `lineWidth` according to the text length. Fliplet recommends using QR codes unless a barcode is required because QR codes are always generated in a 1:1 aspect ratio.

## Fliplet.Barcode.encode()

(Returns **`Promise`**)

Encode text into QR code or barcode and return it as a Base64 image.

**Note**: A QR code is generated by default unless an alternative format is provided (see below).

### Usage

```js
Fliplet.Barcode.encode(text).then(function (data) {
  // data (String) Encoded Base64 string
}).catch(function (error) {
  // encoding failed
});
```

* **text** (String) String to be encoded into a QR code

```js
Fliplet.Barcode.encode(text, options).then(function (data) {
  // data (String) Encoded Base64 string
}).catch(function (error) {
  // encoding failed
});
```

* **text** (String) String to be encoded into a QR code or barcode
* **options** (Object) A map of options for the encoding
  * **format** (String) Format to encode the provided text with. See below for a list of supported formats:
    * `qr` (**Default**)
    * `barcode` - This will encode the provided text in `code128` format. See below for a specific list of supported formats [as supported by JsBarcode](https://github.com/lindell/JsBarcode/wiki#barcodes).
    * `code39`, `code128`, `code128A`, `code128B`, `code128C`, `ean13`, `ean8`, `ean5`, `ean2`, `upc`, `upce`, `itf14`, `itf`, `msi`, `msi10`, `msi11`, `msi1010`, `msi1110`, `pharmacode`, `codabar`, `genericbarcode`
  * **color** (String) Foreground color for the barcode. This can be a color keyword (e.g. `green`) or hexcode (e.g. `#00ff00`). **Default** `#000000`
  * **background** (String) Background color for the barcode. This can be a color keyword (e.g. `green`) or hexcode (e.g. `#00ff00`). **Default** `#ffffff`
  * **width** (Number) **QR code only** - Width of QR code image. **Default** `600`.
    * **Note**: For barcodes, the result width depends on the length of text encoded and the width of a single bar as configured via `lineWidth` (see below).
  * **height** (Number) Height of QR code or barcode image. **Default** `600` for QR code, `150` for barcode
  * **lineWidth** (Number) **Barcode only** - Width of a single bar. The higher this number, the wider the result image. **Default** `2`

**Note** If a barcode is generated instead of a QR code, adjust `height` and `lineWidth` according to the text length. Fliplet recommends using QR codes unless a barcode is required because QR codes are always generated in a 1:1 aspect ratio.

---

[Back to Fliplet.UI](./fliplet-ui)
{: .buttons}
