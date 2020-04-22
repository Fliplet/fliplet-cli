# Audio Player JS APIs

## Install

Add the `fliplet-audio-player` dependency to your screen or app dependencies.

## Usage

Add the following HTML to your screen.

```html
<div data-title="The title of your audio file" data-audio-url="https://path/to/file.mp3"></div>
```

The HTML tag will be automatically detected by the framework on screen load and the audio player UI will be initialized.

If you need to add more tags at runtime, simply run `Fliplet.Media.Audio.Player.init()` to convert any new tag into an audio player.

## Attributes

* `data-audio-url` (Required) URL to the audio file
* `data-title` Add a title to the bottom of the audio player UI
* `data-disable-download` Users can download and cache the audio file on their devices for native apps. To disable the file download, add the `data-disable-download` attribute to the HTML tag.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
