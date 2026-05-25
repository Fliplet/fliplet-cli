# `Fliplet.Barcode`

## Install

Add `fliplet-barcode` as a Combo-B lazy dependency. **`html5-qrcode` is already bundled inside the `fliplet-barcode` chain — do NOT declare it as a separate lazy dependency, and do NOT use `jsqr`.**

## Fliplet.Barcode.scan()

(Returns `Promise`)

Scan a QR code or barcode.

**Note**: For apps that target both **web** and **native**, use the [Recommended pattern (web + native)](#recommended-pattern-web--native) below. `Fliplet.Barcode.scan()` alone is unreliable on web — its internal platform check can be wrong in Studio preview and some published-web builds, causing it to take the Cordova path on web (which rejects, because Cordova isn't loaded). Branch on `navigator.mediaDevices.getUserMedia` availability instead.

### Recommended pattern (web + native)

Use `html5-qrcode` for the web path and `Fliplet.Barcode.scan()` for the native path. Both come from the **same `fliplet-barcode` chain** — loading the chain via `Fliplet.require.lazy.chain('fliplet-barcode')` exposes `window.Html5Qrcode` globally AND makes `Fliplet.Barcode.scan()` available.

**Three rules that make this work first-attempt:**

1. **Detect via `navigator.mediaDevices.getUserMedia`**, NOT `Fliplet.Env.is('web')` or `window.ENV.platform` — those can be wrong inside Studio preview iframes and some published-web builds.
2. **Warm up camera permission with an explicit `getUserMedia` call BEFORE instantiating `Html5Qrcode`.** Cordova WebView's internal permissions pre-flight (`enumerateDevices` / `permissions.query`) is incomplete; calling `getUserMedia` ourselves triggers the OS permission popup so the library can succeed afterwards.
3. **Use `Fliplet.require.lazy.chain('fliplet-barcode')`, NOT `Fliplet.require.lazy('html5-qrcode')`.** `html5-qrcode` is a transitive dependency inside the chain — it is not (and should not be) declared as a separate top-level lazy dep.

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
    // Detect on web camera API, NOT Fliplet.Env.is — that's wrong in Studio preview
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await this.startWebScanner();
      return;
    }
    // Native path — chain exposes Fliplet.Barcode + cordova plugin bridge
    await Fliplet.require.lazy.chain('fliplet-barcode');
    var scan = await Fliplet.Barcode.scan({ prompt: 'Place the QR inside the area' });
    if (scan && !scan.cancelled && scan.text) this.handleCode(scan.text);
  },

  // Warm-up — triggers OS permission popup on Cordova WebView BEFORE Html5Qrcode's
  // internal pre-flight (which is incomplete on Cordova and would otherwise fail).
  requestCameraPermission: async function() {
    var stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    stream.getTracks().forEach(function(t) { t.stop(); });
  },

  startWebScanner: async function() {
    try {
      await this.requestCameraPermission();
      // Chain bundles html5-qrcode — window.Html5Qrcode becomes global after this
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

#### What NOT to do

- Don't use `Fliplet.require.lazy('html5-qrcode')` — html5-qrcode isn't typically a top-level lazy dep; that call throws `Lazy dependency "html5-qrcode" is not registered`. Always go through the chain.
- Don't use `jsqr` — `html5-qrcode` from the chain already covers the same use case and supports more formats.
- Don't branch on `Fliplet.Env.is('web')`, `window.ENV.platform`, or `window.cordova` — those are unreliable in Studio preview iframes. The `navigator.mediaDevices.getUserMedia` check is the only reliable signal.
- Don't skip the `requestCameraPermission` warm-up — without it, `Html5Qrcode.start()` rejects on Cordova WebView even though the underlying permission is grantable.
- Don't render into a `<video>`+`<canvas>` pair — that was the jsQR pattern. `html5-qrcode` manages its own DOM inside the `<div id="web-scanner">` target.

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
