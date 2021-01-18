# Biometrics

_Biometrics are only available in native apps on supporting devices._

### Check biometrics availability

Use the `Fliplet.User.Biometrics.isAvailable()` method to checks whether biometrics are available on the device. The promise is rejected when biometrics are not available.

The avilable types are:

- `face` iOS and Android
- `finger` Android only
- `touch` iOS only

```js
Fliplet.User.Biometrics.isAvailable().then(function (type) {
  // Biometrics are available
}, function (err) {
  // Biometrics are not available
  console.error(err);
});
```

### Ask user for biometric verification

Use the `Fliplet.User.Biometrics.verify()` method to verify the user using fingerprint or facial recogition.

```js
Fliplet.User.Biometrics.verify({
  title: 'Unlock your app',
  description: '' // (optional)
}).then(function () {
  // Verification passed
}, function (err) {
  // The popup is dismissed because the user canceled
  console.error(err);
});
```
