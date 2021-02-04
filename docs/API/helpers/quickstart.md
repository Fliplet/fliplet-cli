# Quickstart

Helpers can be created by defining them via **screen or global JavaScript code** in your apps. A helper requires a **name** and its **configuration object** which defines its behaviour.

<p class="quote">Before you get started, <strong>add the required <code>fliplet-helper</code> package</strong> to your screen or app's dependencies via Fliplet Studio.</p>

---

## 1. Define your helper

Define your helper in the <strong>Screen JavaScript or Global JavaScript</strong> of your Fliplet app:

```js
Fliplet.Helper({
  name: 'accordion',
  displayName: 'Accordion',
  icon: 'sample',
  render: {
    template: '<div class="accordion"><h3>Title: {! fields.title !}</h3>' +
              '<p>Content: {! fields.content !}</p></div>'
  },
  configuration: {
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'content', type: 'text', label: 'Content' }
    ]
  }
});
```

Here's an explanation of what the above helper declares:
- a template string for the helper, which would print some HTML with two dynamic properties such as `fields.title`
- a configuration UI to set up the value for the two dynamic properties

## 2. Drop the helper into your screen

Once the helper has been defined it **will be shown in the components list of Fliplet Studio alongside our 1st-party components**. If you drag & drop the helper in your app screen, a new instance of the helper will be created when the helper has been dropped.

**Helpers are required to declare both the `displayName` and `icon` properties in order to be displayed in the components list of Fliplet Studio**.

The output in the screen should look like the following:

![image](/assets/img/helper-1.png)

<p class="quote">Note: <strong>Every time you drop an helper into a screen a new "instance" gets created.</strong> Each helper is independent from each other and you can create as many as you want.</p>

## 3. Instance HTML

Finally, if you check the resulting HTML via the Screen HTML in Fliplet Studio or the browser you will see the produced HTML, which should equal to:

```html
<fl-helper name="accordion">
  <field name="title">Hello</field>
</fl-helper>
```

This is also how you can copy and paste helper instances between your apps or screens of your app.

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="templates.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Helper HTML template</h4>
      <p>Learn more about the feature of the helper templates property.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>