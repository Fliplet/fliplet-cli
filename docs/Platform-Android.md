# Advanced features for the Android platform

## Targeting Android devices 

Fliplet uses `Modernizr` to expose boolean flags which can help you targeting a specific platform when writing Javascript code for your apps:

```js
if (Modernizr.android) {
  // code here will only run on Android devices
}

if (Fliplet.Env.is('native')) {
  // code here will run on Android, iOS and Windows devices but not on web
}
```

---

## Enable the use of back button

Fliplet apps by default prevent the device back button from navigating to the previous page, but you can easily enable such behaviour by adding this snippet into the Javascript code of a specific screen or even the global one:

```js
document.addEventListener('backbutton', function () {
  // this code will run when the hardware/software back button is pressed
  Fliplet.Navigate.back();
}, false);
```

Please ensure you avoid putting it on screens that can go back to screens you don't want users to access. If you'd prefer to transition to another screen, please check the docs for [Fliplet.Navigate](API/fliplet-core.md#navigate).

---

[Back to home](README.md)
{: .buttons}