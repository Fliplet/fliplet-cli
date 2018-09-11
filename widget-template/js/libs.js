// Use the Fliplet.Registry to define javascript libraries
// that your widget need to use. Make sure to namespace them
// with the widget version (e.g. 1.0) so that new versions
// won't conflict between each other.

Fliplet.Registry.set('{{safeName}}:1.0:core', function (element, data) {
  // A private variable
  var foo = 'Hello world from your widget';

  console.log(foo, element, data);

  return {
    bar: function () {
      // A public function
    }
  }
});