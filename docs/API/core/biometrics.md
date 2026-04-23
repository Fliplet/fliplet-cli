# `Fliplet.User.Biometrics`

Check biometric availability and verify users with Face ID, Touch ID, or fingerprint inside native Fliplet apps.

_Biometrics are only available in native apps on supported devices._

### Check biometrics availability

Use the `Fliplet.User.Biometrics.isAvailable()` method to check whether biometrics are available on the device. The promise is rejected when biometrics are not available.

The available types are:

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

### Ask the user for biometric verification

Use the `Fliplet.User.Biometrics.verify()` method to verify the user using fingerprint or facial recognition.

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
