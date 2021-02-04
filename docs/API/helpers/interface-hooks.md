# Hooks & Events

## Interface

### Run a function before the interface is initialized

Use the `beforeReady` property on the configuration object to define a function to run before the configuration interface gets initialized:

```js
Fliplet.Helper('question', {
  configuration: {
    fields: [
      { name: 'title', type: 'text', label: 'Title' }
    ],
    beforeReady: function (data) {
      // here the interface has not been initialised
      data.title = data.title || 'Insert a title';
    }
  }
});
```

### Run a function when the interface is initialized

Use the `ready` property on the configuration object to define a function to run when the configuration interface gets initialized:

```js
Fliplet.Helper('question', {
  configuration: {
    fields: [
      { name: 'title', type: 'text', label: 'Title' }
    ],
    ready: function (data, configuration) {
      // here the interface has been initialised
    }
  }
});
```

---

### Run a function before the interface is saved

Use the `beforeSave` property on the configuration object to define a function to run before the configuration interface data gets saved.

In the following example, the "tags" property is split into an array before it's saved and then it's converted back into a string right before displaying it in the text field:

```js
Fliplet.Helper('question', {
  configuration: {
    fields: [
      { name: 'tags', type: 'text', label: 'Tags' }
    ],
    beforeSave: function (data, configuration) {
      data.tags = data.tags.split(',');
    },
    beforeReady: function (data) {
      data.tags = data.tags.join(',');
    }
  }
});
```

---

## Fields

### Run a function when a field is initialized

Use the `ready` property on a field to define a function to run when the field is initialized.

See how the example below manually defines an input field which handles user input and updates the actual value:

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>',
  configuration: {
    fields: [
      {
        name: 'lastName',
        type: 'html',
        label: 'Some html',
        description: 'Lorem ipsum dolor sit amet',
        html: '<input type="text" />',
        ready: function(el) {
          var currentField = this;

          // 1. populate the input with the existing value
          $(el)
            .find('input')
            .val(this.value)
            .change(function() {
              // 2. Update the field instance on input change
              currentField.val($(this).val());
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