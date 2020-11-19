# Navigate

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

Displays a native alert/popup dialog.

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