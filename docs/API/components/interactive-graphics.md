# Interactive Graphics JS APIs

These public JS APIs will be automatically available in your screens once a **Interactive graphics** component is dropped into such screens.

## Hooks
The Interactive graphics component exposes a few hooks that you can use to modify the data and behaviour of the component, here are the hooks and their specific life cycle:

**Before getting data source data**  
`flInteractiveGraphicsBeforeGetData`

**Before rendering the maps and markers**  
`flInteractiveGraphicsBeforeRender`

**After everything is rendered and the user clicks on the marker label**  
`flInteractiveGraphicsLabelClick`

## Hooks options
### flInteractiveGraphicsBeforeGetData
Data available:

- **data** - Object containing properties listed below
  - **id** - (Number) The component's ID
  - **uuid** - (String) The component's UUID
  - **config** - (Object) The component's configuration settings
  - **container** - (DOM) The component's DOM selector

#### Setting new data
As a developer you can use this hook to get the data manually and modify the data before passing it to the component. You can do that by defining the following.
- **data.config.getData** - (Promise) Required to return an `Array` on entries

### flInteractiveGraphicsBeforeRender
Data available:

- **data** - Object containing properties listed below
  - **id** - (Number) The component's ID
  - **uuid** - (String) The component's UUID
  - **config** - (Object) The component's configuration settings
  - **container** - (DOM) The component's DOM selector
  - **markers** - (Array) The list of markers and their data

As a developer you can use this hook to load the map with a specific marker selected (this will also automatically select the correct map for the selected marker), or load a specific marker. You can do that by returning the following:

- `{ markerId: 1234 }` - Select a marker by ID
- `{ markerId: 1234 }` - Select a marker by Name
- `{ mapName: 'Map one' }` - Select a map

### flInteractiveGraphicsLabelClick
Data available:

- **data** - Object containing properties listed below
  - **id** - (Number) The component's ID
  - **uuid** - (String) The component's UUID
  - **config** - (Object) The component's configuration settings
  - **container** - (DOM) The component's DOM selector
  - **selectedMarker** - (Object) The selected marker data

Nothing is expected to be returned, the developer can write what should happen when the label is clicked

## Usage

### Run a hook before getting the markers data

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeGetData', function onBeforeGetData(data) {
  // disable caching the data so it's always retrieved from the server
  data.config.cache = false;

  // Define the "getData" promise to manually fetching data
  data.config.getData = function () {
    // In this example we connect to a datasource with ID 123
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

### Run a hook before rendering the map and markers
#### Example to initialize on a specific marker by ID

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { markerId: 1234 };
});
```

#### Example to initialize on a specific marker by Name

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { markerName: 'marker one' };
});
```

#### Example to initialize on a specific map

```js
Fliplet.Hooks.on('flInteractiveGraphicsBeforeRender', function onBeforeRender(data) {
  return { mapName: 'marker one' };
});
```

### Run a hook when the marker label is clicked

```js
Fliplet.Hooks.on('flInteractiveGraphicsLabelClick', function onLabelClick(data) {
  return Fliplet.Navigate.screen(123);
});
```

---

[Back](../../API-Documentation.md)
{: .buttons}