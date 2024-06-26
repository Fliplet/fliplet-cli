# Dynamic components

<p class="warning">This feature is currently available to beta users only.</p>

Helpers can be dropped into what we refer as "dynamic components". These include the **Dynamic container** and **List Repeater** components. Such components supports reactive data binding between the source of the data and the helpers you build.

To support reactive data communication between the two, you must add the `supportsDynamicContext: true` property to your helper configuration:

```js
Fliplet.Helper({
  name: 'profile',
  supportsDynamicContext: true
});
```

When the above property is set, the `parent` property of your instance will reference the parent container that initialized your helper (unless the parent component is a helper, in which case the property will reference such helper).

## Dynamic container

### Data binding

You can use the Dynamic container's connection object to retrieve data from a data source:

```js
Fliplet.Helper({
  name: 'profile',
  supportsDynamicContext: true,
  render: {
    ready() => {
      // Get the connection object from the parent component
      this.parent.connection().then((connection) => {
        // Find all entries in the data source
        return connection.findWithCursor(cursorData);
      }).then((rows) => {
        // Set the data to the helper
        this.set('foo', rows);
      });
    }
  }
});
```

Here's a working example of a helper using data from the dynamic container component:

```js
Fliplet.Helper({
  name: 'question',
  displayName: 'Question',
  icon: 'fa-check',
  supportsDynamicContext: true,
  render: {
    template:
      '{! each person in context !}' +
      '<label><input type="radio" name="{! fields.title !}" class="answer" value="{! person.data.email !}" /> {! person.data.Name !}</label><br />' +
      '{! endeach !}',
    ready: function() {
      var vm = this;

      // Register a click event when the answer is clicked
      this.$el.find('.answer').click(function() {
        var currentAnswer = $(this).val();
        var answer = _.find(vm.fields.answers, { label: currentAnswer });
        var results = Fliplet.Helper.findOne({ name: 'results' });

        results.set('answer', currentAnswer);
        results.set('correct', !!answer.correct);
      });
    }
  }
});
```

---

## Repeater

### Data binding

The repeater component declares its own context under the `row` attribute. The example below demonstrates a helper that renders data from the `Name` column of a Data Source Entry. The helper reads the `row` context data from the repeater component, which loops through an array of records.

```js
Fliplet.Helper({
  name: 'person',
  displayName: 'Person',
  icon: 'fa-check',
  supportsDynamicContext: true,
  render: {
    template: '<li>Name: {! row.data.Name !}</li>'
  }
});
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="views.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Views</h4>
      <p>Learn more about how to add rich-content views to your helper.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>
