# Testing components

If you have started you widget from our boilerplate you already have a sample test suite under the `tests` folder.
To test a component, use the CLI to run your tests:

```
$ fliplet test
```

The above code will:
 - publish the widget with a unique name (it's always a new widget for the environment)
 - create an app, page and a widget instance (the tests will run on our engine)
 - run your tests


## Tech-stack used for tests

- [Nightmare](http://nightmarejs.org)
- Expect/Should from [Chai](http://chaijs.com/)


## Where should my tests go

You should include your tests under `tests` folder of the widget.

## Variables available when writing tests

- `interfaceBrowser` - A Nightmare instance of your widget interface.
- `buildBrowser` - A Nightmare instance of your widget instance build.
- `interfaceUrl` - The url for the interface.
- `buildUrl` - The ural for your widget instance build.
- `widgetInstance` - The widgetInstance as it was saved on the database.
- `buildSelector` - A querySelector to select the all block of your build HTML.
- `interfaceBrowser.save()` - Method to save your settings on the widget interface

## Sample test

```js
describe('WHEN start component', function() {
  this.timeout(10000);
  describe('Interface', function() {
    it('should have empty username', function(done) {
      interfaceBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).value;
        }, '#username')
        .then(function(username) {
          expect(username).to.equal('');
          done();
        })
    });
  });

  describe('Build', function() {
    it('should have message to configure widget', function(done) {
      const selector = `${buildSelector} h3`;
      buildBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).textContent;
        }, selector)
        .then(function(message) {
          expect(message).to.equal('This is the output of your widget');
          done();
        });
    });
  });
});
```