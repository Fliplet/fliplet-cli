# Configuration Interface

You can create configuration interfaces for your helpers by defining a set of fields for the UI. This allows you to quickly configure field values for each helper instance once clicked on Fliplet Studio while in edit mode:

![image](/assets/img/helper-2.png)
<small style="text-align: center;display: block"><i>A helper in Fliplet Studio, showing its configuration interface on the right hand side.<br/><br /></i></small>

## Define an interface

Start by adding a `configuration` object to your helper, including the list of fields to present:

```js
Fliplet.Helper('accordion', {
  template: '<div class="accordion"><h3>Title: {! fields.title !}</h3>' +
            '<fl-if data-path="fields.title">' +
            '<p>Content: {! fields.content !}</p></fl-if></div>',
  configuration: {
    title: 'Configure your accordion',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'content', type: 'text', label: 'Content' }
    ]
  }
});
```

Each field can define its name, type and label. Once the user saves the configuration, the resulting values will be saved in the instance HTML, which can be seen and edited via the developer options:

![image](/assets/img/helper-3.png)

---

<section class="blocks alt">
  <a class="bl two" href="interface-fields.html">
    <div>
      <span class="pin">Next up</span>
      <h4>Fields</h4>
      <p>Learn the different field types and their options.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
  <a class="bl two" href="interface-hooks.html">
    <div class="secondary">
      <span class="pin"><i class="fa fa-file-alt"></i></span>
      <h4>Hooks &amp; Events</h4>
      <p>Browse the available hooks and events for helper interfaces.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
</section>