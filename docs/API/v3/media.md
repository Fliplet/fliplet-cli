---
title: "V3 media"
description: Upload files and display stored images in V3 apps with Fliplet.Media — Files.upload() to store a file and get a URL back, plus server-side resizing and format conversion.
type: guide
tags: [js-api, v3, media]
v3_relevant: true
deprecated: false
package: fliplet-media
namespace: Fliplet.Media
category: media
capabilities: [upload file, file upload, attachment, media, store file, image, photo, display image, resize image]
---

# V3 media

The `fliplet-media` package **stores files** in a V3 app with `Fliplet.Media.Files.upload()` and gives you back a URL you display in your own screen. It works the same on **web and native**.

This guide covers letting the user pick a file or photo, uploading it, displaying a stored image, and the full pick → upload → display flow.

## Prerequisites

Add the `fliplet-media` package to the screen, then load it before use:

```js
await Fliplet.require.lazy.chain('fliplet-media');
```

## Letting the user pick a file or photo

Use a standard file input — it works on web and inside native apps, with no platform-specific code:

```html
<input type="file" id="picker" accept="image/*">
```

```js
document.getElementById('picker').addEventListener('change', function (event) {
  const file = event.target.files[0];

  if (!file) {
    return; // user cancelled
  }

  // Preview it locally before uploading
  document.getElementById('preview').src = URL.createObjectURL(file); // <img id="preview">
});
```

To hint the camera instead of the photo library on mobile, add the `capture` attribute:

```html
<!-- Opens the rear camera on mobile; desktop browsers ignore it and show the file picker -->
<input type="file" accept="image/*" capture="environment">
```

> **Photos and files only.** There is no audio/video *recording* API — let users **upload an existing file** with `Files.upload()` instead.

## Uploading a file: Fliplet.Media.Files.upload()

`Fliplet.Media.Files.upload()` stores a `File` or `Blob` (from an `<input type="file">`, or anywhere else) and resolves with the created media files. Send it as `FormData`:

```js
const data = new FormData();
data.append('file', file, file.name);

const files = await Fliplet.Media.Files.upload({
  data: data,
  folderId: myFolderId // optional — where to store it
});

const uploaded = files[0];
// uploaded.id  — the media file ID
// uploaded.url — the URL you display or store in a data source
```

`upload()` accepts any file type, so this is also how you store an **attached** audio or video file. Fliplet scans uploads for viruses and auto-resizes large images (both dimensions capped at `3840px`).

## Displaying a stored image

Point an `<img>` at `uploaded.url`. To serve a smaller, converted version instead of the original, ask the server to transform it with `Fliplet.Media.Files.getContents()`:

```js
// A 960px-wide WebP instead of the full-size original
const contents = await Fliplet.Media.Files.getContents(uploaded.id, {
  size: 'medium',  // small | medium | large | xlarge | xxlarge | xxxlarge
  format: 'webp',  // jpg | webp
  quality: 80      // 1–100
});
```

If your organization has media encryption enabled, wrap the URL with `Fliplet.Media.authenticate()` before using it so the auth token is attached:

```js
document.getElementById('photo').src = Fliplet.Media.authenticate(uploaded.url);
```

## Full example: pick → upload → display

```js
await Fliplet.require.lazy.chain('fliplet-media');

const img = document.getElementById('photo');    // <img id="photo">
const picker = document.getElementById('picker'); // <input type="file" id="picker" accept="image/*">

picker.addEventListener('change', async function (event) {
  const file = event.target.files[0];

  if (!file) {
    return; // user cancelled — leave the screen as-is
  }

  const data = new FormData();

  data.append('file', file, file.name);

  const files = await Fliplet.Media.Files.upload({ data: data });

  img.src = Fliplet.Media.authenticate(files[0].url);
});
```

## Patterns — DO and DON'T

**DO**

- Let the user pick a file with a standard `<input type="file">`, then store it with `Fliplet.Media.Files.upload()`.
- Handle the empty-selection case (the user cancelled the picker) so the screen doesn't hang.
- Display uploaded images via `uploaded.url`, resizing with `getContents()` and authenticating with `Fliplet.Media.authenticate()` when needed.

**DON'T**

- Don't call `navigator.camera.getPicture()` or `getUserMedia()` directly — that's native-only (or web-only) and won't run cross-platform. A standard `<input type="file" accept="image/*">` works on both.
- Don't expect audio/video **recording** — let users **upload** existing audio/video files with `Files.upload()`.

## Related

- [V3 routing](./routing.md) — base-path and navigation patterns for the screen that hosts your upload UI.
