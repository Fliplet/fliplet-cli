---
description: Learn how to write custom code in your apps to read and write data from/to third-party APIs.
---

# Integrate with external APIs

Fliplet Apps generally rely on our internal APIs to integrate with data you have set in your Data Sources via Fliplet Studio. However, you can easily **write custom code in your apps to integrate with an external API and display its data or feed it to first-party components such as lists and forms**.

This page shows you a few examples and libraries to get started integrating with third party API endpoints.

<p class="quote">Note: integrating with third-party APIs may result in <strong><a href="/AJAX-cross-domain.html">cross domain policy issues</a> when the target domain does not allow API requests from the source origin (the Fliplet app)</strong>. Please read our support article <a href="/AJAX-cross-domain.html">here</a> to learn more on the topic.</a>

All Fliplet apps have available the popular [jQuery](https://jquery.com/) library, which can be used on any screen when writing custom JavaScript code. Such library have easy-to-use helpers available to read and write data from/to an external API through the [jQuery AJAX](https://api.jquery.com/jquery.ajax/) methods, including:

- [$.ajax](https://api.jquery.com/jquery.ajax/)
- [$.get](https://api.jquery.com/jQuery.get/)
- [$.post](https://api.jquery.com/jQuery.post)

These functions can automatically convert a JSON response into a JavaScript object for further manipulation. If your API returns a different type of data (such as plain text or XML) please refer to the jQuery website to learn more about how to manipulate the data.

Here's a simple example using the [$.get](https://api.jquery.com/jQuery.get/) method to read data from a third-party URL returning a JSON response with an array of objects:

```js
// Call a 3rd-party endpoint using the HTTP GET method
$.get('https://jsonplaceholder.typicode.com/posts').then(function (elements) {
  elements.forEach(function (item) {
    console.log(item);
  });
});
```

As you may have noticed, jQuery AJAX methods all return a **Promise** object which makes integrating with Fliplet Hooks and JS APIs much easier.

Here's an example where the above array from the 3rd-party API gets used to populate a [List from Data Source](/API/components/list-from-data-source.html) component:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.getData = function() {
    return $.get('https://jsonplaceholder.typicode.com/posts').then(function (elements) {
      return elements.map(function (item) {
        return {
          id: item.id,
          data: {
            title: item.title
          }
        }
      });
    });
});
```

Likewise, you can use the more advanced `$.ajax` jQuery method to run more complex HTTP requests:

```js
// Run a HTTP POST request sending some data to the endpoint
$.ajax({
  method: 'POST',
  url: 'https://jsonplaceholder.typicode.com/posts',
  data: {
    title: 'Sample title'
  }
}).then(function (response) {
  // Finished running the API request
})
```

---