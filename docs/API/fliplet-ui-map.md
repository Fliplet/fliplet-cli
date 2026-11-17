---
title: "Fliplet.UI.MapField()"
description: "Render an interactive Google map with a location marker, a linked address input and methods for reading and setting the location."
type: api-reference
tags: [js-api, map, google-maps, geocoding]
v3_relevant: false
deprecated: false
exclude_from_v3_catalog: true
---
# `Fliplet.UI.MapField()`

`Fliplet.UI.MapField()` renders an interactive Google map in an existing element. In editable mode, choosing a location places a marker and fills a linked address input when Google can resolve the point to an address.

## Before You Start

- Add `fliplet-ui-address` to the screen or app libraries. It includes both `MapField` and [`AddressField`](fliplet-ui-address). The Fliplet runtime supplies jQuery through `fliplet-core`.
- Mount a visible container and give it an explicit, non-zero height. For address synchronisation, also mount a wrapper containing an `<input type="text">`. The library supplies the map and its controls. Plain HTML, CSS for sizing and JavaScript are sufficient.
- The map loads the Google Maps JavaScript SDK through the app's Fliplet API context using Fliplet's Maps configuration. The device location control also requires location support and permission. Error messages use [`Fliplet.UI.Toast`](fliplet-ui-toast), which standard Fliplet app pages load through `fliplet-pages`.

## Quickstart

This example starts the map over Trafalgar Square. The user chooses a point by clicking the map or dragging the marker.

1. Add a labelled address field, a map container and a status message to the screen.

   ```html
   <div id="venue-map-address">
     <label for="venue-address-text">Venue address</label>
     <input id="venue-address-text" type="text" readonly>
   </div>
   <div id="venue-map" style="height: 320px"></div>
   <p id="venue-map-status" role="status">Choose a point when the map appears.</p>
   ```

2. Run this JavaScript after the elements are mounted. The example assumes `fliplet-ui-address` is an eager dependency. If you registered it as lazy, also await `Fliplet.require.lazy.chain('fliplet-ui-address')` before constructing the map. See [loading dependencies](core/require).

   ```js
   Fliplet().then(function () {
     const map = Fliplet.UI.MapField('#venue-map', '#venue-map-address', {
       mapCenter: { lat: 51.508, lng: -0.128 },
       zoomLevel: 16
     });
     const status = document.querySelector('#venue-map-status');

     map.change(function (location) {
       if (!location) {
         status.textContent = 'Choose a point on the map.';
         return;
       }

       if (Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
         status.textContent = 'Selected coordinates: ' + location.lat + ', ' + location.lng;
       }
     });
   });
   ```

3. Click near Trafalgar Square. A marker appears and its coordinates can be read with `.get()`. Once Google resolves the point to an address, the linked input and status update. Drag the marker to a nearby street and confirm that the fields update again.

Use one map instance per page with the current implementation. If the map is part of a framework component, initialise it on the mounted DOM element after it becomes visible.

## API Reference

### `Fliplet.UI.MapField(targetMap, targetAddress, options)`

Creates and returns a controller immediately and starts loading the map asynchronously. On a container that already has a controller, the same call returns the existing controller and uses its original configuration.

| Argument | Type | Description |
| --- | --- | --- |
| `targetMap` | CSS selector, DOM element or jQuery object | Visible element in which to render the map. The controller exposes its jQuery wrapper as `$targetMap`. |
| `targetAddress` | CSS selector, DOM element or jQuery object | Wrapper for the linked text input. Pass an existing wrapper for map clicks, marker dragging and device location. |
| `options` | Object | Optional initial map settings. |

| Option | Default | Description |
| --- | --- | --- |
| `mapCenter` | `{ lat: 51.5074, lng: -0.1278 }` | Initial centre as numeric latitude and longitude. To start with a marker, see `value`. |
| `zoomLevel` | `8` | Initial zoom. The existing implementation treats `0` as the default. Setting a marker programmatically sets the zoom to `12`. |
| `mapType` | `'roadmap'` | Initial map type. The map type control offers `roadmap`, `satellite`, `hybrid` and `terrain`. |
| `disableDefaultUI` | `true` | Toggles Google's default controls. The map type, zoom and device location controls have their own configuration. |
| `zoomControl` | `true` | Shows the map zoom control when enabled. |
| `readonly` | `false` | Disables map gestures, click-to-place and marker dragging. Programmatic changes, map type selection and the device location control remain available. |
| `value` | Omitted | Initial marker. Supply an object with an `address` string and a `latLong` string in `'lat/lng'` format. Both properties must be non-empty. The implementation geocodes `address` to place the marker. |

### `.get()`

Returns the current marker coordinates as `{ lat, lng }`, where both properties are numbers. Returns `null` before a marker has been placed or after it is cleared.

### `.set(location, triggerChange = true)`

