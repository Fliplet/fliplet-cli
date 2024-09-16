---
description: Navigate the app to a new page, screen, document or URL
---

# Navigate

## Query parameters

### Set query parameters

You can set query parameters when navigating to a screen by using the `query` attribute. This examples takes two arguments: the first argument is the screen to navigate to, and the second argument is an object containing the query parameters to set in the URL.

```js
Fliplet.Navigate.screen(123, { query: '?foo=bar&baz=qux' });
```

### Read query parameters

If you need to read query parameters from the URL, you can use the `Fliplet.Navigate.query` object. This object will be populated with the query parameters of the current URL.

e.g. if the current URL is `http://apps.fliplet.com/myapp?foo=bar&baz=qux`, the `Fliplet.Navigate.query` object will be:

```js
{
  foo: 'bar',
  baz: 'qux'
}
```

Therefore, if you need to read the value of the `foo` parameter, you can do so by using `Fliplet.Navigate.query.foo`.

Here is an example of how you can use the `Fliplet.Navigate.query` object:

```js
// If the current URL is http://apps.fliplet.com/myapp?foo=bar&baz=qux
console.log(Fliplet.Navigate.query.foo); // bar
console.log(Fliplet.Navigate.query.baz); // qux
```

## Navigation methods

### Navigate the app to the previous page

This method is used to navigate back to the previous page or screen of the app.

```js
Fliplet.Navigate.back();
```

The method does not take any arguments, it simply causes a navigation action to be performed that takes the user back to the previous page or screen in the app. This method works by leveraging the browser's (or app's) history stack to determine the previous page visited by the user.

This method can be useful in situations where the user needs the ability to go back to the previous page or screen in the app. For example, if the user has navigated to a new page or screen and wants to return to the previous one, they can use this method to do so.

### Navigate the app to a URL

This method is used to navigate to a new page or screen in the app by providing a URL.

```js
Fliplet.Navigate.url('http://fliplet.com');
```

The method takes a single argument, which is a string representing the URL of the page or screen that the user should be navigated to. In this case, the URL being provided is "http://fliplet.com".

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

## Exit app (to the portal app)

When the App List component is used to build a portal app, the `Fliplet.Navigate.exitApp()` method can be used to leave an app and return to the portal app containing the App List component.

```js
Fliplet.Navigate.exitApp();
```

## Play a video

Play a video in full screen.

```js
Fliplet.Navigate.video(videoFileUrl);
```

## Log out

The `com.fliplet.link` link provider supports a log out action. The following code does the same thing as the provider.

You can optionally add a `logoutAction` (supports `screen` and `exit-app`) to perform a screen redirect or leave the app after the user is logged out.

```js
// Log the user out (of all passports)
Fliplet.Navigate.to({
  action: 'logout'
}).then(function() {
  console.log('User is logged out');
});

// Log user out of a specific passport
Fliplet.Navigate.to({
  action: 'logout',
  logoutPassport: 'dataSource'
});
Fliplet.Navigate.to({
  action: 'logout',
  logoutPassport: 'dataSource'
});

// Log out the user then go to a page
Fliplet.Navigate.to({
  action: 'logout',
  logoutAction: 'screen',
  page: 123
});

// The .logout() method is a shortcut for skipping the action parameter
Fliplet.Navigate.logout({
  logoutAction: 'screen',
  page: 123
});

// Log out the user then exit the app
// This is applicable only when access apps via an app list (portal app)
Fliplet.Navigate.to({
  action: 'logout',
  logoutAction: 'exit-app'
});
```

## Open a popup

Displays a native alert/popup dialog.

```js
var options = {
  title: 'Foo',
  message: 'Bar',
};
Fliplet.Navigate.popup(options);
```

---

## Open a confirm dialog

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

---

## Open a prompt dialog

Displays a native prompt dialog.

```js
var options = {
  title: 'Foo',
  message: 'Bar',
  labels: ['Send','Cancel'], // Native only (defaults to [OK,Cancel])
  default: 'Foo Bar'
};
Fliplet.Navigate.prompt(options)
  .then(function(input) {
    if (input === null) {
      return console.log('Canceled');
    }

    if (!input) {
      return console.log('Prompt is left empty!');
    }

    console.log(input);
  });
```

---

## Open a gallery

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

## Define a JavaScript function as action

When using the `com.fliplet.link` provider to run a custom function you need to register the function by using the following JS API.

```js
// This JS API can help you register your own custom function
Fliplet.Navigate.registerFunction('myFunction', function() {
  // Your code here
});

// You can run the registered functions by calling the following JS API.
Fliplet.Navigate.runFunction('myFunction');
```

To pass data to the registered function, add an object to `Fliplet.Navigate.runFunction()`, which can be accessed via the `this` variable in your registered function.

```js
Fliplet.Navigate.registerFunction('myFunction', function() {
  console.log(this.foo); // bar
});

Fliplet.Navigate.runFunction('myFunction', { foo: 'bar' });
```
