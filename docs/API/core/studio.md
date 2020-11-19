# Studio

### Forward an event to Fliplet Studio

```js
Fliplet.Studio.emit('foo', { bar: 1 });
```

### Navigate to a page in Fliplet Studio

```js
Fliplet.Studio.emit('navigate', {
  name: 'appSettingsGeneral', // route name
  params: { appId: 11 } // parameters to pass to the route
});
```

### Sending data from widget interface to app preview

In the interface, run the following code to send data to the app preview.

```js
Fliplet.Studio.emit('page-preview-send-event', { // The `page-preview-send-event` ensures an event is sent to the page preview
  type: 'foo', // Use a suitable type so that code in the page preview can be
  data: {
    bar: 'buzz'
  }
});
```

In the app preview, through custom code or widget code, use the following code to process the events.

```js
// Use this to listen to events from Studio
Fliplet.Studio.onEvent(function (event) {
  if (event.type === 'foo') {
    // Confirm the event is meant to be processed
    // All other attributes sent from the Fliplet.Studio.emit() should also be available
  }
});
```