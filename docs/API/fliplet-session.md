# Session JS APIs

The `fliplet-session` package contains the following namespaces:

- [Session](#session)

---

## Session

### Get the current session

```js
Fliplet.Session.get().then(function onSessionRetrieved(session) {

});
```

### Get a key from the current session

```js
Fliplet.Session.get(key).then(function onSessionKeyRetrieved(value) {

});
```

### Set new values into the current session

```js
Fliplet.Session.set({ foo: 'bar' }).then(function onSessionUpdated() {

});
```

### Clear all values from the current session

```js
Fliplet.Session.clear().then(function onSessionCleared() {

});
```

### Destroys the current session

```js
Fliplet.Session.destroy().then(function onSessionDestroyed() {

});
```
