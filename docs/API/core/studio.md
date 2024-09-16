# Studio

## Send event to Fliplet Studio

```js
Fliplet.Studio.emit('foo', { bar: 1 });
```

**Parameters**

```js
Fliplet.Studio.emit(event, payload);
```

- `event` (String) **Required** Event to send to Fliplet Studio
- `payload` (Mixed) Optional payload to send to Fliplet Studio

## Listen to events from Fliplet Studio

- Events are emitted from widget interface using `Fliplet.Studio.emit('page-preview-send-event', payload)`

```js
Fliplet.Studio.onEvent(function(event) {
  if (event.detail.event === 'reload-widget-instance') {
    // Reload widget instance
  }
});
```

**Parameters**

```js
Fliplet.Studio.onEvent(fn);
```

- `fn` (Function(`event`)) Callback function to handle events
  - `event` (Object) Event received from Fliplet Studio
    - `detail` (Object) Payload data from event

## Handle messages from Fliplet Studio

- Commonly used provider interface
- Messages are usually emitted to providers, e.g. `provider.emit()`

```js
Fliplet.Studio.onMessage(function(message) {
  // message.data - data from the message received
});
```

**Parameters**

```js
Fliplet.Studio.onMessage(fn);
```

- `fn` (Function(`event`)) Callback function to handle messages
  - `message` (Object) Message received from Fliplet Studio
    - `data` (Object) Payload data from message

## Examples

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

### Send data from widget interface to a provider

```js
var provider = Fliplet.Widget.open(package, {
  selector: '#provider-container'
});

provider.emit('set-data', { foo: 'bar' });
```

In the provider interface, use `Fliplet.Studio.onMessage()` to handle the message.

```js
Fliplet.Studio.onMessage(function(message) {
  console.log(message.data.event); // set-data
  console.log(message.data.foo); // bar
});
```

### Navigate to a page in Fliplet Studio

```js
Fliplet.Studio.emit('navigate', {
  name: 'appSettingsGeneral', // Route name
  params: { appId: 11 } // Parameters to pass to the route
});
```
