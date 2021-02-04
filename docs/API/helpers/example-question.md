# Example Helper

## "Answer a question"

The following snippet illustrates how to create a simple helper showing a question with a set of answers. Upon selecting an answer, a further helper will show whether the answer is correct. Here's a preview of what it's going to look like:

![image](/assets/img/helper-example.png)

### JavaScript

```js
var results;

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
      console.log('The question has been showed to the user');
    },
    ready: function() {
      var vm = this;

      this.$el.find('.answer').click(function() {
        var currentAnswer = $(this).val();
        var answer = _.find(vm.fields.answers, { label: currentAnswer });
        var result = Fliplet.Helper.findOne({ type: 'result' });

        results.set('answer', currentAnswer);
        results.set('correct', !!answer.correct);
      });
    }
  },
  configuration: {
    title: 'Question',
    fields: [
      { name: 'title', type: 'text', label: 'Enter the question', default: 'Best country ever?' },
      {
        name: 'answers',
        type: 'textarea',
        label: 'Answers',
        description: 'One answer each line. Add "(answer)" to the end of the correct answer',
        rows: 6
      }
    ],
    beforeSave: function(data, configuration) {
      data.answers = _.compact(
        data.answers.split(/\r|\n|\r\n/).map(function(answer) {
          if (!answer.trim()) {
            return;
          }
          return {
            label: answer.replace(/[ ]+\(answer\)/, '').trim(),
            correct: answer.indexOf('(answer)') > 0
          };
        })
      );
    },
    beforeReady: function(data) {
      console.log('beforeReady', data);

      if (Array.isArray(data.answers)) {
        data.answers = data.answers
          .map(function(answer) {
            return answer.label + (answer.correct ? ' (answer)' : '');
          })
          .join('\r\n');

        console.log(data, data.answers);
      }
    },
    ready: function() {
      console.log('Configuration UI has been showed to the user');
    }
  }
});

Fliplet.Helper('results', {
  template:
    '{! if answer !}Your answer is <strong>{! answer !}. Your answer is {! if correct !}correct{! else !}incorrect{! endif !}{! else !}<p>Please pick an answer</p>{! endif !}.',
  ready: function() {
    results = this;
  }
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