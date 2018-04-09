# Audio JS APIs

The `fliplet-audio` package contains the following namespaces:

- [Audio](#audio)

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