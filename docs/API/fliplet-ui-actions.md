# `Fliplet.UI.Actions()`

(Returns **`Promise`**)

Show a sheet of options the user can choose from.

* iOS uses the native `UIActionSheet`
* Android uses the native `AlertDialog`
* WP8 uses the native `Popup`
* Web uses a custom dialog (TBC)

If an action is chosen, the Promise is resolved when the specified action is completed or resolved with the 0-based index provided as the first parameter. The Promise is also resolved when user chooses to cancel and dismiss the action sheet. In this case, the index provided in the resolving function will be `undefined`.

## Screenshots

(Coming soon...)

## Usage

```js
Fliplet.UI.Actions(options)
```

* **options** (Object) A map of options to pass to the constructor.
  * **title** (String) A title that appears above the options.
  * **labels** (Array) Options to show the user. Each label object contains the following properties:
    * **label** (String) Option label to show the user.
    * **action** (Object or Function) If an object is provided the object will be passed to `Fliplet.Navigate.to()` and executed accordingly. If a function is provided, the function will be run with the 0-based index of the label as the first parameter.
  * **cancel** (Boolean or String) Unless this is `false` or an empty string, a cancel button will be added at the bottom with the provided string used as the button label. (**Default**: `Cancel`)

## Properties

The toast instance returned in the promise resolving function will contain the following properties.

* **data** (Object) A data object containing the configuration fro the Toast notification.

## Examples

### Open an address in Google Maps or share the address

```js
var mapUrl = 'https://maps.google.com/?addr=N1+9PF';
Fliplet.UI.Actions({
  title: 'What do you want with this address?',
  labels: [
    {
      label: 'Open in Google Maps',
      action: {
        action: 'url',
        url: mapUrl
      }
    },
    {
      label: 'Share URL',
      action: function (i) {
        // i will be 1
        Fliplet.Communicate.shareURL(mapUrl);
      }
    }
  ],
  cancel: 'Dismiss'
}).then(function(i){
  // i will be 0 or 1 depending on users's choice
  // ...or undefined if user chooses chooses "Dismiss"
});
```

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
