---
title: "Fliplet.UI.AddressField()"
description: "Read and update an address input, fetch Google Places suggestions, and retrieve structured address components for a selected place."
type: api-reference
tags: [js-api, address, autocomplete, google-maps]
v3_relevant: true
deprecated: false
exclude_from_v3_catalog: true
---
# `Fliplet.UI.AddressField()`

`Fliplet.UI.AddressField()` manages the text value of an existing address input and provides methods for fetching Google Places suggestions and address components. The app owns when to request suggestions, how to present them and what to save when the user selects a result.

## Before You Start

- Add `fliplet-ui-address` to the screen or app libraries. It includes both `AddressField` and [`MapField`](fliplet-ui-map). The Fliplet runtime supplies jQuery through `fliplet-core`. Plain HTML and JavaScript are sufficient.
- Mount a wrapper with one descendant `<input type="text">`. The constructor takes the wrapper. The wrapper, input and any suggestion list can use your app's own styles.
- Google Places requests use the app's Fliplet API context and Fliplet's Google Maps configuration. Address lookup needs a network connection. The text input and its value methods also work when lookup is unavailable.

## Quickstart

Add this HTML to the screen.

```html
<div id="delivery-address-field">
  <label for="delivery-address">Delivery address</label>
  <input id="delivery-address" type="text">
</div>
<p id="delivery-address-status" role="status"></p>
```

Run this JavaScript after the wrapper is mounted. This example assumes the package has been added as an eager dependency. If you registered it as lazy, also await `Fliplet.require.lazy.chain('fliplet-ui-address')` before constructing the field. See [loading dependencies](core/require).

```js
Fliplet().then(function () {
  const field = Fliplet.UI.AddressField('#delivery-address-field');
  const status = document.querySelector('#delivery-address-status');

  field.change(function (value) {
    status.textContent = value ? 'Delivery address: ' + value : 'Enter a delivery address.';
  });

  field.set('44 Trafalgar Square, London');
});
```

The status shows the initial address and updates when the user types. The same wrapper works in Vue or React. Initialise it from a mounted DOM ref and use the field's change callback to keep app state in sync.

## API Reference

### `Fliplet.UI.AddressField(el)`

Creates and returns the controller for `el`. It accepts a CSS selector, a DOM element or a jQuery object. Passing the same wrapper again returns its existing controller. A missing wrapper throws an error. The controller's `$el` property is the jQuery-wrapped element.

### `.get()`

Returns the current input value as a string. An empty input returns `''`.

### `.set()`

Sets the address text. `value` is a string. The method returns `undefined` and calls the registered change callbacks unless `triggerChange` is exactly `false`. For example, use `field.set(savedAddress, false)` to restore the text silently.

### `.clear()`

Empties the input and returns `undefined`. It calls the registered change callbacks with `''` unless `triggerChange` is exactly `false`.

### `.change()`

Registers a callback and returns `undefined`. The callback receives the current text as its only argument, with the controller as `this` when using a regular function. It runs on the DOM `input` event and after `.set()` or `.clear()` when callbacks are enabled. A change can be typed or set programmatically. Store the selected place ID separately if the app needs to know whether the user picked a suggestion.

The registration lasts for that controller. Register once per mounted wrapper.

### `.getAutocompleteSuggestions()`

Looks up suggestions for the `input` string. Pass an array of two-letter country codes, such as `['GB']`, or pass `[]` for an unrestricted lookup. A successful lookup resolves to an array of objects with a `label` string for display and an `id` string containing the Google place ID. A successful lookup with zero matches resolves to `[]`. Await the call inside `try/catch` to handle request failures or invalid responses.

```js
const suggestions = await field.getAutocompleteSuggestions('44 Trafalgar Square', ['GB']);
// Each suggestion has the shape { label: '44 Trafalgar Square, London, UK', id: '…' }.
```

### `.getAddressComponents()`

Looks up the address components for a suggestion's Google place ID. On success, it resolves to an array of Google address component objects. Each has a `long_name`, a `short_name` and a `types` array. The response can omit components, so find each component by type and handle missing values. For example, a country component can look like this.

```json
{
  "long_name": "United Kingdom",
  "short_name": "GB",
  "types": ["country", "political"]
}
```

Use `Array.isArray(components)` before consuming the result. An unsuccessful request can leave the result `undefined`.

