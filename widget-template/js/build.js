// Include your namespaced libraries
var mySampleCoreLibrary = new Fliplet.Registry.get('{{safeName}}:1.0:core');

// This function will run for each instance found in the page
Fliplet.Widget.instance('{{safeName}}-1-0-0', function(data, parent) {
  // The HTML element for each instance. You can use $(element) to use jQuery functions on it
  var element = this;

  // Sample implementation to initialize the widget
  var foo = new mySampleCoreLibrary(element, data);
}, {
  // Set this to true if your component supports being initialized
  // from a dynamic container
  supportsDynamicContext: false
});
