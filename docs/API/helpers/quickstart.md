# Quickstart

Helpers can be created by defining them via **screen or global JavaScript code** in your apps. A helper requires a **name** and its **configuration object** which defines its behaviour.

<p class="quote">Before you get started, <strong>add the required <code>fliplet-helper</code> package</strong> to your screen or app's dependencies via Fliplet Studio.</p>

---

## 1. Define the helper

Define your helper in the Screen JS or Global JS of your Fliplet app:

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! attr.firstName !}, how are you?</p>',
  configuration: {
    fields: [
      {
        name: 'firstName',
        label: 'First name'
      }
    ]
  }
});
```

Here's an explanation of what the above helper declares:
- a HTML template for the helper, which would print a paragraph with some text and the dynamic property `attr.firstName`
- a configuration UI to set up the value for the dynamic property described above

## 2. Drop the helper into your screen

Once the helper has been defined it **will be shown in the components list of Fliplet Studio alongside our 1st-party components**. If you drag & drop the helper in your app screen, a new instance of the helper will be created when the helper has been dropped.

The output in the screen should look like the following:

```html
<p>Hi John, how are you?</p>
```

## 3. Instance HTML

Finally, if you inspect the resulting HTML either via the developer tools in Fliplet Studio or the browser you will see the produced HTML, which should be alongside these lines:

```html
<fl-helper data-type="welcome">
  Hi <fl-prop data-path="name"></fl-prop>, how are you?
</fl-helper>
```

This is also how you can copy and paste helper instances between your apps or screens of your app.

---

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