### `Fliplet.UI.AddressField.get()`

Retrieves the controller associated with `el`. Returns `undefined` if the element has no controller. This is the static lookup method. The instance method `.get()` reads the text value.

## Worked Example — Address Lookup and Selection

This example keeps manual entry available and shows Google Places suggestions as ordinary keyboard-accessible buttons. The lookup is debounced and only the latest request can update the list. The example reads a postcode after selection when Google supplies one.

1. Add this markup to a screen with `fliplet-ui-address` registered as a lazy dependency.

   ```html
   <div id="venue-address-field">
     <label for="venue-address">Venue address</label>
     <input id="venue-address" type="text" autocomplete="off"
       aria-describedby="venue-address-status">
   </div>
   <p id="venue-address-status" role="status"></p>
   <ul id="venue-address-suggestions" aria-label="Suggested addresses"></ul>
   ```

2. Run this JavaScript after the elements are mounted.

   ```js
   Fliplet().then(async function () {
     const wrapper = document.querySelector('#venue-address-field');
     const input = document.querySelector('#venue-address');
     const suggestions = document.querySelector('#venue-address-suggestions');
     const status = document.querySelector('#venue-address-status');

     try {
       await Fliplet.require.lazy.chain('fliplet-ui-address');
     } catch {
       status.textContent = 'Address lookup is unavailable. You can enter the address manually.';
       return;
     }

     if (!wrapper.isConnected) return;

     const field = Fliplet.UI.AddressField(wrapper);
     let timer;
     let revision = 0;

     field.change(function (value) {
       clearTimeout(timer);
       const request = ++revision;
       const query = value.trim();
       suggestions.replaceChildren();
       status.textContent = '';

       if (query.length < 3) return;

       timer = setTimeout(async function () {
         if (!wrapper.isConnected) return;

         try {
           const matches = await field.getAutocompleteSuggestions(query, ['GB']);

           if (request !== revision || !wrapper.isConnected) return;

           status.textContent = matches.length
             ? matches.length + ' suggested addresses. Use Tab to reach the suggestions.'
             : 'No suggested addresses. You can enter the address manually.';

           for (const match of matches) {
             const item = document.createElement('li');
             const button = document.createElement('button');
             button.type = 'button';
             button.textContent = match.label;
             button.addEventListener('click', async function () {
               const selection = ++revision;
               field.set(match.label, false);
               input.focus();
               suggestions.replaceChildren();
               status.textContent = 'Address selected. Looking up details.';

               try {
                 const components = await field.getAddressComponents(match.id);

                 if (selection !== revision || !wrapper.isConnected) return;

                 if (!Array.isArray(components) || components.length === 0) {
                   status.textContent = 'Address selected. Address details are unavailable.';
                   return;
                 }

                 const postcode = components.find(function (component) {
                   return component.types.includes('postal_code');
                 });
                 status.textContent = postcode
                   ? 'Address selected. Postcode: ' + postcode.long_name
                   : 'Address selected.';
               } catch {
                 if (selection === revision && wrapper.isConnected) {
                   status.textContent = 'Address selected. Address details are unavailable.';
                 }
               }
             });

             item.append(button);
             suggestions.append(item);
           }
         } catch {
           if (request === revision && wrapper.isConnected) {
             status.textContent = 'Address lookup is unavailable. You can enter the address manually.';
           }
         }
       }, 300);
     });
   });
   ```

3. Type part of a UK address, such as `44 Trafalgar`. Tab to a suggestion and press Enter. The input takes the selected label and the status reports the postcode if available. Try changing the text again while a lookup is in progress and confirm that results for the earlier text stay out of the list.

## Troubleshooting

| Symptom | What to Check |
| --- | --- |
| The constructor reports a missing target or the field value is empty | Run it after mounting the wrapper. Confirm the wrapper contains the text input and pass the wrapper to the constructor. |
| Typing updates the value and the list stays empty | Call `.getAutocompleteSuggestions()` from the app's input or change handler and render the returned items. Pass `[]` if you want to test without a country restriction. |
| The input works and lookup fails | Keep manual entry available. Check the app's Fliplet API connection and Maps usage limits. |
| A selected result has no postcode or street number | Look up the component by type and leave it blank when the provider omits it. |

## Related

- [Map field](fliplet-ui-map)
- [Fliplet.UI](fliplet-ui)
