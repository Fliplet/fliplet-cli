# Modal

<p class="info">This JS API is only available in widget interfaces when developing for Fliplet Studio. If you're looking for adding modals and confirmation windows to your Fliplet Apps, please look for the following JS APIs instead:</p>

- [Fliplet.UI.Actions](https://developers.fliplet.com/API/fliplet-ui-actions.html)
- [Fliplet.UI.Toast](https://developers.fliplet.com/API/fliplet-ui-toast.html)

When using Modal windows on widget interfaces, we use [Bootbox](http://bootboxjs.com/) under the hood hence make sure to check their documentation for the full set of options you can pass.

### Display a confirmation message

Displays a confirmation message in Fliplet Studio from a Fliplet Widget interface.

```js
Fliplet.Modal.confirm({ message: 'Are you sure?'}).then(function (result) {
  if (result) {
    // user pressed yes
  }
});
```

### Display an alert message

Displays an alert message in Fliplet Studio from a Fliplet Widget interface.

```js
Fliplet.Modal.alert({ message: 'Thanks for confirming'}).then(function () {
  // fired when the user pressed "OK"
});
```