# Building app action functions

To start creating a function to be used in an App Action, use the CLI to generate a boilerplate including the basic things you'll need:

```
$ fliplet create-function com.example.function.say-hello "Say hello"
```

The above code will create a new folder named "say-hello" including the skeleton of your function, including these files:

```
js/build.js
widget.json
```

## Including external libraries

Functions can define the list of [dependencies](/Dependencies-and-assets.html#dependencies-and-assets) to be used in the `widget.json` file under the `"build" > "dependencies"` key of the file.

## The function definition file

The `widget.json` file defines your component as well as the **dependencies** and **assets** it needs in order to run.

```json
{
  "name": "Say hello",
  "package": "com.example.function.say-hello",
  "build": {
    "dependencies": [],
    "assets": ["js/build.js"]
  }
}
```

---

## Anatomy of a function

Functions are very simple to create. They are just a single Javascript file that exports a function:

```js
Fliplet.Functions.register('com.example.function.say-hello', function(settings, context) {
  alert('Hello');
});
```

The above function will be executed when the function is called from the app. The function will receive two arguments:

- `settings`: an object containing the settings of the function, as defined in the app action
- `context`: an object containing the context of the function, including the `context.event` object that triggered the function

The function can return a value, which will be passed to the app action as the result of the function. If the function returns a promise, the app action will wait for the promise to be resolved before continuing.

Furthermore, the `context` object can be extended with data to be passed to the next function in the chain. For example, the following function will pass the `name` property to the next function in the chain:

```js
Fliplet.Functions.register('com.example.function.say-hello', function(settings, context) {
  context.name = 'John';

  return Promise.resolve();
});
```

Let's try an example where the function settings define a data source ID to be used to retrieve data from. Furthermore, the app action input contains the email of a user to be used to filter the data source:

```js
Fliplet.Functions.register('com.example.function.findUser', function(settings, context) {
  return Fliplet.DataSources.connect(settings.dataSourceId)
    .then(function(dataSource) {
      return dataSource.findOne({
        where: {
          email: context.event.email
        }
      });
    })
    .then(function(records) {
      if (!records.length) {
        return Promise.reject('No records found');
      }

      return records[0].name;
    });
});
```

The above function would have an app action pipeline as follows:

```json
{
  "functions": [
    { "widgetId": 123, "settings": { "dataSourceId": 456 } }
  ]
}
```

And it would be called in app as follows:

```js
Fliplet.App.Actions.runWithResult('find-a-user', {
  email: 'john@example.org'
}).then(function (result) {
  alert('The user name is: ' + result);
});
```