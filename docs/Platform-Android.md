# Advanced features for the Android platform

## Targeting Android devices 

Fliplet uses `Modernizr` to expose boolean flags which can help you targeting a specific platform when writing Javascript code for your apps:

```js
if (Modernizr.android) {
  // code here will only run on Android devices
}
```

## Enable the use of back button

Fliplet apps by default prevent the device back button from navigating to the previous page, but you can easily enable such behaviour by adding this snippet into the Javascript code of a specific screen or even the global one:

```js
document.addEventListener('backbutton', function () {
  Fliplet.Navigate.back();
}, false);
```

---

[Back to home](README.md)
{: .buttons}