# Link action provider

**Package**: `com.fliplet.link`

## Overview

The **Link action provider** allows users to configure actions that can be executed. The condition or trigger for executing the action depends on the provider caller. The Link action provider simply specifies the action that should be carried out. By using the Link action provider to configure this, any feature will be able to use the same UI and interactions to configure an action.

## Usage

```js
var provider = Fliplet.Widget.open('com.fliplet.link', {
  selector: '#link-action',
  data: {
    actionLabel: 'Click action',
    action: 'screen',
    page: 123,
    omitPages: [12],
    options: {
      hideAction: true
    }
  }
});
```

## Parameters

The following parameters can be passed to `Fliplet.Widget.open()` using `data` as shown above.

* `actionLabel` (String) Custom label for the action dropdown. **Default**: `Link action`
* `action` (String) The action to load into the link provider
  <details markdown="1">
  <summary>Possible values</summary>

  * `screen` Display another screen
  * `url` Open a web page
  * `document` Open a document
  * `video` Play a video
  * `runFunction` Call a JavaScript Function
  </details>
* `options` (Object) A map of options for the provider.
  * `hideAction` (Boolean) Set to `true` to hide the action dropdown. If set to `true`, `action` should also be provided to set the `action` without a dropdown.
* `omitPages` (Array) List of pages to omit if the user selects the `screen` action.

## Return value

The `provider` object resolves with an action object that can be executed with `Fliplet.Navigate.to()` in apps and passed directly back to the provider during initialization.

## Provider triggers

### `widget-autosize`

Resize the provider size to fit the size of the content within.

**Example**

```js
provider.emit('widget-autosize');
```

## Provider events

* `widget-changed` Event is fired when the action value is changed.

---

[Back to Providers](../../components/Using-Providers.html)
{: .buttons}
