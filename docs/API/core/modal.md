# `Fliplet.Modal`

Show confirmation, alert, and prompt dialogs from widget interfaces in Fliplet Studio, powered by [Bootbox](http://bootboxjs.com/) — see its documentation for the full set of options you can pass.

<p class="info">This JS API is only available in widget interfaces. For adding modals and confirmation windows to Fliplet Apps themselves, use <a href="https://developers.fliplet.com/API/fliplet-ui-actions.html">Fliplet.UI.Actions</a> or <a href="https://developers.fliplet.com/API/fliplet-ui-toast.html">Fliplet.UI.Toast</a> instead.</p>

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