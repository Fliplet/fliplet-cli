# Common functions

The following functions do not belong to a specific namespace and are available under the `Fliplet` object.

## Compile

Compiles a string with a handlebars-like template replacement.

```js
var compiledString = Fliplet.compile('Hello {{name}}', { name: 'Nick' });
```

## Guid

Generates a global unique identifier with a format like: `"2682df5f-2679-7de5-c04c-d212f4314897"`

```js
var guid = Fliplet.guid();
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="quickstart.html">
    <div class="secondary">
      <h4>Fliplet.Navigate</h4>
      <p>Learn how to navigate between different screens of your app or open a webpage.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
  <a class="bl two" href="quickstart.html">
    <div class="secondary">
      <h4>Fliplet.Storage</h4>
      <p>Learn how to read and write persistent data locally on the device or web browser.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>