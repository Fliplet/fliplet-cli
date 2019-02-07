# `Fliplet.UI.ErrorToast()`

(Returns **`undefined`**)

Parses an error object and shows an optional initial message and a button
to view the detailed error message that is typically more technical.

## Usage

```js
Fliplet.UI.ErrorToast(error, message)
```

* **error** (Any) Error object to be parsed
* **message** (String) An optional initial message to be shown to the user (**Default**: `Unexpected error`)

```js
Fliplet.UI.ErrorToast(error, options)
```

* **error** (Any) Error object to be parsed
* **options** (Object) A mapping of options, with the following supported keys.
  * **message** (String) An optional initial message to be shown to the user (**Default**: `Unexpected error`)
  * **label** (String) Label for viewing the full error message. (**Default**: `Details`)

## Examples

### Display a Toast notification for an unknown error

```js
Fliplet.UI.ErrorToast(error);
```

### Display a Toast notification for an unknown error with a suitable initial message

```js
Fliplet.UI.ErrorToast(error, {
  message: 'Error registering user'
});
```

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
