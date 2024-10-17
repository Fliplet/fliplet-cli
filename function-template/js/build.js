Fliplet.Functions.register('{{package}}', function(settings, context) {
  // "settings" is an object that contains the settings of the function
  // "context" is an object that contains the context of the app action

  // Replace this code with your own

  // e.g. fetch a sample variable from the settings
  const msg = _.get(settings, 'message', 'default');

  // log the message to the console
  console.log(`The configured message is "${msg}"`);

  // return a promise that resolves with content to be passed to the next function
  // you can also extend the context object with additional properties
  return Promise.resolve();
})