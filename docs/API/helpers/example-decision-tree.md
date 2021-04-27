---
description: Build a decision tree using the Fliplet Helper library.
---

# Example Helper

## Decision Tree

The following snippet illustrates how to create a simple decision tree showing a question with a set of answers. Upon selecting an answer, the next question will be presented to the user.

The helper includes:
- a rich content view where the question content can be dropped and configured
- an interface for configuring the list of answers and the action for each answer

![image](/assets/img/helper-example-decision-tree.png)

### JavaScript

```js
Fliplet.Helper({
  name: 'question',
  displayName: 'Question',
  icon: 'fa-check',
  render: {
    template: [
      '{! if show !}',
      '<div <div data-view="content"></div>',
      '{! each button in fields.buttons !}',
      '<button data-to="{! button.goto !}" class="answer">{! button.label !}</button><br />',
      '{! endeach !}',
      '{! endif !}'
    ].join(''),
    views: [
      {
        name: 'content',
        displayName: 'Question content',
        placeholder: '<p>Drop content here</p>'
        }
    ],
    ready: function() {
      var vm = this;

      // Show this question on load if marked to be shown
      if (_.first(this.fields.showOnLoad) === 'Yes') {
        this.set('show', true);
      }

      // Register a click event when the answer is clicked
      this.$el.find('.answer').click(function() {
        // Find the label of the clicked answer button
        var label = $(this)
          .find('fl-prop')
          .html();
        var button = _.find(vm.fields.buttons, { label: label });

        // Hide the current question
        vm.set('show', false);

        if (button && button.goto) {
          // Find the target question
          var question = Fliplet.Helper.findOne({
            name: vm.name,
            fields: { id: parseInt(button.goto, 10) }
          });

          if (question) {
            // Show the target question, if found
            question.set('show', true);
          }
        }
      });
    }
  },
  configuration: {
    title: 'Question',
    fields: [
      { name: 'id', type: 'text', label: 'Question ID' },
      {
        type: 'checkbox',
        name: 'showOnLoad',
        label: 'Show question on load',
        options: ['Yes']
      },
      {
        name: 'buttons',
        label: 'Buttons',
        type: 'group',
        addLabel: 'Add button',
        headingFieldName: 'label',
        emptyListPlaceholderHtml: '<p>Please add at least one button</p>',
        fields: [
          {
            name: 'label',
            type: 'text',
            label: 'Label',
            placeholder: 'Go to Question 2'
          },
          {
            name: 'goto',
            type: 'text',
            label: 'Go to Question'
          }
        ]
      }
    ]
  }
});

```

### HTML

```html
<fl-helper name="question">
  <view name="content">
    <fl-container cid="123"></fl-container>
    <fl-text cid="456">
      <p>Here goes the content for the first question</p>
    </fl-text>
  </view>
</fl-helper>
```

### SCSS

```scss
fl-helper[name="question"] {
  background: #EFEFEF;
  display: block;

  button {
    display: block;
    margin: 0 15px;
    padding: 3px 20px;
    fl-prop {
      font-size: 16px;
    }
  }
}

```