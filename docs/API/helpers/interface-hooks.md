# Hooks & Events

## Run a function when a field is initialized

Use the `init` property on a field to define a function to run when the field is initialized.

See how the example below manually defines an input field which handles user input and updates the actual value:

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! attr.name !}, how are you?</p>',
  configuration: {
    fields: [
      {
        name: 'lastName',
        type: 'html',
        label: 'Some html',
        description: 'Lorem ipsum dolor sit amet',
        html: '<input type="text" />',
        init: function(el) {
          var vm = this;

          $(el)
            .find('input')
            .val(this.value)
            .change(function() {
              vm.val($(this).val());
            });
        }
      }
    ]
  }
});
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="interface-libraries.html">
    <div>
      <span class="pin">Recommended reading</span>
      <h4>External libraries</h4>
      <p>Learn how configuration UIs can use external libraries.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
</section>