# Audio Player JS APIs

## Install

Simply add the `fliplet-audio-player` dependency to your screen or app dependencies.

## Usage

Declare these specific audio tags in the HTML of your screen. You can use any tag you want, the relevant part is the `data-audio-url` attribute and the `data-title`.

```html
<div data-title="The title of your audio file" data-audio-url="https://path/to/file.mp3"></div>
```

These tags will be picked up automatically by the framework and converted into audio player.

If you need to add more tags at runtime, simply run `Fliplet.Media.Audio.Player.init()` to convert any new tag into an audio player.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}