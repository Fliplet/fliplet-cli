# Charts

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
    - `id` (Number) Entry ID
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
    - `id` (Number) Entry ID
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
    - `id` (Number) Entry ID
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
    - `id` (Number) Entry ID
    - `uuid` (String) Component instance UUID
    - `type` (String) Chart type

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}