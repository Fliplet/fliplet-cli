---
title: Data Source subscriptions
description: "Subscribe to Data Source changes, handle entry payloads, and stop monitoring when a screen is hidden or removed."
type: api-reference
tags: [js-api, datasources, subscriptions]
v3_relevant: true
deprecated: false
---
# Data Source subscriptions

`connection.subscribe()` delivers changed entries to a callback. Online connections poll for changes; native connections with a working offline database receive incremental-update events.

## Before subscribing

The app must support incremental updates. `subscribe()` throws synchronously when incremental updates are disabled or the callback is missing. Establish a [Data Source connection](../fliplet-datasources) first.

A subscription reports changes after registration, not the initial dataset. Read the initial rows separately. For [authorization tests](testing-security), use an online connection and direct reads or writes as the signed-in actor; a subscription callback is not proof of server authorization.

## Register and clean up

Both signatures return a subscription handle immediately:

```js
connection.subscribe(callback);
connection.subscribe(options, callback);
```

This example logs changes and returns a cleanup function. The app must have incremental updates enabled and access to a Data Source named `Products`.

```js
async function watchProducts() {
  if (!Fliplet.App.supportsIncrementalUpdates()) {
    throw new Error('Enable incremental updates before subscribing.');
  }

  const connection = await Fliplet.DataSources.connectByName('Products', {
    offline: false
  });

  const subscription = connection.subscribe((changes) => {
    for (const entry of changes.inserted || []) {
      console.log('Inserted product:', entry.id, entry.data.Name);
    }
    for (const entry of changes.updated || []) {
      console.log('Updated product:', entry.id, entry.data.Name);
    }
    for (const entry of changes.deleted || []) {
      console.log('Deleted product:', entry.id);
    }
  });

  function onVisibilityChange() {
    if (document.hidden && subscription.status() === 'active') {
      subscription.pause();
    } else if (!document.hidden && subscription.status() === 'paused') {
      subscription.resume();
    }
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  onVisibilityChange();

  return function stopWatching() {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    subscription.unsubscribe();
  };
}

const stopWatchingProducts = await watchProducts();
// Call stopWatchingProducts() when the screen is removed.
```

Change a product from another session to observe a callback. Call the returned cleanup function when leaving the screen; placing that call immediately after registration would end the subscription before it can deliver changes.

## Options and callback results

| Option | Type | Default | Behavior |
|---|---|---|---|
| `events` | Array of strings | `['insert', 'update', 'delete']` | Selects insert and update notifications. Deletion entries can still be delivered with an event subset; callbacks must handle or ignore `deleted` explicitly. |
| `cursor` | Cursor handle | None | Limits delivered entries to IDs contained in that cursor. See [reading data](reading-data). |
| `filter` | Function | None | Called with an entry object. Returning a falsy value omits the entry from the callback. |

For ID or field matching, use a filter function. Object-valued `filter` is not applied to callback delivery. The SDK also recognizes an `id` option, but cleanup of ID-scoped subscriptions is unreliable; use the function form instead.

```js
const connection = await Fliplet.DataSources.connectByName('Products', {
  offline: false
});
const subscription = connection.subscribe({
  filter: entry => entry.id === 101 || (entry.data && entry.data.Category === 'Accessories')
}, changes => console.log(changes));
// Call subscription.unsubscribe() on screen teardown.
```

The callback receives an object with any of these nonempty arrays:

```js
const exampleChanges = {
  inserted: [{ id: 101, data: { Name: 'USB-C hub' }, createdAt: '...', updatedAt: '...' }],
  updated: [{ id: 102, data: { Name: 'Desk lamp' }, createdAt: '...', updatedAt: '...' }],
  deleted: [{ id: 103 }]
};
```

Keys with no matching entries are omitted. An empty change set does not trigger the callback. An updated entry is classified as an insert when its `createdAt` and `updatedAt` values are equal; otherwise it is classified as an update. Deleted entries may contain less data than other entries, so ID-based removal does not require `entry.data`.

## Subscription handle

These methods are synchronous and do not return promises.

| Method | Result | Behavior |
|---|---|---|
| `status()` | `'active'` or `'paused'` | Reports the handle's current monitoring status. |
| `pause()` | `undefined` | Stops delivery to this subscription. Monitoring stops when no active subscriptions remain on its connection. |
| `resume()` | `undefined` | Makes the subscription active. When it restarts online monitoring, a check is scheduled immediately. |
| `unsubscribe()` | `undefined` | Removes the subscription. Monitoring stops when no active subscriptions remain. |
| `updateOptions(options)` | `undefined` | Replaces the options object; it does not merge options. |

`unsubscribe()` does not change `status()` to an “unsubscribed” value. Treat disposal as final and create a new subscription to subscribe again. The exposed `isInScope(entry)` helper has different matching behavior from callback delivery; use the options above for application filtering rather than treating that helper as a delivery guarantee.

```js
subscription.updateOptions({
  events: ['update'],
  filter: entry => !!entry.data && entry.data.Category === 'Accessories'
});
```

This replaces earlier options, including an earlier cursor or filter. The callback remains the one supplied at registration.

## Delivery timing and usage

Online monitoring waits 30 seconds between completed checks. Network time, failures and browser timer scheduling add to that interval. There is no public subscription option for changing the interval, and no guarantee of instant notification.

Subscriptions on a reused connection share monitoring. Pausing one subscription does not stop requests needed by another active subscription on that connection. Resuming while shared monitoring is already active does not force an immediate check or guarantee delivery of every change from the paused period.

Native connections with a working offline database use incremental-update events instead of the online polling timer. If the local database cannot be loaded, the connection falls back to online monitoring. Pausing and resuming does not make the native update mechanism fetch on demand.

Keep visibility cleanup even when the UI framework unmounts screens correctly. Avoid adding a second polling timer unless the application has a separately established need; it creates additional reads. Polling failures are logged and monitoring schedules another check; the subscription API has no error-callback parameter.

## Framework lifecycle integration

### Vue

Use the plain JavaScript `watchProducts()` function above. Handle the case where setup finishes after the component has already unmounted.

```js
import { onMounted, onUnmounted } from 'vue';

let stopWatching;
let disposed = false;

onMounted(async () => {
  try {
    const stop = await watchProducts();
    if (disposed) stop();
    else stopWatching = stop;
  } catch (error) {
    console.error('Cannot subscribe to products:', error);
  }
});

onUnmounted(() => {
  disposed = true;
  if (stopWatching) stopWatching();
});
```

### React

Use the same plain JavaScript setup function inside an effect.

```js
import { useEffect } from 'react';

function useProductSubscription() {
  useEffect(() => {
    let disposed = false;
    let stopWatching;

    watchProducts().then(stop => {
      if (disposed) stop();
      else stopWatching = stop;
    }).catch(error => console.error('Cannot subscribe to products:', error));

    return () => {
      disposed = true;
      if (stopWatching) stopWatching();
    };
  }, []);
}
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Registration throws | Confirm incremental updates are enabled and supply a callback function. |
| No initial rows appear | Load the initial dataset with a read; registration does not return current rows. |
| No callback arrives | Confirm access, active status and filter/cursor scope. Allow for online polling or native incremental delivery. |
| Checks continue after hiding a screen | Another active subscription may share the connection. Dispose each screen's handle and visibility listener. |
| A deletion appears despite `events: ['update']` | Ignore unwanted `deleted` entries in the callback; the subset does not suppress deletion delivery. |

[Data Sources API](../fliplet-datasources) · [Offline database](offline-database)
