---
title: "V3 barcode scanning"
description: How to scan QR codes and barcodes in V3 apps with Fliplet.Barcode.attachScanner() — a UI-less scanner you embed in your own screen that works on web and native.
type: guide
tags: [js-api, v3, barcode]
v3_relevant: true
deprecated: false
---

# V3 barcode scanning

Scanning in a V3 app uses `Fliplet.Barcode.attachScanner()` — a UI-less scanner you drive into a container element inside your own screen. It behaves the same on **web and native**, so a screen you build with it runs everywhere a V3 app runs (slug-hosted web, the Studio preview, and the native shell). You build the scanning UI yourself, the same way you build a login screen on top of `Fliplet.Session`; the API owns only the camera and the decoder.

This guide covers the recommended embedded-scanner pattern, a full worked example, the controller and options, and camera permissions.

## Prerequisites

Add the `fliplet-barcode` package to the screen, then load it before use:

```js
await Fliplet.require.lazy.chain('fliplet-barcode');
```

`attachScanner()`, `show()`, and `encode()` all live on `Fliplet.Barcode` once the package is loaded. For the full method and option reference, see the [`Fliplet.Barcode` API reference](../fliplet-barcode.md).

## The recommended pattern: attachScanner()

`attachScanner()` has **no built-in UI**. You place and style a container element; `attachScanner()` runs the camera and decoder into it and calls you back on each successful decode. Because there is no platform-specific overlay, the same code works on web and native.

```js
// Your screen owns this element and its styling:
// <div id="reader" style="width: 100%; max-width: 320px; aspect-ratio: 1;"></div>

const scanner = Fliplet.Barcode.attachScanner(document.getElementById('reader'), {
  onScan(result) {
    // result.text   — the decoded value, e.g. "https://example.com" or "5012345678900"
    // result.format — the symbology, e.g. "QR_CODE", "CODE_128", "EAN_13"
    scanner.stop(); // one-shot: stop after the first hit (omit to keep scanning)
    showResult(result.text);
  },
  onError(error) {
    // Fatal start error: camera permission denied, no camera, or library load failure.
    showMessage('Could not start the scanner. Check camera permissions and try again.');
  }
});

// Stop the camera when the user leaves the screen or closes your scanner UI:
scanner.stop();
```

### Worked example: tap a button to scan

A typical scanning screen keeps the viewfinder hidden until the user asks for it, scans once, then shows the result. This is the whole flow in vanilla JS:

```html
<button id="scan-btn">Scan a barcode</button>
<div id="reader" hidden style="width: 100%; max-width: 320px; aspect-ratio: 1; margin-top: 16px;"></div>
<p id="result"></p>
```

```js
await Fliplet.require.lazy.chain('fliplet-barcode');

const btn = document.getElementById('scan-btn');
const reader = document.getElementById('reader');
const resultEl = document.getElementById('result');
let scanner = null;

btn.addEventListener('click', function () {
  reader.hidden = false;
  scanner = Fliplet.Barcode.attachScanner(reader, {
    onScan(result) {
      resultEl.textContent = `${result.format}: ${result.text}`;
      scanner.stop();
      reader.hidden = true;
    },
    onError() {
      resultEl.textContent = 'Camera unavailable — check permissions.';
      reader.hidden = true;
    }
  });
});
```

### Vue component

In a V3 Vue screen, start the scanner from a button handler and always stop it on unmount so the camera is released:

```js
// Scanner.vue (runtime template — V3 single-file components run without a build step)
export default {
  data() {
    return { value: '', scanner: null };
  },
  methods: {
    async start() {
      await Fliplet.require.lazy.chain('fliplet-barcode');
      this.scanner = Fliplet.Barcode.attachScanner(this.$refs.reader, {
        onScan: (result) => {
          this.value = result.text;
          this.scanner.stop();
        },
        onError: () => { this.value = 'Camera unavailable.'; }
      });
    }
  },
  beforeUnmount() {
    if (this.scanner) {
      this.scanner.stop();
    }
  },
  template: `
    <div>
      <button @click="start">Scan</button>
      <div ref="reader" style="width: 100%; max-width: 320px; aspect-ratio: 1;"></div>
      <p v-if="value">{{ value }}</p>
    </div>
  `
};
```

## Controller and options

`attachScanner(element, options)` returns a controller and accepts:

* **element** (HTMLElement | String) — the container to render the camera into (an element or its `id`). You own its placement and styling; `attachScanner()` neither creates nor removes it.
* **options.onScan** (Function) — called on every successful decode with `{ text, format }`. Call `controller.stop()` inside it for one-shot scanning.
* **options.onError** (Function) — called on a fatal start error (permission denied, no camera, or library load failure). Per-frame decode misses are *not* errors and are ignored.
* **options.fps** (Number) — decode attempts per second. Default `10`.
* **options.qrbox** (Object | Function) — scan-box size. Defaults to a centered square at 70% of the smaller edge.

The controller is `{ stop() }`. `stop()` ends the camera, tears down the decoder (your element stays in the DOM), and returns a `Promise`.

## Camera permissions

* **Web** — the browser prompts for camera access when scanning starts, and `getUserMedia` requires a secure context (HTTPS). In the Studio preview the app runs in an iframe that already delegates `camera`; a published slug is served over HTTPS.
* **Native** — the OS prompts on first use.

Handle a denied permission in `onError` — show the user how to re-enable the camera rather than leaving an empty viewfinder.

## Generating barcodes

To render a QR code or barcode image (rather than scan one), use `Fliplet.Barcode.show()` or `Fliplet.Barcode.encode()`. Both work on web and native. See the [`Fliplet.Barcode` API reference](../fliplet-barcode.md) for the format and styling options.

## Patterns — DO and DON'T

**DO**

- Build your own scanning UI (button, viewfinder container, result area) and drive `attachScanner()` into it.
- Call `controller.stop()` after the first scan for one-shot flows, and on screen teardown/unmount to release the camera.
- Handle `onError` with a user-facing message about camera permissions.
- Give the container an explicit size — the camera fills it.

**DON'T**

- Don't leave the scanner running after navigation — a live camera drains battery and blocks other capture.
- Don't add a separate "scanner" package or a custom camera/getUserMedia stack — `attachScanner()` is the supported cross-platform scanner.

## Related

- [`Fliplet.Barcode` API reference](../fliplet-barcode.md) — full method and option reference for the `fliplet-barcode` package.
- [V3 routing](./routing.md) — base-path and navigation patterns for the screen that hosts your scanner.
