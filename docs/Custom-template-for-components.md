# Custom templates for components

Fliplet components are usually rendered into an app screen with the `{{{ widget 123 }}}` syntax, where `123` would be the ID of the component.

If you need to customise how a component look — and CSS itself is not enough — you can customise the component template by changing the widget declaration tag to a handlebars block by prefixing "widget" with a hashtag and also add a closure tag. You also must use just two curly brackets to enclose the tags instead of three:

{% raw %}
```handlebars
{{#widget 123}}
  <div>I can put any html here.</div>
  <p>I can also access widget instance attributes using handlebars like {{ name }}.</p>
  <p>I can even print the original widget template using {{{html}}}.</p>
{{/widget}}
```
{% endraw %}

Let's make a hands-on example customising a primary button. First, let's take a look at its default output on the open source github repository: https://github.com/Fliplet/fliplet-widget-primary-button/blob/master/build.html

{% raw %}
```handlebars
<input data-primary-button-id="{{id}}" type="button" class="btn btn-primary" value="{{#if label}}{{label}}{{else}}Primary button{{/if}}" />
```
{% endraw %}

As you can see, the widget declares a `{{id}}` and `{{label}}` that we must use to keep the component behaviour. We could then customise this widget instance html as follows:

{% raw %}
```handlebars
{{#widget 123}}
  <div data-primary-button-id="{{id}}">
    <p>My custom button named {{label}}
  </div>
{{/widget}}
```
{% endraw %}

Note: `data-primary-button-id="{{id}}"` is required by the primary button javascript code to make the link work. Each widget might have different ways of attaching events and handlers based on dom classes, nodes or attributes.

![img](https://cl.ly/0j451L1O3b2V/Image%202018-05-25%20at%201.48.42%20PM.png)

---

## Nested widgets

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

## Inspect what data is available in the template

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