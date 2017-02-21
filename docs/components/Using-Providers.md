# Using providers

Components can display providers to get specific data from the system or need a particular piece of funcionality to be added.

The easiest example is the [button component](https://github.com/Fliplet/fliplet-widget-primary-button), which uses the [link provider](https://github.com/Fliplet/fliplet-widget-link) to configure the action of the button.

![Provider frame](../assets/img/provider-frame.jpg)

## Including providers into a component

```js
// Returns a promise
var myProvider = Fliplet.Widget.open('com.fliplet.link', {

  // If provided, the iframe will be appended here,
  // otherwise will be displayed as a full-size iframe overlay
  selector: '#somewhere',

  // You can send data to the provider to populate its interface (to be used like instance data)
  data: { foo: 'bar' },

  // You can also listen for events fired from the provider
  onEvent: function (event, data) {
    if (event === 'interface-validate') {
      Fliplet.Widget.toggleSaveButton(data.isValid === true);
    }
  }
});

// Once the promise is resolved
myProvider.then(function (data) {
  // This will get called once the provider has called "Fliplet.Widget.save()"
});

// You can also resolve an array of providers (similar to Promise.all)
Fliplet.Widget.all([myProviderA, myProviderB, myProviderC]).then(function () {

});
```

You can also stop the provider from being closed once resolved, by passing the `closeOnSave: false` option. You can then close it manually by calling `myProvider.close()` at any time.

---

[Back to the interface of components](Interface.md)
{: .buttons}