Centres the map and places or moves the marker at zoom level `12`. Pass a coordinate object `{ lat, lng, address? }` or an address string to geocode. The returned promise resolves to `undefined` after successful placement. Passing `false` as the second argument suppresses the setter's change event. The setter updates the map. Update the linked text separately with [`AddressField.set()`](fliplet-ui-address#set) if your app needs it.

Call `.set()` after the map has rendered. The controller has no readiness promise. A coordinate of `0` in either axis is currently handled incorrectly. The address-string form can leave its promise pending when geocoding fails. Use the interactive selection in the quickstart when your app needs an address picked on the map.

### `.clear(triggerChange = true)`

Removes an existing marker and returns `undefined`. On removal, the controller sends `null` to change listeners unless `triggerChange` is `false`. The linked input and cached address retain their previous values. To clear the input, also call [`AddressField.clear()`](fliplet-ui-address#clear).

### `.change(fn)`

Registers a callback for map changes and returns `undefined`. The callback receives one argument and runs with the controller as `this` when declared as a regular function. Register once per mounted container.

| Source | Callback Argument |
| --- | --- |
| Click or drag followed by successful reverse geocoding, or a successfully geocoded initial `value` | `{ lat, lng, address }` with numeric coordinates and an address string. |
| `.set({ lat, lng, address })` | `{ lat, lng, address }` with the supplied numeric coordinates and optional address. |
| `.set(addressString)` | `{ lat, lng, addressComponents }`. In the current implementation, `lat` and `lng` are Google coordinate functions on this path. Read the numeric position with `.get()`. |
| Remove an existing marker with `.clear()` | `null`. |

A single device location selection can produce an event when the marker moves and a second event when the address is resolved. A click or drag can move the marker without a change event if reverse geocoding finds no address.

### `.getTotalAddress()`

Returns `undefined` until a successful address-string `.set()` or reverse geocode stores an address. The object has an `address` string and a `latLong` string in `'lat/lng'` format. The address-string setter also stores `addressComponents` with the [normalised fields](#extractaddresscomponentscomponents). This is a cached address. Use `.get()` to read the current marker position after setting coordinates or clearing the marker.

### `.getAddressComponents(address)`

Geocodes an address string using Google's browser SDK. After a successful match it resolves to the [normalised address object](#extractaddresscomponentscomponents). The current implementation can resolve to `null` on a thrown error or leave the promise pending when Google reports no match or a geocoding error. If you already have a Google place ID from a suggestion, use [`AddressField.getAddressComponents(id)`](fliplet-ui-address#getaddresscomponents) to resolve the selected place.

### `.extractAddressComponents(components)`

Converts an array of Google address components into an object with six string properties. The method reads each component's `types` and `long_name`. Missing fields are empty strings.

| Returned Property | Google Component Type |
| --- | --- |
| `streetNumber` | `street_number` |
| `streetName` | `route` |
| `city` | `locality`, falling back to `postal_town` |
| `state` | `administrative_area_level_1` |
| `country` | `country` |
| `postalCode` | `postal_code` |

### `.handleLocationPermissions()`

Requests the device's current position and starts moving the marker when a position is available. Use it only after the map renders. It returns a promise for the permission and position request. Marker placement and reverse geocoding can still be in progress after the promise resolves. Permission errors are shown via a toast when the location request reports them.

### `.checkIfAddressChangedByDragging(isDragged)`

Reads or sets the controller's internal map interaction flag. Omit `isDragged` to read the flag, or pass a boolean to set and return it. The flag can also be set by map clicks and device location. Use `.change()` and `.get()` to track the selected point.

### `.getGeocoder()`

Returns the Google Maps geocoder instance when available, or `undefined`. The geocoder may be available while the map is still loading.

### `.displayToastMessage(message)`

Shows a dismissible Fliplet toast with the supplied message string. It returns `undefined`.

### `Fliplet.UI.MapField.get(targetMap)`

Retrieves the controller associated with the supplied selector, DOM element or jQuery object. Returns `undefined` before a controller is attached. The instance method `.get()` reads marker coordinates.

## Troubleshooting

| Symptom | What to Check |
| --- | --- |
| Map remains blank | Confirm the package is loaded and the container is mounted, visible and has a non-zero height. Check that the app can reach Fliplet and load Google Maps. |
| Marker moves and the address is unchanged | Check that the linked wrapper contains a text input. Google must resolve the selected point to an address before the input updates. |
| Controller exists and an early `.set()` fails | Wait until the map has rendered before calling it. For an initial view, set `mapCenter`. For an initial address marker, provide both `value.address` and `value.latLong`. |
| Clearing the marker leaves text in the input | Clear the linked address separately. |

## Related

- [Address field](fliplet-ui-address)
- [Fliplet.UI](fliplet-ui)
