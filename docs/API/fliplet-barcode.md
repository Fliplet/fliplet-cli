---
title: Fliplet.Barcode
description: Generate QR codes and 1D/2D barcodes on screen, and scan them from the device camera, via the fliplet-barcode package.
type: api-reference
tags: [js-api, barcode]
v3_relevant: true
deprecated: false
capabilities: [barcode, qr code, qrcode, scan, scanner, camera scan, generate barcode, ean, upc, 1d barcode, 2d barcode]
notes: "For apps that scan on both web (browser camera) and native (Cordova plugin), do NOT rely on Fliplet.Barcode.scan() alone — the library's platform auto-detection can be wrong in Studio preview iframes and some published-web builds, causing it to silently take the Cordova path on web. Branch on RUNTIME Cordova availability (`!window.cordova && navigator.mediaDevices?.getUserMedia`) and use `Html5Qrcode` directly on web (loaded transitively via `Fliplet.require.lazy.chain('fliplet-barcode')`). Render the scanner into an inline div with explicit min-height (≥320px), handle granular permission errors (NotAllowedError, NotFoundError, NotReadableError, HTTPS), and call Fliplet.Barcode.scan() only when window.cordova is present. The canonical Vue recipe is in the doc body's 'Recommended pattern (web + native)' section — copy that pattern verbatim, never collapse the catch to 'preview only' or 'device build required' copy."
---
# `Fliplet.Barcode`

Scan QR codes and other 1D/2D barcodes from the device camera, and generate barcode images on screen, via the `fliplet-barcode` package. For apps that scan on both **web** (browser camera) and **native** (Cordova plugin), use the [Recommended pattern (web + native)](#recommended-pattern-web--native) below — it works reliably in Studio preview, published-web builds, and native shells on the first attempt.

## Install

Add the `fliplet-barcode` dependency to your screen or app resources.

## Fliplet.Barcode.scan()

(Returns `Promise`)

Scan a QR code or barcode.

**Note**: For apps that scan on both **web** and **native**, do not call `Fliplet.Barcode.scan()` alone. The library's platform auto-detection can be wrong in Studio preview iframes and some published-web builds — the call then silently routes to the Cordova path on web (which rejects, because Cordova isn't loaded). Use the **Recommended pattern (web + native)** below — branch on actual `window.cordova` availability and use `Html5Qrcode` directly on web. This is the only way to reliably open the camera on first attempt in both environments.

### Recommended pattern (web + native)

Detect runtime Cordova availability and use `Html5Qrcode` directly on web (loaded transitively via `Fliplet.require.lazy.chain('fliplet-barcode')`); fall through to `Fliplet.Barcode.scan()` on native.

In your screen template, include the inline div the web scanner renders into, a trigger button, and a status/error region:

```html
<div v-if="webScannerActive">
  <div id="web-scanner" class="web-scanner"></div>
  <button @click="stopWebScanner">Stop scanner</button>
</div>
<button @click="scanCode" :disabled="scanning">
  {{ scanning ? 'Scanner open…' : 'Scan QR code' }}
</button>
<div v-if="message" :class="messageType">
  <strong>{{ messageTitle }}</strong>
  <span>{{ message }}</span>
</div>
```

In your component logic:

