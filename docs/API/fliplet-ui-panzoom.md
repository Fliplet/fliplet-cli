# `Fliplet.UI.PanZoom`

These public JS APIs will be automatically available in your screen once an Interactive graphics component is dropped into a screen.
You can also add the dependency `fliplet-ui-panzoom` in Developer options -> Resources

## Create an instance
`Fliplet.UI.PanZoom.create(selector, options)`

- **selector** (String | HTML DOM | jQuery DOM Object) [Required] Defines which element will have pan/zoom function
- **options** (Object) An object containing the options for the pan/zoom functionality (**Default**: `{}`)
  - **baseZoom** (Number) The amount of zoom applied when initialized (**Default**: `1`)
  - **doubleTapZoom**: (Number) The amount of zoom the element will zoom in, when it is double tapped (**Default**: `2`)
  - **minZoom**: (Number) The minimum zoom value (**Default**: `1`)
  - **maxZoom**: (Number) The maximum zoom value (**Default**: `4`)
  - **animDuration**: (Number) The zoom in and out animation duration in seconds (**Default**: `0.1`)
  - **force3D**: (Boolean | 'auto') If `true` it will force the content to use 3D acceleration. If value is `'auto'`, it will use 3D acceleration while zooming or panning and resets removes 3D acceleration after zooming or panning is complete. (**Default**: `true`)
  - **zoomStep**: (Number) Determines how much scale you want to add or remove in the image when zooming (**Default**: `0.5`)
  - **allowDrag**: (Boolean) If `true`, it allows dragging the content when it is larger than its parent holder. (**Default**: `true`)
  - **allowZoom**: (Boolean) If `true`, it allows content zooming. (**Default**: `true`)
  - **allowMouseWheelZoom**: (Boolean) If `true`, it allows zooming using the mouse wheel. (**Default**: `true`)
  - **allowPinchZoom**: (Boolean) If `true`, it allows zooming using the pinch gesture on mobile devices. (**Default**: `true`)
  - **showZoomControls**: (Boolean) If `true`, it will show a zoom in and zoom out buttons on the bottom right corner. (**Default**: `true`)

### Usage example
```
var flPanZoom = Fliplet.UI.PanZoom.create($('.selector'), {
  minZoom: 0.5,
  maxZoom: 6,
  allowMouseWheelZoom: false
});
```

## Get instance by ID or Index
### By ID
`Fliplet.UI.PanZoom.getById(ID)`

### By Index
`Fliplet.UI.PanZoom.getByIndex(Index)`

### Get all instances
`Fliplet.UI.PanZoom.getAll()`

### Destroy instance
`Fliplet.UI.PanZoom.destroy(ID)`

## Instance methods
The `flPanZoom` instance variable above makes available the following instance methods.

### Get ID
`flPanZoom.getId()`

### Destroy the instance
`flPanZoom.destroy()`

### Attach an event handler function for one or more events to the selected instance
`flPanZoom.on()`

### Attach a handler to an event for the instance. The handler is executed at most once per instance per event type.
`flPanZoom.one()`

### Remove an event handler
`flPanZoom.off()`

### Zoom element
`flPanZoom.zoom(value, duration)`

- **zoom**: (Number) [Required] The value of zoom
- **duration**: (Number) The duration of the animation when zooming, in seconds

### Zoom in element
`flPanZoom.zoomIn(duration)`

- **duration**: (Number) The duration of the animation when zooming, in seconds

### Zoom out element
`flPanZoom.zoomOut(duration)`

- **duration**: (Number) The duration of the animation when zooming, in seconds

### Get the base zoom value
`flPanZoom.getBaseZoom()`

### Get the current zoom value
`flPanZoom.getCurrentZoom()`

### Get all markers
`flPanZoom.markers.getById(ID)`

### Get all markers
`flPanZoom.markers.getAll()`

### Set new markers by Array or Object
To set markers you will need to create the markers first and the pass them as below.
To see how to create the marker go to [Create a marker](fliplet-ui-panzoom.md#create-a-marker).

** Set a marker (Array) **
`flPanZoom.markers.set([ {...} ])`
** Set a marker (Object) **
`flPanZoom.markers.set({...})`

### Delete all markers
`flPanZoom.markers.removeAll()`

### Delete a marker(s)
`flPanZoom.markers.remove(id, option)`

- **id**: (Number | Object | Array) [Required] If a `Number` it will delete the marker with the same ID. If an `Object` it will check if the object contains the `id` property and delete the marker with the same ID. If an `Array` of `Object` it will iterate through the array of objects and check if each object contains the `id` property and delete the markers with the same ID.
- **option**: (Object) An object containing options for different outcomes when deleting a marker
  - **keepInDom**: (Boolean) If `true` the marker HTML element won't be removed from the DOM (**Default**: `false`)

## Markers
### Create a marker
`Fliplet.UI.PanZoom.Markers.create(selector, options)`

- **selector** (String | HTML DOM | jQuery DOM Object) [Required] Defines which element will have marker functions
- **options** (Object) An object containing the options for the marker functionality (**Default**: `{}`)
  - **x**: (Number) [Required] The X value for the horizontal coordinates of the marker
  - **y**: (Number) [Required] The Y value for the vertical coordinates of the marker
  - **transformOrigin**: (String) The transformation origin is the point around which a transformation is applied (**Default**: `'50% 50%'`)
  - **minZoom**: (Number) The minimum zoom value (**Default**: `0`),
  - **maxZoom**: (Number) The maximum zoom value (**Default**: `999`),
  - **zoom**: (Number) The amount of zoom applied when the Interactive Map is initialized (**Default**: `1`)

**Usage example**
```
var marker = Fliplet.UI.PanZoom.Markers.create($('.marker-selector'), {
  x: 150,
  y: 200
});
```

## Marker instance methods
The `marker` instance variable above makes available the following instance methods.

### Get the current marker options
`marker.vars()`

### Update the marker options
`marker.update(options, forceUpdate)`

- **options**: (Object) [Required] An object containing the new options for the marker functionality (e.g. new coordinates)
- **forceUpdate**: (Boolean) If `true`, the marker HTML element will be updated with the new options (**Default**: `true`)

### Get the marker HTML element from the DOM
`marker.getElement()`

### Scale the marker DOM element
`marker.scale(currentZoom, baseZoom, duration)`

- **currentZoom**: (Number) [Required] A number of the current zoom level
- **baseZoom**: (Number) [Required] A number of the base zoom level
- **duration**: (Number) [Optional] A number for the animation duration - Set it to `0` if you want no animation