# `Fliplet.UI.Toast.error()`

(Returns **`undefined`**)

Parses an error object and shows an optional initial message and a button
to view the detailed error message that is typically more technical.

## Usage

```js
Fliplet.UI.Toast.error(error, message)
```

* **error** (Any) Error object to be parsed
* **message** (String) An optional initial message to be shown to the user (**Default**: `Unexpected error`)

```js
Fliplet.UI.Toast.error(error, options)
```

* **error** (Any) Error object to be parsed
* **options** (Object) A mapping of options, with the following supported keys.
  * **message** (String) An optional initial message to be shown to the user (**Default**: `Unexpected error`)
  * **label** (String) Label for viewing the full error message. (**Default**: `Details`)

## Examples

### Use a Toast notification to manage a data source connection error

```js
// Data Source 0 is not found, and will trigger an error
Fliplet.DataSources.connect(0)
  .then(function (connection) {
    return connection.find();
  })
  .catch(function (error) {
    Fliplet.UI.Toast.error(error, {
      message: 'Error loading data'
    });
  });
```

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
