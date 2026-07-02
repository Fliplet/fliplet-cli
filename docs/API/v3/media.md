---
title: "V3 media"
description: Capture or select a photo and upload files in V3 apps with Fliplet.Media — capture() to take or pick a photo (web + native) and Files.upload() to store it and get a URL back.
type: guide
tags: [js-api, v3, media]
v3_relevant: true
deprecated: false
package: fliplet-media
namespace: Fliplet.Media
category: media
capabilities: [capture photo, take photo, camera, photo, image, photo library, gallery, upload file, file upload, attachment, media, store file]
---

# V3 media

The `fliplet-media` package does two things in a V3 app, both the same on **web and native**: it **captures or selects a photo** with `Fliplet.Media.capture()`, and it **stores files** with `Fliplet.Media.Files.upload()`. `capture()` only *acquires* an image — you then `upload()` it to get back a URL you display in your own screen. The two steps are separate on purpose: capture the image, decide what to do with it, then store it.

This guide covers capturing a photo, uploading any file, displaying a stored image, and the full capture → upload → display flow.

## Prerequisites

Add the `fliplet-media` package to the screen, then load it before use:

```js
await Fliplet.require.lazy.chain('fliplet-media');
```

## Capturing a photo: Fliplet.Media.capture()

`Fliplet.Media.capture()` resolves with the chosen image as a `File`. It works the same on web and native — on native it drives the device camera or photo library; on web it opens the file picker (hinting the camera when you ask for one). You never touch the platform camera APIs yourself, the same way you build a login screen on top of `Fliplet.Session`.

```js
await Fliplet.require.lazy.chain('fliplet-media');

// Let the user choose camera or library (the default)
const file = await Fliplet.Media.capture();

// Preview it locally before uploading
document.getElementById('preview').src = URL.createObjectURL(file); // <img id="preview">
```

Force a specific source instead of prompting:

```js
const photo = await Fliplet.Media.capture({ source: 'camera' });   // straight to the camera
const picked = await Fliplet.Media.capture({ source: 'library' }); // straight to the gallery
```

`capture(options)` accepts:

* **options.source** (String) — `'ask'` (**default**, lets the user choose), `'camera'`, or `'library'`. On native, `'ask'` shows the OS chooser; on web the browser decides, and `'camera'` hints the rear camera on mobile.
* **options.quality** (Number) — JPEG quality `0`–`100`. **Default** `80`. *(Native only.)*
* **options.maxWidth** (Number) — target width in px; `0` keeps the original. **Default** `0`. *(Native only.)*
* **options.maxHeight** (Number) — target height in px; `0` keeps the original. **Default** `0`. *(Native only.)*

It resolves with a `File` and rejects if the user cancels or no camera is available — handle the rejection so the screen doesn't hang.

> **Photos only.** `capture()` takes still images. To collect audio or video, let the user **upload an existing file** with `Files.upload()` (below) — there is no audio/video *recording* API.

## Uploading a file: Fliplet.Media.Files.upload()

`Fliplet.Media.Files.upload()` stores a `File` or `Blob` (from `capture()`, an `<input type="file">`, or anywhere else) and resolves with the created media files. Send it as `FormData`:

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

## Full example: capture → upload → display

```js
await Fliplet.require.lazy.chain('fliplet-media');

const img = document.getElementById('photo'); // <img id="photo">

document.getElementById('add-photo').addEventListener('click', async function () {
  let file;

  try {
    file = await Fliplet.Media.capture({ source: 'ask' });
  } catch (err) {
    return; // user cancelled or no camera — leave the screen as-is
  }

  const data = new FormData();
  data.append('file', file, file.name);

  const files = await Fliplet.Media.Files.upload({ data: data });

  img.src = Fliplet.Media.authenticate(files[0].url);
});
```

## Patterns — DO and DON'T

**DO**

- Capture with `Fliplet.Media.capture()`, then store the returned `File` with `Fliplet.Media.Files.upload()`.
- Handle the `capture()` rejection (cancel / no camera) with a user-facing fallback.
- Display uploaded images via `uploaded.url`, resizing with `getContents()` and authenticating with `Fliplet.Media.authenticate()` when needed.

**DON'T**

- Don't call `navigator.camera.getPicture()` or `getUserMedia()` directly — that's native-only (or web-only) and won't run cross-platform. `Fliplet.Media.capture()` is the supported cross-platform primitive.
- Don't expect audio/video **recording** — `capture()` is for photos. Let users **upload** existing audio/video files with `Files.upload()`.

## Related

- [V3 routing](./routing.md) — base-path and navigation patterns for the screen that hosts your capture UI.
