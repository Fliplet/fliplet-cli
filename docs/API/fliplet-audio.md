---
title: Fliplet.Media.Audio
description: "Play, pause, stop, and seek audio files on device or from a URL in Fliplet apps via the Audio namespace."
type: api-reference
tags: [js-api, audio]
v3_relevant: true
deprecated: false
---
# `Fliplet.Media.Audio`

Play, pause, stop, and seek audio files on device or from a URL in Fliplet apps via the Audio namespace.

---

## Audio

### Play a file

```js
// Create a new instance of a media file
Fliplet.Media.Audio('https://path/to/file.mp3').then(function (audio) {
  // Play the audio
  audio.play();

  // Pause playback
  audio.pause();

  // Stop playback
  audio.stop();

  // Add a handler to get the current time
  audio.getCurrentTime().then(function (currentTime) {

  });
})
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}