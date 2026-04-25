---
title: Fliplet.UI.Toast.error()
description: "Parse an error object and show a toast with a friendly initial message plus a button to reveal the detailed technical error via Fliplet.UI.Toast.error."
type: api-reference
tags: [js-api, toast, error]
v3_relevant: true
deprecated: false
---
# `Fliplet.UI.Toast.error()`

Parse an error object and show a toast with a friendly initial message plus a button that reveals the detailed, more technical error text via `Fliplet.UI.Toast.error()`. Useful for surfacing data source, network, and API failures to end users without exposing raw stack traces by default.

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
