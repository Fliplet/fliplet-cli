# File picker

**Package**: `com.fliplet.file-picker`

## Overview

The **File picker** allows users to select one or more files that are accessible via File Manager.

## Usage

```js
var provider = Fliplet.Widget.open('com.fliplet.file-picker', {
  data: {
    selectFiles: [{ id: 123 }],
    type: 'image'
  }
});
```

## Parameters

The following parameters can be passed to `Fliplet.Widget.open()` using `data` as shown above.

* `selectFiles` (Array) Array of files to be marked as selected in the file picker. Each item in the array would be an object with `{ id }`
* `selectMultiple` (Boolean) Set to `true` to allow users to select multiple files.
* `type` (String) Type of files supported. **Default**: All files
  <details markdown="1">
  <summary>Possible values</summary>

  * (Empty) All files
  * `image` Images
  * `document` Documents
  * `video` Video files
  * `folder` Folders only
  </details>
* `fileExtension` (Array) Optionally provide a list of supported file extensions in uppercase, e.g. `['JPG', 'JPEG', 'PNG']`. Otherwise, the `type` will be sufficient for the API to only show files that match the type.

## Return value

The `provider` object resolves with an object representing the selected files/folders. Usually, only the file/folder ID needs to be saved.

**Example**

```js
provider.then(function(result) {
  console.log('Selected files:', result.data);
});
```

## Provider events

* `widget-set-info` Information of selected folders and files.

---

[Back to Providers](../../components/Using-Providers.html)
{: .buttons}
