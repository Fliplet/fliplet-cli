# Core JS APIs

"Fliplet Core" is our most important package and it's included on all screens of your apps. If you're developing a component, make sure to include `fliplet-core` in your dependencies to make use of these JS APIs.

This package enables you to read and write data in the device storage, navigate to different screens as long as dozens of other different interactions and features.

The following namespaces are publicly available under this package. Please click on any of them to see their documentation and public methods:

- [Analytics](#analytics)
- [App Analytics](#app-analytics)
- [API](#api)
- [App](#app)
- [Apps](#apps)
- [Cache](#cache)
- [Encode](#encode)
- [Environment](#environment)
- [Hooks](#hooks)
- [Modal](#modal)
- [Navigate](#navigate)
- [Navigator](#navigator)
- [Notifications](#notifications)
- [Organizations](#organizations)
- [Screens](#screens)
- [Profile](#profile)
- [Storage](#storage)
- [Studio](#studio)
- [User](#user)
- [Widget](#widget)

---

The `fliplet-core` package also contains the following methods:

- [compile](#compile)
- [guid](#guid)

If you're looking for other namespaces, make sure to check popular ones the [Media](fliplet-media) or [Data Sources](fliplet-datasources) dependencies.

One more thing: `Fliplet` is also a function returning a promise which can be used to ensure your code runs when all plugins and features have loaded on the screen:

```js
Fliplet().then(function () {
  // code running here will have all dependencies and plugins available
});
```

---

## Environment

### Get an environment variable

```js
var appId = Fliplet.Env.get('appId');
```

These variables are usually available on app screens as long as components and providers:

- `apiUrl` - the base URL of Fliplet APIs (e.g. `https://api.fliplet.com/`)
- `appFonts` - array of fonts uploaded for the current app
- `appHooks` - array of security hooks that have been set up the current app
- `appId` - the current app id
- `appName` - the current app name
- `appPages` - array of pages for the current app
- `appSettings` - object with public settings for the current app
- `appUpdatedAt` - timestamp set to the last time a change has been made via Fliplet Studio to the current app
- `appVersion` - number pointing to the app's version (when using Fliplet Viewer, its value will be `(DEV)`)
- `appTemplate` - boolean indicating whether the app is a template
- `appsUrl` - the base URL for Fliplet Apps (e.g. `https://apps.fliplet.com/`)
- `development` - `true / false` true when if developing via the Fliplet CLI
- `interact` - `true / false` true when you are in edit mode in Fliplet Studio
- `masterAppId` - when called from a live app, returns the ID of the master app seen through Fliplet Studio
- `mode` - `'preview' / 'view' / 'interact'`
- `organizationName` - the user's organization name
- `organizationId` - the user's organization id
- `pageId` - the current page id
- `pageMasterId` - when called from a live app, returns the ID of the master page seen through Fliplet Studio
- `pageTitle` - the current page (screen) title
- `pageSettings` - object with public settings for the current page
- `platform` - either `'web'` or `'native'` (use [Fliplet.Env.is](#check-the-current-apps-environment-platform) for easier checks)
- `provider` - `true / false` whether the current component (widget) is running in provider mode
- `preview` - `true / false` true when you are in edit or preview mode in Fliplet Studio
- `user` - the current user

### Set an environment variable

Through the `set()` method you can overwrite any of the above environment variables at runtime or add new ones. Please note that they will only be available until the screen navigates away to a new screen.

```js
Fliplet.Env.set('appId', 2);
```

### Check the current app's environment (platform)

Use the `is()` method to check whether the current app is running in a `native` (e.g. iOS and Android devices) or `web` environment.

```js
if (Fliplet.Env.is('native')) {
  // this code will run on native devices (iOS and Android) only
}

if (Fliplet.Env.is('web')) {
  // this code will run on desktop browsers only
}
````

---

## Hooks

### Register a callback for a hook

```js
Fliplet.Hooks.on('beforeFormSubmit', function (data) {
  console.log('just got', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

```js
Fliplet.Hooks.on('afterFormSubmit', function (data) {
  // data.formData is form data
  // data.result is null for insert and the entry when update
  console.log('just got', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

```js
Fliplet.Hooks.on('onFormSubmitError', function (data) {
  // data.formData is form data
  // data.error is the error
  console.log('something went wrong', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

### Run a hook

```js
var data = { foo: 1 };

Fliplet.Hooks.run('beforeFormSubmit', data).then(function (results) {
  // results[0] is "bar"
  // data.foo is 2
}, function onError (err) {
  // woop woop, an hook fired a rejection!
});
```

---

## Modal

<p class="info">This JS API is only available in widget interfaces when developing for Fliplet Studio. If you're looking for adding modals and confirmation windows to your Fliplet Apps, please look for the following JS APIs instead:</p>

- [Fliplet.UI.Actions](https://developers.fliplet.com/API/fliplet-ui-actions.html)
- [Fliplet.UI.Toast](https://developers.fliplet.com/API/fliplet-ui-toast.html)

When using Modal windows on widget interfaces, we use [Bootbox](http://bootboxjs.com/) under the hood hence make sure to check their documentation for the full set of options you can pass.

### Display a confirmation message

Displays a confirmation message in Fliplet Studio from a Fliplet Widget interface.

```js
Fliplet.Modal.confirm({ message: 'Are you sure?'}).then(function (result) {
  if (result) {
    // user pressed yes
  }
});
```

### Display an alert message

Displays an alert message in Fliplet Studio from a Fliplet Widget interface.

```js
Fliplet.Modal.alert({ message: 'Thanks for confirming'}).then(function () {
  // fired when the user pressed "OK"
});
```

---

## User

### Get the user auth token

Retrive the auth token for the current user.

```js
var userAuthToken = Fliplet.User.getAuthToken();
```

### Set the user auth token

```js
Fliplet.User.setAuthToken('eu--abcdef');
```

### Set the user details

```js
Fliplet.User.setUserDetails({
  auth_token: 'eu--abc',
  id: 2,
  email: 'foo@example.org'
});
```

### Set (extend) the user preferences

```js
// promise will resolve with all user preferences
Fliplet.User.Preferences.set({
  foo: 'bar',
  baz: { barbaz: true }
});
```

### Get the user preferences

```js
// promise will resolve with all user preferences
Fliplet.User.Preferences.get().then(function (preferences) {
  // preferences.foo
});
```

---

## Studio

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

---

## API

### Make an API request to the Fliplet APIs

```js
// Returns a promise
Fliplet.API.request({
  url: 'v1/user',
  method: 'PUT',
  data: { email: 'new@email.org' }
}).then(function onSuccess(response) {
  console.log(response);
});
```

---

## Widget

### Emit an event to the parent widget or Fliplet Studio

```js
Fliplet.Widget.emit('foo', { bar: 1 });
```

### Get the widget instance id

This method is usually meant to be called from a widget interface, to get the widget instance id if necessary.

```js
var id = Fliplet.Widget.getDefaultId();
```

### Get a widget instance data

This method is usually meant to be called from a widget interface, to get the saved data.

```js
var data = Fliplet.Widget.getData();
```

You can also get the data of a specific widget instance in the current page by passing its ID:

```js
var data = Fliplet.Widget.getData(1);
```

### Get the URL to an asset from the relative path of a widget

```js
// the first parameter is the widget id as usual
var url = Fliplet.Widget.getAsset(123, 'img/icon.png');

// on the interface, you can skip the id (same as getData and getUUID)
var url = Fliplet.Widget.getAsset('img/icon.png');
```

### Get a widget instance unique identifier

The widget instance ID might change overtime when an app is published. If you need to use an ID which won't change, you can use the `getUUID(<widgetInstanceId>)`.

```js
var uuid = Fliplet.Widget.getUUID(1);
```

### Display an error message in Fliplet Studio

```js
Fliplet.Widget.displayMessage({ text: 'The email is not valid' });
```

### Sets the widget interface info message in Fliplet Studio

```js
Fliplet.Widget.info('2 files selected');
```

### Toggle the wide mode on the interface

```js
// Enable the wide mode
Fliplet.Studio.emit('widget-mode-wide');

// Disable the wide mode
Fliplet.Studio.emit('widget-mode-default');
```

### Toggle the save button

```js
// Enable the button
Fliplet.Widget.toggleSaveButton(true);

// Disable the button
Fliplet.Widget.toggleSaveButton(false);
```

### Set & reset the save button label

```js
// Set the button label
Fliplet.Widget.setSaveButtonLabel('Pick');

// Reset the button label (to 'Save & Close')
Fliplet.Widget.resetSaveButtonLabel();
```

### Toggle the cancel button

```js
// Enable the button
Fliplet.Widget.toggleCancelButton(true);

// Disable the button
Fliplet.Widget.toggleCancelButton(false);
```

### Set & reset the cancel button label

```js
// Set the button label
Fliplet.Widget.setCancelButtonLabel('No thanks');

// Reset the button label (to 'Save & Close')
Fliplet.Widget.resetCancelButtonLabel();
```

### Autosize

Tells the parent widget or studio the new height of this widget.

```js
Fliplet.Widget.autosize();
```

As a rule of thumb, you are responsible of calling the above function every time the height of your widget (or provider) is changing.

### Open a provider

```js
var myProvider = Fliplet.Widget.open('com.fliplet.link', {

  // If provided, the iframe will be appended here,
  // otherwise will be displayed as a full-size iframe overlay
  selector: '#somewhere',

  // You can send data to the provider, to be used similar to a widget instance data
  data: { foo: 'bar' },

  // You can also listen for events fired from the provider
  onEvent: function (event, data) {
    if (event === 'interface-validate') {
      Fliplet.Widget.toggleSaveButton(data.isValid === true);
    }

    // return true to stop propagation up to studio or parent components
  }
});

myProvider.then(function (data) {
  // data will contain the result
});

// You can also resolve an array of providers
Fliplet.Widget.all([myProvider]).then(function (results) {
  // results is an array with data from all providers you resolved
});
```

You can also stop the provider from being closed once resolved, by passing the `closeOnSave: false` option. You can then close it manually by calling `myProvider.close()` at any time.

### Attach an event on save request

Optionally attach an event handler to be called when the "save" button will be called in studio. Here's the typical usage of the function:

```js
Fliplet.Widget.onSaveRequest(function () {
  // Save data when the save button in studio is clicked
  return Fliplet.Widget.save({ foo: 1 });
}).then(function onSave() {
  // Closes this widget interface
  Fliplet.Widget.complete();
});
```

### Save data

Used to save JSON-structured data to the current widget instance. The `save` function is usually meant to be triggered from `onSaveRequest` described above.

```js
Fliplet.Widget.save({ foo: 1 }).then(function () {
  // Closes this widget interface
  Fliplet.Widget.complete();
});
```

### Close the interface when done

```js
Fliplet.Widget.complete();
```

---

## Organizations

### Get the user organizations

```js
Fliplet.Organizations.get().then(function (organizations) {

});
```

### Get the current organization settings

```js
Fliplet.Organization.Settings.getAll()
  .then(function (settings) {
    // Your code
  });
```

### Extend the current settings

```js
Fliplet.Organization.Settings.set({
  user: 'foo',
  _password: 'bar' // Settings with an underscore prefix "_" will be encrypted
})
  .then(function(settings) {
    // Code to run when it completes
  });
```

### Get a setting

```js
Fliplet.Organization.Settings.get('foo')
  .then(function (value) {
    // Your code
  })
```

### Check if a setting is set

```js
Fliplet.Organization.Settings.isSet('_password')
  .then(function(isSet) {
    if (isSet) {
      // Your code
    }
  });
```

### Unset a setting

```js
Fliplet.Organization.Settings.unset(['user','_password'])
  .then(function (currentSettings) {
    // Your code
  })
```

---

## App

### Get the current app settings

```js
var settings = Fliplet.App.Settings.getAll();
```

### Get a single settings from the current app

```js
var datum = Fliplet.App.Settings.get('foo');
```

### Get the logs for an app

```js
Fliplet.App.Logs.get({
  where: { type: 'jobs' }
}).then(function (logs) {
  // logs<Array>
});
```

### Create a log for an app

```js
Fliplet.App.Logs.create({
  foo: "bar"
}).then(function (log) {
  // log<Object>
});
```

### Save or update some settings of the current app

```js
Fliplet.App.Settings.set({ foo: 'bar', hello: 'world' }).then(function () {
  // optional promise callback to be called when the APIs have saved the data
});
```

### Deletes a list of settings from the app

```js
Fliplet.App.Settings.unset(['foo', 'hello']).then(function () {
  // optional promise callback to be called when the APIs have deleted the data
});
```

### Check if your app is running in preview mode

Use the following snippet to check if your app is running inside Fliplet Viewer (or Fliplet Studio) or it's the production version from the App Store / Play Store / Web apps.

```js
var isPreview = Fliplet.App.isPreview(true);
```

### Lock the device orientation

```js
// If called with no parameters, the app orientation from the settings will be used
Fliplet.App.Orientation.lock(newOrientation)
```

### Unlock the device orientation

```js
Fliplet.App.Orientation.unlock()
```

The orientation unlock is temporary. When the following events occur, the orientation will be re-locked according to the original app setting, which would always be **portrait** on smartphones.

1. App orientation is locked when exiting from the in-app browser.
1. App orientation is locked when exiting from a full screen video playback.

To ensure a page doesn't force the orientation re-lock, add the following code to the screen HTML instead of using `Fliplet.App.Orientation.unlock()`.

```html
<script>Fliplet.Env.get('appSettings').orientation = 'all'</script>
```

**Note** Landscape mode in smartphones are not officially supported by Fliplet and may have layout issues due to the shortened screen height and "notches" on devices such as the iPhone X.

### App Storage

Use this to store arbitrary keys in the app storage for later use.
Note: this is a [namespaced storage](#namespaced) wrapper using `Fliplet.Storage` for the current app.

```js
Fliplet.App.Storage.set(key, val)
```

### Profile

A [namespaced storage](#namespaced) for the user profile.

```js
Fliplet.Profile.set('firstName', 'John')

Fliplet.Profile.get('firstName').then(function (value) {
  // value is 'John'
})
```

The following variables are reserved for common use and publicly accessible.

* `email`
* `firstName`
* `lastName`
* `name`
* `department`
* `company`
* `phone`

---

## Apps

### Get the list of apps the user has got access to

```js
Fliplet.Apps.get().then(function (apps) {

});
```

**Note**: when returning apps, the API will return both **V1** and **V2** apps created with Fliplet. Most likely, you want to filter and use V2 apps only. This can be done by filtering out apps where the boolean `app.legacy` is `true`.

---

## Screens

### Get the list of screens in the current app

```js
Fliplet.Pages.get().then(function (appPages) {

});
```

---

## Navigator

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

---

## Cache

### Fetch data and keep it cached for future calls

This feature allows you to run an operation (even asynchronously) and store its result so that future calls to the function will instantly resolve the Promise instead of waiting for the result.

If the data is already in cache at the time of running the call, your promise will be resolved instantly. However, when the cache is about to expire (if an expiration has been set) it will automatically attempt to renew the cache in background.

`Promise<result> Fliplet.Cache.get(<string|object>, <function>)`

```js
Fliplet.Cache.get('foo', function () {
  return { bar: 1 };
}).then(function (result) {

});
```

Here's a more complete example including all options:

```js
Fliplet.Cache.get({
  key: 'foo',         // unique name
  platform: 'native', // only cache on native
  expire: 60 * 10     // keep cache for 10 minutes
}, function onFetchData() {
  // Function to be called when data does not exist in the cache and needs to be fetched.
  // Return a promise if your operation is asynchronous.
  return Fliplet.API.request({
    url: 'v1/something'
  });
}).then(function (result) {
  // This promise will resolve instantly if the data is already cached
});
```

### Clear cache for one or more keys

```js
// Clear a single value
Fliplet.Cache.delete('foo');

// Clear everything for this app
Fliplet.Cache.clear();
```

---

## Notifications

### Show a local notification to the user

This feature allows you to programmatically display notifications on the user's device. You can optionally define a time to which they need to be scheduled to be displayed at later date.

```js
Fliplet.Navigator.Notifications.schedule({
  title: 'Hello world',
  text: 'Lorem ipsum dolor sit amet',
  icon: 'https://path/to/icon.jpg',
  smallIcon: 'res://icon_notification'
});
```

For the full available options, please check the [local notifications cordova plugin](https://github.com/katzer/cordova-plugin-local-notifications).

Note: compared to native devices, web support for local notifications is limited despite being available.

---

## Storage

The `Storage` JS APIs allow you to save and read data to and from the device or browser. You can save values such as **numbers**, **booleans**, **strings** and also **objects** (as long as they can be serialized via **JSON**).

Please note that all these methods (`set`, `get` and `remove`) are asynchronous and the result is returned via promises. You don't need to wait for the promise when you use `set` and `remove` but you surely will need it when you use the `get` method to read a variable.

We currently allow storing settings to the current app but also to apps you have installed in your device (e.g. when running via the App List component or Fliplet Viewer). Please make sure to use the correct storage depending on the case:

- `Fliplet.App.Storage` writes and reads data for the current app; this is most likely what you want to use.
- `Fliplet.Storage` writes and reads to a global storage which is shared across your apps.

Both namespaces have the same methods for reading, setting and removing data as explained in the sections below.

### Store data

```js
Fliplet.App.Storage.set('key', value);

// You can also wait for this to be saved on disk with a promise, if necessary
Fliplet.App.Storage.set('key', value).then(function () {
  // this runs when the variable has been saved to disk
}).catch(function (error) {
  // this runs when an error was triggered and the data could not be saved
});
```

### Read data

Use the `Fliplet.App.Storage.get()` method to read one or more values from the device storage for the current app. The input parameter can either be a `String` when looking for a single key or an `Array` when you need to lookup for more than one.

```js
// Read a single key from the app's storage
Fliplet.App.Storage.get('foo').then(function (value) {
  // here you can use the "value"
});

// Read multiple keys from the app's storage
Fliplet.App.Storage.get(['foo', 'bar']).then(function (values) {
  // values will be an object containing "foo" and "bar":
  // - values.foo
  // - values.bar
}).catch(function (error) {
  // this block is optional and it runs when an error was triggered
  // and the data could not be read
});

// You can also provide default properties to return when the key is not set.
// This also works when the input key is an array.
Fliplet.App.Storage.get('key', { defaults: 123 })
  .then(function (value) {
    // here you can use the "value"
  });

// Providing default properties also works when the value is an object.
Fliplet.App.Storage.get('key', { defaults: { hello: 'world' } })
  .then(function (value) {
    // here you can use the "value"
  });

// Providing default properties also works when the input key is an array.
Fliplet.App.Storage.get(['foo', 'bar'], { defaults: { foo: '1', bar: 'baz' } })
  .then(function (value) {
    // here you can use the "value"
  });
```

You can optionally provide a default value in case the key has not been assigned a value yet.

### Remove data

```js
Fliplet.App.Storage.remove('key');

// You can also wait for this to be removed from the disk with a promise, if necessary
Fliplet.App.Storage.remove('key').then(function () {
  // this runs when the variable has been removed from to disk
});
```

### Namespaced storage

You can also create a private namespaced storage which is nor shared with the `Fliplet.App.Storage` neither with the global `Fliplet.Storage`:

```js
var myPrivateStorage = Fliplet.Storage.Namespace('foo');
```

#### Set data
```js
myPrivateStorage.set('bar', 'my data')
```

#### Get data

```js
myPrivateStorage.get('bar').then(function(value) {})
```

#### Get all data

**Note** This is only available for namespaced storage

```js
myNamespaceStorage.getAll().then(function(data) {})
```

#### Remove

Remove a key or list of keys from the namespaced storage

```js
myNamespaceStorage.remove('bar')
```

**Note** If you need to remove multiple storage keys at once, you must pass an array of keys

```js
// Correct
myNamespaceStorage.remove(['foo', 'bar'])

// Incorrect - This will result in only the last one being removed
myNamespaceStorage.remove('foo')
myNamespaceStorage.remove('bar')
```

#### Clear

**Note** This is only available for namespaced storage

Clear all namespaced storage
```js
myNamespaceStorage.clear()
```

---

## Navigate

### Query parameters

```js
Fliplet.Navigate.query;
```

### Navigate the app to the previous page

```js
Fliplet.Navigate.back();
```

### Navigate the app to a URL

```js
Fliplet.Navigate.url('http://fliplet.com');
```

The above will use the in-app browser by default so your users won't leave from the app. If you wish to use the device's system browser, you can pass `inAppBrowser: false` in the configuration as follows:

```js
Fliplet.Navigate.url({
  url: 'http://fliplet.com',
  inAppBrowser: false
});
```

The in-app browser contains a **Share** feature that lets your users share the URL through other features on the phone. You can disable this by adding the following line as custom JavaScript code.

```js
Fliplet.Navigate.defaults.disableShare = true;
```

### Register a hook to be fired before navigating to a URL

You can register a function to be called whenever your app is about to navigate to a URL. This is useful if you want to make changes to any of the given parameters (prior to the navigation), or you need to run custom code or you simply want to completely stop the URL from opening.

The `data` object shown below will contain the following keys:

- `url` (**String**) The url to be opened
- `inAppBrowser` (**Boolean**) whether the link should be forced to open (or not) with the in-app internet browser

```js
Fliplet.Hooks.on('beforeNavigateToURL', function (data) {
  // You can return a promise if you need async to be carried out
  // before the InAppBrowser is opened.

  // You can also change any of the input data if you need to
  data.url = 'http://example.org';

  // If you want to stop execution and don't open the browser, simply return a promise rejection:
  return Promise.reject('Handled by my hook');
});
```

Let's make one further example where we simply force all linkedin.com and twitter.com URLs to open with the system browser (so that the installed app gets opened) instead of the in-app browser:

```js
Fliplet.Hooks.on('beforeNavigateToURL', function (data) {
  if (data.url.match(/linkedin\.com|twitter\.com/)) {
    data.inAppBrowser = false;
  }
});
```

### Navigate the app to a specific screen by its ID or name

Use the `Fliplet.Navigate.screen()` function to navigate to a screen by its ID or name:

```js
// Navigate to the screen with ID 1
Fliplet.Navigate.screen(1);

// Navigate to the screen titled "Company news"
Fliplet.Navigate.screen('Company news');
```

To find out the ID of a page, you can use Fliplet Studio (it's displayed on the browser bar) or simply run `Fliplet.Env.get('pageId')` from any page. Here follows more example with options for defining query parameters, transition and duration of the transition:

```js
// Navigate to the screen with ID 2 optionally passing some more details
Fliplet.Navigate.screen(2, { query: '?foo=bar' });

// Navigate to the screen with ID 3 using a slide transition
Fliplet.Navigate.screen(3, { transition: 'slide.right' });

// Navigate to the screen with ID 3 specifying the transition duration (defaults to 500ms)
Fliplet.Navigate.screen(3, { duration: 250 });

// Navigate to the screen with ID 4 using a fade transition
Fliplet.Navigate.screen(4, { transition: 'fade' });
```

Here's a list of transitions you can use:

- `none` - No transition
- `fade` - Fade in
- `slide.left` - Slide Left
- `slide.right` - Slide Right
- `slide.up` - Slide Up
- `slide.down` - Slide Down
- `flip.left` - Flip from Left / Slide Right (Windows)
- `flip.right` - Flip from Right / Slide Left (Windows)
- `flip.up` - Flip from Top / Slide Up (Windows)
- `flip.down` - Flip from Bottom / Slide Down (Windows)
- `curl.up` - Curl Up (iOS) / Slide Up (Android/Windows)
- `curl.down` - Curl Down (iOS) / Slide Down (Android/Windows)

### Register a hook to be fired before navigating to a screen

You can register a function to be called whenever your app is about to navigate to a screen (page). This is useful if you want to make changes to any of the given parameters (prior to the navigation), or you need to run custom code or you simply want to completely stop the screen from navigating away.

The `data` object shown below will contain the following keys:

- `page` target screen, an **Object** with `{ id }`

```js
Fliplet.Hooks.on('beforePageView', function (data) {
  // You can return a promise if you need async processing to be carried out

  // If you want to stop execution, simply return a promise rejection
  if (data.page.id === 123) {
    return Promise.reject({ errorMessage: 'Cannot navigate to page 123' });
  }
});
```

Let's make one further example where we create two specific screens, one for native apps and one for webapps. The hook to be added in Global JS will make sure users end up in the relevant screen depending on their device, regardless of what screen the device is being redirected to:

```js
var nativePageId = 123;
var webPageId = 456;

Fliplet.Hooks.on('beforePageView', function(data) {
  // Navigate to native screen when navigating to web screen on a mobile device
  if (Fliplet.Env.is('native') && data.page.id === webPageId) {
    return Promise.reject({ navigate: { action: 'screen', page: nativePageId } });
  }

  // Navigate to web screen when navigating to native screen on a web browser
  if (Fliplet.Env.is('web') && data.page.id === nativePageId) {
    return Promise.reject({ navigate: { action: 'screen', page: webPageId } });
  }
});
```

### Navigate using the options given by the link provider

When using the `com.fliplet.link` provider to get the navigation details, the function below can be used to parse such details.

```js
// Data coming from the link provider
var data = {
  action: 'screen',
  page: 1,
  query: '?param1=value1'
};

Fliplet.Navigate.to(data);
```

### Open a popup

```js
var options = {
  title: 'Foo',
  message: 'Bar',
};
Fliplet.Navigate.popup(options);
```

### Open a confirm dialog

Displays a native confirmation dialog.

```js
var options = {
  title: 'Foo',
  message: 'Bar',
  labels: ['Agree','No'] // Native only (defaults to [OK,Cancel])
};

Fliplet.Navigate.confirm(options)
  .then(function(result) {
    if (!result) {
      return console.log('Not confirmed!');
    }
    console.log('Confirmed!');
  });
```

### Open a prompt dialog

```js
var options = {
  title: 'Foo',
  message: 'Bar',
  labels: ['Send','Cancel'], // Native only (defaults to [OK,Cancel])
  default: 'Foo Bar'
};
Fliplet.Navigate.prompt(options)
  .then(function(input) {
    if (!input) {
      return console.log('Canceled or left empty!');
    }
    console.log(input);
  });
```

### Open a gallery
We are using [PhotoSwipe](http://photoswipe.com/).
Note: You need to add `photoswipe` on your dependencies list to use this.
```js
var data = {
  images: [
    {
      title: 'Foo',
      path: '/foo.jpg', // On native platform if present, path is used instead of web url
      url: 'http://lorempixel.com/1280/720/'
    },
    {
      url: 'http://lorempixel.com/400/200/'
    }
  ],
  options: { // You can pass Photo Swipe options
    index: 1
  }
};
Fliplet.Navigate.previewImages(data);
```

---

## Analytics

### Enable/disable tracking
The app might have an analytics widget active, although you can also prompt the user if they accept tracking.

```js
Fliplet.Analytics.enableTracking()
Fliplet.Analytics.disableTracking()
```

### Check tracking status

```js
Fliplet.Analytics.isTrackingEnabled()
````

---

## App Analytics

### Tracking an event for app analytics

Analytics for apps can be tracked by providing a type (either `event` or `pageView` and a optional JSON `data` object to be stored against the event).

```js
// Track an event
Fliplet.App.Analytics.track('event', {
  label: 'Click on News Item'
});

// Track a page view
Fliplet.App.Analytics.track('pageView', {
  label: 'Page 123',
  foo: 'bar'
});

// shorthand for tracking events
Fliplet.App.Analytics.event({
  label: 'News Item 123'
});

// shorthand for tracking pageviews
Fliplet.App.Analytics.pageView('My sample page');
```

The system takes care of creating an analytics session for the user and track it and also track when a new session should be created. Furthermore, the following data gets added automatically to each event or pageView you track:

- `_platform` (String, `web` or `native`)
- `_os` (String, operative system)
- `_analyticsSessionId` (String, a unique hash for the user session. This changes every 30 minutes for the user.)
- `_pageId` (Number, the screen ID where the event has been tracked)
- `_pageTitle` (String, the screen name where the event has been tracked)
- `_userEmail` (String, the email of the logged user when using a login system like SAML2, Fliplet Data Sources or Fliplet Login)

When tracking events via `Fliplet.App.Analytics.event` you can overwrite these variables by passing a new value:

```js
Fliplet.App.Analytics.event({
  _os: 'Ubuntu',
  _pageTitle: 'My other page'
});
```

### Manually resetting the analytics session id

```js
Fliplet.App.Analytics.Session.reset();
```

### Fetch aggregated logs

Here's how you can use our powerful JS APIs to do some heavylifting for you and return aggregated logs instead of having to group them manually when displaying charts for app analytics.

**Note**: fetching aggregating logs is available both under the namespace **for the current app** (`Fliplet.App`) and **for all apps** (`Fliplet.Apps`), each have different behaviors and parameter requirements:

```js
// Fetch analytics for the current app
Fliplet.App.Analytics.get(query);

// Fetch analytics for a specific app
Fliplet.Apps.Analytics.get(appId, query);
```

The `query` parameter is optional; when given, it must be an object with the following (all optional) attributes:

- `aggregate` (object to define post-querying filtering, see below for usage)
- `attributes` (array of attributes to select)
- `group` (for grouping data, described below)
- `limit` (number)
- `order` (array of arrays, check below for usage)
- `period` (object to define how chunks of data should be grouped chronologically)
- `where` (sequelize where condition)

---

#### `attributes`

Use when you only want to select a few attributes or you need to apply a distinct count.

**Selecting attributes:**

```js
['createdAt', 'data']
```

**Applying a distinct count:**

```js
[ { distinctCount: true, col: 'data._analyticsTrackingId', as: 'sessionsCount' } ]
```

---

#### `where`

Sequelize where condition for the query.

```js
{
  data: { foo: 'bar' },
  type: ['app.analytics.pageView'],
  createdAt: {
    $gte: moment().startOf('day').unix()*1000,
    $lte: moment().endOf('day').unix()*1000
  }
}
```

---

#### `group`

When aggregating data with "group", this parameter must be an array of objects or strings.

- If you pass a string, it must be the database column name in the logs table. Keep in mind that all data stored by JS APIs is saved into "data", so you will be required to use "data.foo" and so on. On the other hand, "createdAt" is a root column of the table.
- If you pass an object, you can specify the PostgreSQL native function to run (via fn) as well as any parameter (e.g. part), then the target column with col and also an target alias using as (this is optional).

Let's make an example by aggregating data by a `data.label` column and then by hour:

```js
Fliplet.Apps.Analytics.get(appId, {
  group: [
    'data.label',
    { fn: 'date_trunc', part: 'hour', col: 'createdAt', as: 'hour' }
  ],
  where: {
    data: { foo: 'bar' }
  },
  order: [['data.label', 'DESC']],
  limit: 5
}).then(function (results) {
  // console.log(results)
});
```

Another example:

```js
// 1. track a pageview
Fliplet.App.Analytics.pageView({
  label: 'News Item 123'
});

// 2. fetch pageviews by hour
Fliplet.Apps.Analytics.get(appId, {
  group: [
    { fn: 'date_trunc', part: 'hour', col: 'createdAt', as: 'hour' }
  ]
}).then(function (results) {
  // console.log(results)
});
```

And one more:

```js
var startDate = '2018-08-01';
var endDate = '2018-08-30';

// fetch a list of users with their page views count (ordered by most active to less active user)
Fliplet.Apps.Analytics.get(appId, {
  group: [
    'data._userEmail'
  ],
  where: {
    type: ['app.analytics.pageView'],
    createdAt: {
      $gte: moment(startDate, 'YYYY-MM-DD').startOf('day').unix()*1000,
      $lte: moment(endDate, 'YYYY-MM-DD').endOf('day').unix()*1000
    }
  }
}).then(function (results) {
  results = _.sortBy(results, 'count').reverse();
});

// fetch a list of most active users by their number of sessions
Fliplet.App.Analytics.get({
  group: ['data._userEmail'],
  order: [['sessionsCount', 'DESC']],
  attributes: [ { distinctCount: true, col: 'data._analyticsTrackingId', as: 'sessionsCount' } ],
  limit: 3
})
```

---

#### `limit`

Number of records to return. Defaults to `250`.


---

#### `order`

Define the ascending or descending order of returned records, sorting by specific column(s).

```js
[ ['data.label', 'DESC'], ['sessionsCount', 'ASC'] ]
```

---

#### `period`

Define how data should be grouped into periods of time.

- `duration`: can be either `week`, `day`, `hour`, `minute` or a specific time in **seconds**
- `col`: defines the target column to use for the date comparison.
- `count`: if `true`, only returns a count for the matched records; if `false`, returns a `data` array with a list of matched records

```js
{
  duration: 'hour',  // size of the data point
  col: 'createdAt',  // target column
  count: true        // return count only
}
```

---

### Fetch logs count

`count` works exactly the same as the above `get` method, but returns just a number of results:

```js
Fliplet.Apps.Analytics.count(appId, { group: [ 'data._userEmail' ] }).then(function (count) {
  // console.log(count)
});
```

---

## Encode

### Encode data to base64

```js
var encoded = Fliplet.Encode.base64('mystring');
```

---

## Compile

Compiles a string with a handlebars-like template replacement.

```js
var compiledString = Fliplet.compile('Hello {{name}}', { name: 'Nick' });
```

## Guid

Generates a global unique identifier with a format like: `"2682df5f-2679-7de5-c04c-d212f4314897"`

```js
var guid = Fliplet.guid()
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}