# Fliplet Form Builder JS APIs

```js
// the "get()" accepts the form name in case you have multiple forms on the page
Fliplet.FormBuilder.get().then(function (form) {
  // get the input value
  form.field('foo').val();

  // set the input value
  form.field('foo').val('bar');
});
```