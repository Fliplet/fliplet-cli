# Using Handlebars in your apps

All screens of your Fliplet app already include [Handlebars `2.15.2`](https://handlebarsjs.com/) hence you can start using it straight away. Here's a quick example following the official Handlebars docs:

{% raw %}
```js
// Compile a template in JavaScript by using Handlebars.compile
var source = '<h1>{{ title }}</h1><p>{{ body }}</p>';
var template = Handlebars.compile(source);

// Get the HTML result of evaluating a Handlebars template by executing the template with a context.
var context = { title: 'My New Post', body: 'This is my first post!' };
var html = template(context);
```
{% endraw %}

## Using a template script for long-form templates

For clarity, you can include your source templates in the screen's HTML so they're easier to write. This is particularly useful if you are writing long-form templates. If you do so, **you must escape all Handlebars commands with a backslash (`\`)** because the screen HTML is also compiled by Handlebars in Fliplet's engine:

{% raw %}
```handlebars
<p>This is the screen of a Fliplet app</p>

<div id="output">
  <!-- This is where we will put the compiled HTML -->
</div>

<script id="source" type="text/x-handlebars-template">
\{{#if title}}
  <h4>\{{ title }}</h4>
  <p>\{{ body }}</p>
\{{/if}}
</script>
```
{% endraw %}

```js
// Grab the template from the HTML and compile it with Handlebars
var source = $('#source').html();
var template = Handlebars.compile(source);

// Get the HTML result
var context = { title: 'My New Post', body: 'This is my first post!' };
var compiledHTML = template(context);

// Write the HTML into our output
$('#output').html(compiledHTML);
```

<img src="../../assets/img/handlebars.png" />

## Using helpers to enhance your templates

Handlebars helpers can be used to add formatting (with **Expression Helpers**) and enhanced logic operations (with **Block Expression Helpers**) to your content. See [Handlebars documentation](https://handlebarsjs.com/) to learn how to use and write your own helpers.

Fliplet apps are loaded with the following helpers.

{% raw %}

### Expression Helpers

- `images` outputs multiple `<img>` tags based on the URLs provided, e.g. `{{images urls}}`
   - `urls` An array of image URLs
- `auth` outputs an authenticated URL for any encrypted assets stored by Fliplet, e.g. `{{auth url}}`
   - `url` URL to be authenticated
- `moment` outputs a date/time value based on the provided format, e.g. `{{moment timestamp "MMM Do YY"}}`
   - `timestamp` Timestamp to be parsed
   - The second parameter is a string that represents the format [as documented by Handlebars](https://momentjs.com/docs/#/parsing/string-format/)
- `nl2br` changes any new lines or carriage returns in the value to a `<br>` tag, adding a new line to the HTML output, e.g. `{{nl2br str}}`
   - `str` String to be parsed for new lines
- `toJSONString` changes any objects to a JSON string, e.g. `{{toJSONString obj}}`
   - `obj` Object to be parsed into a JSON string

### Block Expression Helpers

- `equals` checks if two values provided are exactly the same, e.g. `{{#equals a b}}{{else}}{{/equals}}`
- `and` checks if two conditions are both truthy, e.g. `{{#and a b}}{{else}}{{/and}}`
- `or` checks if one of the two conditions are truthy, e.g. `{{#or a b}}{{else}}{{/or}}`
- `comparison`, e.g. `{{#comparison a '===' b}}{{else}}{{/comparisons}}`
   - The second parameter can be swapped out with any of the following operators for comparison: `==`, `===`, `!=`, `!==`, `<`, `>`, `<=`, `>=`, `typeof` (e.g. `{{#comparison a 'typeof' "string"}}{{else}}{{/comparisons}}`)

{% endraw %}

---

