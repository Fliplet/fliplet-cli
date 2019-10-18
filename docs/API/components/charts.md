# Charts

## Hooks

The **Chart** components exposes hooks that you can use to modify the component data and behavior. Here are the hooks and their specific life cycle:

- [`beforeQueryChart`](#beforequerychart)
- [`afterQueryChart`](#afterquerychart)

### `beforeQueryChart`

The hook is run before data is retrieved for processing and rendering. Return a rejected promise to stop the list from rendering with suitable error messages.

```js
Fliplet.Hooks.on('beforeQueryChart', fn);
```

#### Parameters

- **fn** (Function(`data`)) Callback function with an object parameter.
  - **options** (Object) A data query object containing the following.
    - **dataSourceId** (Number) Data source ID to query for data.
    - **columns** (Object) A mapping of variables used by the charts and the data source columns they refer to.
    - **query** (Object) Query option for the data source request. See [Data Sources JS API](../fliplet-datasources.md#find-specific-records) for more. **Default: `null`**

#### Usage

**Fetch data based on a condition query**

```js
Fliplet.Hooks.on('beforeQueryChart', function (options) {
  // Only include entries with the Color "red"
  options.query = {
    where: {
      Color: 'red'
    }
  };
});
```

### `afterQueryChart`

The hook is run after data is retrieved for processing and rendering.

```js
Fliplet.Hooks.on('afterQueryChart', fn);
```

#### Parameters

- **fn** (Function(`data`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **dataSourceEntries** (Array) Entries to be used for processing and render. Modify this array to change what the chart plots.

#### Usage

**Filter retrieved data before further processing and render**

```js
Fliplet.Hooks.on('afterQueryChart', function (options) {
  // Filter out entries with the Color "green"
  _.remove(options.dataSourceEntries, function (entry) {
    return entry.data.Color === 'green';
  });
});
```


---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}