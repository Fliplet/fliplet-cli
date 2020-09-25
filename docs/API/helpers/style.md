# Styling

Helpers can be styles using any standard CSS property since they are rendered as HTML elements.

## Using class and style attributes

Standard `class` and `style` HTML attributes can be used as usual, since they won't be treated as helper attributes:

```html
<fl-helper data-type="accordion" class="my-container"></fl-helper>
```

The template shorthand syntax also supports both properties:

```html
{! start welcome class="my-container" !}
  <p>Hi {! firstName !} {! attr.lastName !}, how are you?</p>
{! end welcome !}
```