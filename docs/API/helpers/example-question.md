# Example Helper

## "Answer a question"

The following snippet illustrates how to create a simple helper showing a question with a set of answers. Upon selecting an answer, a further helper will show whether the answer is correct. Here's a preview of what it's going to look like:

![image](/assets/img/helper-example.png)

### JavaScript

```js
Fliplet.Helper({
  name: 'question',
  displayName: 'Question',
  icon: 'fa-check',
  render: {
    template:
      '<p>{! fields.title !}</p>' +
      '{! each answer in fields.answers !}' +
      '<label><input type="radio" name="{! fields.title !}" class="answer" value="{! answer.label !}" /> {! answer.label !}</label><br />' +
      '{! endeach !}',
    beforeReady: function() {
      // The question has been shown to the user
    },
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
  },
  configuration: {
    title: 'Question',
    fields: [
      { name: 'title',
        type: 'text',
        label: 'Enter the question',
        default: 'Best country ever?'
      },
      {
        name: 'answers',
        type: 'textarea',
        label: 'Answers',
        description: 'One answer each line. Add "(answer)" to the end of the correct answer',
        rows: 6
      }
    ],
    beforeSave: function(data, configuration) {
      // Convert the multiline text to an array of objects
      data.answers = _.compact(
        data.answers.split(/\r|\n|\r\n/).map(function(answer) {
          if (!answer.trim()) {
            return;
          }

          return {
            label: answer.replace(/[ ]+\(answer\) ?/, '').trim(),
            correct: answer.indexOf('(answer)') > 0
          };
        })
      );
    },
    beforeReady: function(data) {
      // Convert the array of objects to a multiline text to be shown to the user
      if (Array.isArray(data.answers)) {
        data.answers = data.answers
          .map(function(answer) {
            return answer.label + (answer.correct ? ' (answer)' : '');
          })
          .join('\r\n');
      }
    },
    ready: function() {
      // Configuration UI has been shown to the user
    }
  }
});

Fliplet.Helper('results', {
  template:
    '{! if answer !}Your answer is <strong>{! answer !}. Your answer is {! if correct !}correct{! else !}incorrect{! endif !}{! else !}<p>Please pick an answer</p>{! endif !}.'
});
```

### HTML

```html
<fl-helper name="question">
  <field name="title">Which country is closer to the Mediterranean Sea?</field>
  <field name="answers">
    [{"label":"UK","correct":false},{"label":"USA","correct":false},{"label":"Italy","correct":true},{"label":"Japan","correct":false}]
  </field>
</fl-helper>

<fl-helper name="results"></fl-helper>
```

### CSS

```css
fl-helper[name="question"] {
  padding: 20px;
  background: #EFEFEF;
  display: block;
}
```