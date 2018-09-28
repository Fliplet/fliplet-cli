# Like Buttons

Let users engage with your content in a single tap.

---

Dependencies: `fliplet-like:0.2`

**This package is currently in Beta. We recommend adding the version number `:0.2` to ensure the feature continues to work in your app if and when the package is upgraded.**

**Add `fliplet-like:0.2` to your page dependencies to include the resources for setting up your Like button.**

```js
LikeButton(options)
```

For the following HTML code:

```html
<div id="target"></div>
```

Use the following JavaScript code to set up a Like Button for users to like the page they are currently viewing:

```js
LikeButton({
  target: '#target',
  dataSourceId: 12345,
  content: {
    pageId: Fliplet.Env.get('pageId')
  }
});
```

Or use the following JavaScript code to set up a Like Button for users to like a data source entry:

```js
LikeButton({
  target: '#target',
  dataSourceId: 12345,
  content: {
    dataSourceEntryId: 16789
  }
});
```

## Usage

```
LikeButton(options)
```

* `options` (Object) A map of options to pass to the constructor.
  * `dataSourceId` **Required** (Number) Data source in which the like data will be stored.
  * `target` **Required** (Mixed - Required) Target element to which the like button will be added. `target` can be any of the following:
    * **Selector string**: Use a CSS selector string to add the like button to all matching elements
    * **jQuery object**: Pass a jQuery object directly to add the like button to all matching elements
    * **DOM element**: Pass a DOM element to add the like button to the element
    * **DOM element array**: Pass an array of DOM elements to add the like button to all elements
  * `content` (Object) An object to uniquely identify the liked content with. For example, add a page ID if it's a page being liked by the user, or a data source entry if the like interaction is referencing a data source entry. This will be used to retrieve and count the number of likes collected. **Default**: `{ pageId: Fliplet.Env.get('pageId') }`
  * `name` (String) A name to store in the data source, e.g. screen name, data source entry value etc. **Default**: `Fliplet.Env.get('appName') + '/' + Fliplet.Env.get('pageTitle')`
  * `allowAnonymous` (Boolean) Set whether users should be allowed to like content anonymously. **Default**: `true`
  * `loginPageId` (Number) Page ID where users can find the login component. If this is not provided, users will be warned that they must login, but will not be provided with the option to log in. **Default**: `null`
  * `addType` (Mixed) Method to which the like button is added to the target. `addType` can be any of the following:
    * (String) Use one of the following jQuery HTML manipulation methods:
      * `append` Like button is appended to the `target` element(s)
      * `prepend` Like button is prepended to the `target` element(s)
      * `html` Like button is set as the content of the `target` element(s)
    * (Function) Use a custom function to add the button to the container. Return `false` to avoid adding the button entirely. **Note**: `target` is not required if `addType` is a function.
  * `likeLabel` (String) Label of button to use when the rendering the like button before it's liked. **Default**: `<i class="fa fa-thumbs-o-up"></i> Like {{#if count}}{{count}}{{/if}}` The string will be used as a Handlebars template with the following variables:
    * `count` Number of likes
  * `likedLabel` (String) Label of button to use when the rendering the like button after it's liked. **Default**: `<i class="fa fa-thumbs-up"></i> Like {{#if count}}{{count}}{{/if}}` The string will be used as a Handlebars template with the following variables:
    * `count` Number of likes
  * `likeWrapper` (String) HTML to use when wrapping the like button. **Default**: `<a class="btn btn-like" href="#"></a>`
  * `likedWrapper` (String) HTML to use when wrapping the liked button. **Default**: `<a class="btn btn-like" href="#"></a>`

## Methods

The `LikeButton()` function returns an object with the following methods.

For example:

```js
var btn = LikeButton({
  target: '#target',
  dataSourceId: 12345,
  content: {
    pageId: Fliplet.Env.get('pageId')
  }
});

// Capture 'liked' event
btn.on('liked', function(data){
  console.log('Liked. New like count: ' + data.count);
});

// Capture 'unliked' event
btn.on('unliked', function(data){
  console.log('Unliked. New like count: ' + data.count);
});

// Programmatically trigger like
// Returns a Promise that resolves with the latest count
btn.like();

// Programmatically trigger unlike
// Returns a Promise that resolves with the latest count
btn.unlike();

// Programmatically toggle like
// Returns a Promise that resolves with the latest count
btn.toggleLike();
btn.toggleLike(true); // Same as btn.like()
btn.toggleLike(false); // Same as btn.unlike()

// Get like count
btn.getCount();

// Get like status
btn.isLiked();

// Get target (returns jQuery object)
btn.getTarget();
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}