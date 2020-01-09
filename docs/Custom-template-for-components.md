# Custom templates for components

## For apps using the new drag and drop system

Apps created on or after January 9th 2020 use a new improved drag and drop system based on containers which also greatly improves the experience when using the developer tools to code custom templates for components.

This is how components are shown in the developer tools:

```html
<fl-button cid="123"></fl-button>
```

To customise a component template, you can simply type HTML code in the tag:

```html
<fl-button cid="123">
  <p>This is my custom template for a button</p>
</fl-button>
```

You can also refer to any instance attribute of such component by using the handlebars syntax as follows:

{% raw %}
```handlebars
<fl-button cid="123">
  <div>My custom button</div>
  <p>Access widget instance attributes using handlebars like {{ name }}.</p>
  <p>If required, print the original widget template using {{{html}}}.</p>
</fl-button>
```
{% endraw %}

**Note**: as soon as you hit the save button the HTML tag will change from the specific component (e.g. `fl-button`) to `fl-component` to symbolize that you're creating a custom component. If you need to revert the custom component to its default template, just remove any HTML it contains and press the save button.

---

## For legacy apps

Fliplet components are usually rendered into an app screen with the {% raw %}`{{{ widget 123 }}}`{% endraw %} syntax, where `123` would be the ID of the component.

If you need to customise how a component look — and CSS itself is not enough — you can customise the component template by changing the widget declaration tag to a handlebars block by prefixing the `widget` word with a hashtag and also add a closure tag. You also must use only **two curly brackets** to enclose the tags instead of three:

{% raw %}
```handlebars
{{#widget 123}}
  <div>I can put any html here.</div>
  <p>I can also access widget instance attributes using handlebars like {{ name }}.</p>
  <p>I can even print the original widget template using {{{html}}}.</p>
{{/widget}}
```
{% endraw %}

Let's make a hands-on example customising a **primary button**. First, let's take a look at its default output on the [open source github repository](https://github.com/Fliplet/fliplet-widget-primary-button/blob/master/build.html):

{% raw %}
```handlebars
<input data-primary-button-id="{{id}}" type="button" class="btn btn-primary" value="{{#if label}}{{label}}{{else}}Primary button{{/if}}" />
```
{% endraw %}

As you can see, the widget declares a {% raw %}`{{id}}`{% endraw %} and {% raw %}`{{label}}`{% endraw %} that we must use to keep the component behaviour. We could then customise this widget instance html as follows:

{% raw %}
```handlebars
{{#widget 123}}
  <div data-primary-button-id="{{id}}">
    <p>My custom button named {{label}}
  </div>
{{/widget}}
```
{% endraw %}

Note: {% raw %}`data-primary-button-id="{{id}}"`{% endraw %} is required by the primary button javascript code to make the link work. Each widget might have different ways of attaching events and handlers based on dom classes, nodes or attributes.

![img](https://cl.ly/0j451L1O3b2V/Image%202018-05-25%20at%201.48.42%20PM.png)

---

### Nested widgets

Given you have two or more widgets on the screen:

{% raw %}
```handlebars
{{{ widget 123 }}}
{{{ widget 456 }}}
```
{% endraw %}

You can put one into the other by simply writing a custom block for the first and adding the second widget into it:

{% raw %}
```handlebars
{{#widget 123}}
  <div data-primary-button-id="{{id}}">
    <p>My custom button named {{label}}
  </div>

  <p>And here I'm going to include the other widget: {{{ widget 456 }}}</p>
{{/widget}}
```
{% endraw %}

---

### Inspect what data is available in the template

There's a handy handlebars helper to print out the content of an object as JSON:

{% raw %}
```handlebars
{{{ toJSON foo }}}
```
{% endraw %}

This is useful to find out what settings you have available in a component when creating the custom template

{% raw %}
```handlebars
{{#widget 123}}
  <pre>{{{ toJSON this }}}</pre>
{{/widget}}
```
{% endraw %}

![gif](https://cl.ly/0M1X0K341s0F/Image%202018-05-25%20at%201.46.52%20PM.png)

---