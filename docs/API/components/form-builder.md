# Fliplet Form Builder JS APIs

```js
// the "get()" accepts the form name in case you have multiple forms on the page
Fliplet.FormBuilder.get().then(function (form) {
  // get the input value
  form.field('foo').val();

  // set the input value
  form.field('foo').val('bar');

  // registers a callback to be fired whenever the field value changes
  form.field('foo').change(function (val) {

    // only show / enable this field when val is "bar"
    // works like jQuery "toggle", which evaluates the argument as a "truthy" boolean.
    form.field('barbaz').toggle(val === 'bar');

  });
});
```