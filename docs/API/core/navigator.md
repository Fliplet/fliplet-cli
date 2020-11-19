# Navigator

### Check whether the device is online

```js
var isOnline = Fliplet.Navigator.isOnline();

if (isOnline) {
  // device is online
} else {
  // device is offline
}
```

### Add event listeners to when the device goes online/offline

```js
Fliplet.Navigator.onOnline(function(){
  console.log('Device just came online.');
});

Fliplet.Navigator.onOffline(function(){
  console.log('Device just went offline.');
});
```

### Wait for the device to be ready before running some code

```js
Fliplet().then(function () {
  // put your code here to ensure all scripts and plugins have been loaded
});
```

### Wait for Cordova plugins to be ready before running some code

```js
Fliplet.Navigator.onPluginsReady().then(function () {
  // your code
});
```

### Get the current device information

Use the `device()` method to retrieve details about the current device, including OS, manufacturer and model.

```js
var device = Fliplet.Navigator.device();

/*
"device" is an object containing these keys:

{
  manufacturer: 'Apple',
  model: 'iPhone',
  platform: 'iOS',
  uuid: 'df25dad2-0716-40e9-2c38-acf41a25cf5b'
}
```

### Get the device/user location

To get the current device's location (including latitude and longitude) using the GPS sensor, use the following method. Please note that the Operative System might ask for user's permission before reading the location. If the user doesn't allow the location to be requested by the app, the promise is rejected as shown below.

```js
Fliplet.Navigator.location().then(function (position) {
  // position.coords.latitude
  // position.coords.longitude
}).catch(function (error) {
  // User didn't allow to share the location
});
```