# Charts

## JS API

### Retrieve an instance

Since you can have many charts in a screen, we provide some handy functions to grab a specific instance by its chart name or the first one available in the page when no input parameter is given.

`Fliplet.Chart.get()`

Retrieves the first or specific chart instance.

```js
// Gets the first chart instance
Fliplet.Chart.get()
  .then(function(chart) {
    // Use chart to perform various actions
  });

// Gets the first chart instance named 'foo'
Fliplet.Chart.get('foo')
  .then(function (chart) {
    // Use chart to perform various actions
  });
````

Alternatively, you can also retrieve the first chart instance of a specific type.

Support values for `type` are: `bar`, `column`, `donut`, `line`, `pie`, `scatter`.

```js
// Gets the first line chart instance
Fliplet.Chart.get({ type: 'line' })
  .then(function(chart) {
    // Use chart to perform various actions
  });
````

`Fliplet.Chart.getAll()`

Retrieve all chart instances or all chart instances that match the specified query.

```js
// Get all charts
Fliplet.Chart.getAll()
  .then(function(charts) {
    // Use charts to perform various actions
  });

// Get all charts named 'foo'
Fliplet.Chart.getAll('foo')
  .then(function(charts) {
    // Use charts to perform various actions
  });

// Get all pie charts
Fliplet.Chart.getAll({ type: 'pie' })
  .then(function(charts) {
    // Use charts to perform various actions
  });
```

### Instance properties

The `chart` instance variable above makes available the following instance properties.

 * `chart.name` Chart name
 * `chart.type` Chart type

### Instance methods

The `chart` instance variable above makes available the following instance methods.

`chart.refresh()`

Instantly refreshes the chart by getting the latest data. If auto-refresh is enabled, the timer is after data is retrieved.

The method returns a promise that resolves when the chart is redrawn.

## Hooks

The **Chart** components exposes hooks that you can use to modify the component data and behavior. Here are the hooks and their specific life cycle:

- [`beforeChartQuery`](#beforechartquery)
- [`afterChartQuery`](#afterchartquery)
- [`beforeChartRender`](#beforechartrender)
- [`afterChartRender`](#afterchartrender)

### `beforeChartQuery`

The hook is run before data is retrieved for processing and rendering. Return a rejected promise to stop the form from data query with suitable a error message.

```js
Fliplet.Hooks.on('beforeChartQuery', fn);
```

#### Parameters

- `fn` (Function(`data`)) Callback function with an object parameter.
  - `options` (Object) A map of data containing the following.
    - `config` (Object) Configuration used to initialize the component
    - `id` (Number) Component instance ID
    - `uuid` (String) Component instance UUID
    - `type` (String) Chart type

### `afterChartQuery`

The hook is run after data is retrieved for processing and rendering. Return a rejected promise to stop the chart initialization with a suitable error message.

```js
Fliplet.Hooks.on('afterChartQuery', fn);
```

#### Parameters

- `fn` (Function(`data`)) Callback function with an object parameter.
  - `options` (Object) A map of data containing the following.
    - `records` (Array) Collection of records to be used for the component. This would be the last point in the process for the data to be manipulated before the chart renders it. The records can be found in `records.dataSourceEntries`.
    - `config` (Object) Configuration used to initialize the component
    - `id` (Number) Component instance ID
    - `uuid` (String) Component instance UUID
    - `type` (String) Chart type

#### Usage

**Filter retrieved data before further processing and render**

```js
Fliplet.Hooks.on('afterChartQuery', function (options) {
  // Filter out entries with the Color "green"
  _.remove(options.records.dataSourceEntries, function (record) {
    return record.data.Color === 'green';
  });
});
```

### `beforeChartRender`

The hook is run before the chart is rendered. Return a rejected promise to stop the chart from rendering with suitable a error message.

```js
Fliplet.Hooks.on('beforeChartRender', fn);
```

#### Parameters

- `fn` (Function(`data`)) Callback function with an object parameter.
  - `options` (Object) A map of data containing the following.
    - `config` (Object) Configuration used to initialize the component
    - `chartOptions` (Object) Configuration used to initialize the Highcharts instance
    - `id` (Number) Component instance ID
    - `uuid` (String) Component instance UUID
    - `type` (String) Chart type

#### Usage

**Set the chart with a custom subtitle**

```js
Fliplet.Hooks.on('beforeChartRender', function (options) {
  options.chartOptions.subtitle.text = 'Loaded on ' + moment().format();
});
```

### `afterChartRender`

The hook is run after the chart is rendered.

```js
Fliplet.Hooks.on('afterChartRender', fn);
```

#### Parameters

- `fn` (Function(`data`)) Callback function with an object parameter.
  - `options` (Object) A map of data containing the following.
    - `chart` (Object) Highcharts instance
    - `config` (Object) Configuration used to initialize the component
    - `chartOptions` (Object) Configuration used to initialize the Highcharts instance
    - `id` (Number) Component instance ID
    - `uuid` (String) Component instance UUID
    - `type` (String) Chart type

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
