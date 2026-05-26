# `Fliplet.Barcode`

## Install

Add `fliplet-barcode` as a Combo-B lazy dependency. **`html5-qrcode` is already bundled inside the `fliplet-barcode` chain — do NOT declare it as a separate lazy dependency, and do NOT use `jsqr`.**

## Fliplet.Barcode.scan()

(Returns `Promise`)

Scan a QR code or barcode.

**Note**: The [Recommended pattern (web + native)](#recommended-pattern-web--native) below is the canonical scanner implementation. It handles Studio preview, published web, and native APKs through a single code path, with the OS camera-permission popup triggered automatically on device.

### Recommended pattern (web + native)

Use the **runtime presence of `window.cordova`** to decide the path:

- **`window.cordova` is defined** (native APK) → call `Fliplet.Barcode.scan()` directly. Internally it routes through `cordova.plugins.barcodeScanner`, which handles the Android/iOS CAMERA permission via the standard Cordova mechanism — the OS permission popup appears automatically, then the native scanner UI opens. **No Java patches or extra plugins needed.**
- **`window.cordova` is undefined** (Studio preview, published web) → render `html5-qrcode` inline in a `<div>`. The browser shows its own camera permission prompt via `getUserMedia`.

Both paths come from the **same `fliplet-barcode` chain** — `Fliplet.require.lazy.chain('fliplet-barcode')` exposes `window.Html5Qrcode` globally AND makes `Fliplet.Barcode.scan()` available.

**Why this pattern works:**

1. **`typeof window.cordova !== 'undefined'`** is the runtime signal that's set if and only if the native Cordova runtime has loaded. It distinguishes a native APK from a web browser regardless of how the app was built or where it's previewed.
2. **`Fliplet.require.lazy.chain('fliplet-barcode')`** loads everything in one call. The chain bundles `html5-qrcode.min.js` for the web path AND `Fliplet.Barcode.scan()` for the native path — no separate `html5-qrcode` or `jsqr` declarations needed.
3. **On native, `Fliplet.Barcode.scan()`** delegates permission and UI to the bundled `cordova-plugin-barcodescanner` plugin — it handles the OS permission popup and opens a native scanner (ZXing on Android, AVFoundation on iOS).

#### Template

```html
<button @click="scanTicket">Scan ticket QR</button>

<div v-if="scannerActive" id="web-scanner" class="web-scanner"></div>
```

#### CSS

```css
.web-scanner {
  width: 100%;
  min-height: 320px;
}
```

The `min-height` is required — without explicit dimensions the camera feed has no room to render and `html5-qrcode` will throw.

#### JavaScript

```js
data: function() {
  return {
    scannerActive: false,
    html5Scanner: null
  };
},
methods: {
  scanTicket: async function() {
    // Runtime detection — window.cordova is defined only when the native Cordova
    // runtime has loaded. Studio preview iframes and published web do not have it.
    if (typeof window.cordova !== 'undefined') {
      // Native: cordova.plugins.barcodeScanner handles CAMERA permission via the
      // standard Cordova mechanism (OS popup appears automatically), then opens
      // a native full-screen scanner UI. No Java patches or extra plugins needed.
      await Fliplet.require.lazy.chain('fliplet-barcode');
      var scan = await Fliplet.Barcode.scan({ prompt: 'Place the QR inside the area' });
      if (scan && !scan.cancelled && scan.text) this.handleCode(scan.text);
      return;
    }
    // Web / Studio preview: render html5-qrcode inline.
    await this.startWebScanner();
  },

  startWebScanner: async function() {
    try {
      // Chain bundles html5-qrcode — window.Html5Qrcode becomes global after this.
      await Fliplet.require.lazy.chain('fliplet-barcode');
      this.scannerActive = true;
      await this.$nextTick();
      this.html5Scanner = new window.Html5Qrcode('web-scanner', { verbose: false });
      await this.html5Scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function(decoded) {
          this.stopWebScanner();
          this.handleCode(decoded);
        }.bind(this),
        function() { /* silent per-frame decode errors */ }
      );
    } catch (err) {
      console.error('[Scanner] startWebScanner failed:', err);
      await this.stopWebScanner();
      // Surface err.name + err.message in your error UI.
      // Do NOT collapse errors to "preview only" / "device build required" copy.
    }
  },

  stopWebScanner: async function() {
    this.scannerActive = false;
    if (this.html5Scanner) {
      try { await this.html5Scanner.stop(); } catch (e) {}
      try { this.html5Scanner.clear(); } catch (e) {}
      this.html5Scanner = null;
    }
  },

  handleCode: function(text) {
    // your decoded-value handling here
  }
}
```

#### Lifecycle

Call `stopWebScanner()` in `beforeUnmount` (Vue 3) or `beforeDestroy` (Vue 2) to release the camera stream when leaving the screen:

```js
beforeUnmount() { this.stopWebScanner(); }
```

#### Things to avoid

- Don't declare `html5-qrcode` or `jsqr` as separate top-level lazy dependencies — the chain already bundles `html5-qrcode`, and declaring it separately can shadow the chain-provided version.
- Don't call `getUserMedia` or instantiate `Html5Qrcode` from the native path — `Fliplet.Barcode.scan()` is the cleaner entry point and handles permissions for you.
- Don't render into a `<video>`+`<canvas>` pair — `Html5Qrcode` manages its own DOM inside the `<div id="web-scanner">` target.

### Simple native-only usage

If your app only ships as a native build, you can call `Fliplet.Barcode.scan()` directly:

```js
Fliplet.Barcode.scan(options).then(function (result) {
  // result.text
  // result.format
  // result.cancelled
}).catch(function (error) {
  // scan failed
});
```

* **options** (Object) A map of optional configurations for the scanner. See [**PhoneGap Plugin BarcodeScanner** documentation](https://github.com/phonegap/phonegap-plugin-barcodescanner) for a full list of supported options.

```js
options = {
  preferFrontCamera: false,
  showFlipCameraButton: true,
  showTorchButton: true,
  torchOn: false,
  saveHistory: true,
  prompt: 'Place a barcode inside the scan area'
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

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