```js
data: function() {
  return {
    scanning: false,
    webScanner: null,
    webScannerActive: false,
    message: '',
    messageTitle: '',
    messageType: 'info'
  };
},
beforeUnmount: function() {
  this.stopWebScanner();
},
methods: {
  // 1) Branch on RUNTIME Cordova absence — not Fliplet.Env.is('web') or
  //    window.ENV.platform, which can be wrong in preview / web builds.
  shouldUseWebScanner: function() {
    var hasWebCamera = !!(navigator.mediaDevices
      && typeof navigator.mediaDevices.getUserMedia === 'function');
    var isNative = !!(window.cordova || window.PhoneGap || window.Cordova);
    return hasWebCamera && !isNative;
  },

  // 2) Single entry point — branches based on shouldUseWebScanner().
  scanCode: async function() {
    this.message = '';
    this.scanning = true;
    try {
      if (this.shouldUseWebScanner()) {
        await this.startWebScanner();
        return;
      }
      var result = await Fliplet.Barcode.scan({
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        prompt: 'Place the QR code inside the scan area'
      });
      if (!result || result.cancelled) {
        this.showMessage('Scan cancelled', 'No code was scanned.', 'info');
        return;
      }
      this.handleScanResult(result.text || '');
    } catch (error) {
      this.showMessage('Scanner unavailable', this.permissionMessage(error), 'error');
    } finally {
      if (!this.webScannerActive) this.scanning = false;
    }
  },

  // 3) Web scanner — Html5Qrcode rendered into the inline div.
  startWebScanner: async function() {
    this.webScannerActive = true;
    await this.$nextTick();
    // The fliplet-barcode chain bundles html5-qrcode, so its global
    // (`window.Html5Qrcode`) becomes available after the chain loads.
    await Fliplet.require.lazy.chain('fliplet-barcode');
    if (!window.Html5Qrcode) {
      throw new Error('Html5Qrcode (bundled with fliplet-barcode) did not load');
    }
    var scanner = new window.Html5Qrcode('web-scanner');
    var self = this;
    this.webScanner = scanner;
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      function(decodedText) {
        self.stopWebScanner().then(function() {
          self.handleScanResult(decodedText);
        });
      },
      function() {} // ignore continuous decode failures
    );
  },

  // 4) Clean shutdown — always stop AND clear, swallow already-stopped errors.
  stopWebScanner: async function() {
    try {
      if (this.webScanner && this.webScanner.isScanning) {
        await this.webScanner.stop();
      }
      if (this.webScanner && typeof this.webScanner.clear === 'function') {
        await this.webScanner.clear();
      }
    } catch (e) { /* already stopped */ }
    finally {
      this.webScanner = null;
      this.webScannerActive = false;
      this.scanning = false;
    }
  },

  // 5) Granular permission/error messages — DO NOT collapse to
  //    "preview only" or "device build required".
  permissionMessage: function(error) {
    var name = error && error.name ? error.name : '';
    var text = error && error.message ? error.message : '';
    if (text.indexOf('Camera streaming not supported') !== -1 || text.indexOf('NotSupported') !== -1) {
      return 'This window cannot start a live camera feed. Open the app directly in a browser tab.';
    }
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || text.indexOf('Permission') !== -1) {
      return 'Camera access was blocked. Please allow camera access in your browser settings, then try again.';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera was found on this device.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'The camera is already in use by another app or tab.';
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return 'Browser camera access needs HTTPS. Open the app via an HTTPS URL.';
    }
    return 'Camera scanning could not start in this view.';
  },

  handleScanResult: function(text) {
    // App-specific handling — parse the text, route, etc.
  },

  showMessage: function(title, message, type) {
    this.messageTitle = title;
    this.message = message;
    this.messageType = type || 'info';
  }
}
```

Add this minimum CSS so the camera feed has space to render:

```css
.web-scanner {
  width: min(480px, 100%);
  min-height: 320px;
  overflow: hidden;
  border-radius: 16px;
}
.web-scanner video { border-radius: 16px; }
```

**Why this pattern works first-time:**

- `shouldUseWebScanner()` checks RUNTIME Cordova absence, not the static `Fliplet.Env.is('web')` or `window.ENV.platform` (which can be wrong in preview iframes and some web builds).
- `Html5Qrcode` directly bypasses `Fliplet.Barcode.scan()`'s buggy platform dispatch on the web path — no library-side detection bug to trip on.
- The inline div avoids overlay timing issues that can suppress the browser's camera-permission popup.
- Granular permission messages tell users what's actually wrong (HTTPS, denied permission, missing camera) instead of misleading "device build" copy that blocks them entirely.

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
