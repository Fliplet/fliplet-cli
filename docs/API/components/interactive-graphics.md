# Interactive Graphics JS APIs

These public JS APIs will be automatically available in your screens once a **Interactive graphics** component is dropped into such screens.

## Run a hook before getting the markers data

```js
Fliplet.Hooks.on('flInteractiveMapBeforeGetData', function onBeforeGetData(data) {
  // data - Object with the properties 'config', 'container', 'id' and 'uuid'
  // data.id - Number of the component's ID
  // data.uuid - String of the componet's UUID
  // data.config - Object containing the component's configuration
  // data.container - Object the component's DOM selector

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

## Run a hook before rendering the map and markers
### Initialize on a specific marker by ID

```js
Fliplet.Hooks.on('flInteractiveMapBeforeRenderMap', function onBeforeRender(data) {
  // data - Object with the properties 'markers, 'config', 'container', 'id' and 'uuid'
  // data.id - Number of the component's ID
  // data.uuid - String of the componet's UUID
  // data.config - Object containing the component's configuration
  // data.container - Object the component's DOM selector
  // data.markers - Array of the markers data

  // Define the "startOnMarker" promise
  data.config.startOnMarker = function () {
    // Resolve an object with the specific marker ID
    return Promise.resolve({
      id: 1234
    });
  };
});
```

### Initialize on a specific marker by Name

```js
Fliplet.Hooks.on('flInteractiveMapBeforeRenderMap', function onBeforeRender(data) {
  // data - Object with the properties 'markers, 'config', 'container', 'id' and 'uuid'
  // data.id - Number of the component's ID
  // data.uuid - String of the componet's UUID
  // data.config - Object containing the component's configuration
  // data.container - Object the component's DOM selector
  // data.markers - Array of the markers data

  // Define the "startOnMarker" promise
  data.config.startOnMarker = function () {
    // Resolve an object with the specific marker name
    return Promise.resolve({
      name: 'Marker one'
    });
  };
});
```

### Initialize on a specific map

```js
Fliplet.Hooks.on('flInteractiveMapBeforeRenderMap', function onBeforeRender(data) {
  // data - Object with the properties 'markers, 'config', 'container', 'id' and 'uuid'
  // data.id - Number of the component's ID
  // data.uuid - String of the componet's UUID
  // data.config - Object containing the component's configuration
  // data.container - Object the component's DOM selector
  // data.markers - Array of the markers data

  // Define the "startOnMap" promise
  data.config.startOnMap = function () {
    // Resolve an object with the specific map name
    return Promise.resolve({
      name: 'Map one'
    });
  };
});
```

## Run a hook on marker label click

```js
Fliplet.Hooks.on('flInteractiveMapOnLabelClick', function onLabelClick(data) {
  // data - Object with the properties 'selectedMarker, 'config', 'container', 'id' and 'uuid'
  // data.id - Number of the component's ID
  // data.uuid - String of the componet's UUID
  // data.config - Object containing the component's configuration
  // data.container - Object the component's DOM selector
  // data.selectedMarker - Object with the data of the selected marker

  // Define the "labelAction" function
  data.config.labelAction = function () {
    // Navigate to another screen
    Fliplet.Navigate.screen(123);
  };
});
```

---

[Back](../../API-Documentation.md)
{: .buttons}