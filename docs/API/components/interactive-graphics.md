# Interactive Graphics JS APIs

These public JS APIs are available in screens where an **Interactive Graphics** component is present.

## Hooks

The Interactive Graphics component exposes hooks that you can use to modify the component data and behavior. Here are the hooks and their specific life cycle:

- `flInteractiveGraphicsBeforeGetData` Fired before getting data source data
- `flInteractiveGraphicsBeforeRender` Before rendering the maps and markers
- `flInteractiveGraphicsLabelClick` After everything is rendered and the user clicks on the marker label

### `flInteractiveGraphicsBeforeGetData`

This hook is fired before getting data source data.

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeGetData', fn);
```

#### Parameters

- **fn** (Function((Object) `data`)) Callback function with an object parameter
  - **data** (Object) Object containing properties listed below
    - **id** (Number) Component instance ID. This differs between master and production apps.
    - **uuid** (String) Component instance UUID. This is consistent between master and production apps.
    - **config** (Object) Component instance configuration.
    - **container** (DOM) Component instance container element.

### `flInteractiveGraphicsBeforeRender`

This hook is fired before rendering the maps and markers. You can use this hook to load the map with a specific marker selected. This will automatically select the correct map for the specified marker.

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', fn);
```

#### Usage

**Select a marker by ID**

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function () {
  return { markerId: 1234 };
});
```

**Select a marker by name**

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function () {
  return { markerName: 'Marker name' };
});
```

**Select a map by name**

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function () {
  return { mapName: 'Map one' };
});
```

#### Parameters

- **fn** (Function((Object) `data`)) Callback function with an object parameter
  - **data** (Object) Object containing properties listed below
    - **id** (Number) Component instance ID. This differs between master and production apps.
    - **uuid** (String) Component instance UUID. This is consistent between master and production apps.
    - **config** (Object) Component instance configuration.
    - **container** (DOM) Component instance container element.
    - **markers** (Array) List of markers and associated data.

### `flInteractiveGraphicsLabelClick`

This hook is fired after everything is rendered and the user clicks on the marker label. Nothing is expected to be returned.

```js
Fliplet.Hooks.on('flInteractiveGraphicsLabelClick', fn);
```

#### Parameters

- **fn** (Function((Object) `data`)) Callback function with an object parameter
  - **data** (Object) Object containing properties listed below
    - **id** (Number) Component instance ID. This differs between master and production apps.
    - **uuid** (String) Component instance UUID. This is consistent between master and production apps.
    - **config** (Object) Component instance configuration.
    - **container** (DOM) Component instance container element.
    - **selectedMarker** (Object) Selected marker data.

## Configuration

Using the available hooks, component instance configuration can be used to modify component data and behavior. The available configuration properties are listed below:

- `cache` (Boolean) Set to `false` to always retrieve data from the server. **Default**: `true`.
- `getData` (Promise) Function used to return an array of entries. Each entry must include the following properties, which the `Fliplet.DataSources` JS API follows:
  - `id` (Number) Entry ID
  - `data` (Object) Entry data

## Examples

### Use custom data for the mapping

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeGetData', function onBeforeGetData(data) {
  // disable caching the data so it's always retrieved from the server
  data.config.cache = false;

  // Define the "getData" promise to manually fetching data
  data.config.getData = function () {
    // In this example we connect to a data source with ID 123
    // Change the ID to your data source ID
    return Fliplet.DataSources.connect(123)
      .then(function(connection) {
      // Get all entries in the data source matching a specific condition
      return connection.find({
        where: { column: 'value' }
      });
    });
  };
});
```

### Initialize the component with a specific marker or map

```js
// Select marker with ID 1234
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { markerId: 1234 };
});

// Select marker with name 'Marker one'
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { markerName: 'Marker one' };
});

// Select map with name 'Map one'
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { mapName: 'Map one' };
});
```

### Navigate to a screen when a marker is clicked

```js
Fliplet.Hooks.on('flInteractiveGraphicsLabelClick', function onLabelClick(data) {
  return Fliplet.Navigate.screen(123);
});
```

---

[Back](../../API-Documentation.md)
{: .buttons}