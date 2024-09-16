# Data source provider

**Package**: `com.fliplet.data-source-provider`

## Overview

The **Data source provider** allows users to set the data source requirements for a component. The provider can be used to select a data source, set the default value for a newly created data source, set the data source security requirements, and more.

## Usage

```js
var provider = Fliplet.Widget.open('com.fliplet.data-source-provider', {
  selector: '#data-source',
  data: {
    dataSourceTitle: 'Data source title',
    dataSourceId: 123,
    appId: Fliplet.Env.get('appId'),
    default: {
      name: `Data for ${Fliplet.Env.get('appName')}`,
      columns: ['Column 1', 'Column 2'],
      entries: [{ 'Column 1': 'Value 1', 'Column 2': 'Value 2' }]
    },
    accessRules: [{ allow: 'all', type: ['select'] }]
  }
});
```

## Parameters

The following parameters can be passed to `Fliplet.Widget.open()` using `data` as shown above.

* `dataSourceTitle` (String) Title to use above the data source dropdown. **Default**: `Select a data source`
* `dataSourceId` (String) The data source to select, if provided.
* `appId` (Number) If provided, the initial list of data source shown in the dropdown will be limited to those assigned to the app.
* `default` (Object) The default configuration for a new data source created by the data source provider.
  * `name` (String) A custom name to use when creating a new data source.
  * `columns` (Array) An array of strings representing the column names that should be created in the new data source.
  * `entries` (Array) An array of objects representing the entries that should be added to the data source when it's created.
* `accessRules` (Array) Array of security rules required for the data source. If any of the required access rules are not found in the data source, users will be prompted to set them up.

## Return value

The `provider` object resolves with an object representing the selected data source. Usually, only the data source ID needs to be saved.

<p class="warning">Ensure data source information is not unnecessarily saved or exposed to prevent security breaches.</p>

**Example**

```js
provider.then(function(result) {
  console.log('Selected data source ID:', result.data.id);
});
```

## Provider triggers

### `widget-autosize`

Resize the provider size to fit the size of the content within.

**Example**

```js
provider.emit('widget-autosize');
```

### `update-security-rules`

Update the data source security rule requirements.

**Example**

```js
provider.emit('update-security-rules', { accessRules: accessRules });
```

## Provider events

* `dataSourceSelect` A data source is selected.
* `selected-data-source-loaded` Selected data source is loaded.
* `data-sources-loaded` List of available data source is loaded.

---

[Back to Providers](../../components/Using-Providers.html)
{: .buttons}
