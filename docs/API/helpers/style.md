# Styling

## Using class and style attributes

Standard `class` and `style` HTML attributes can be used as usual, since they won't be treated as helper attributes:

```html
{! start welcome class="my-container" !}
  <p>Hi {! firstName !} {! attr.lastName !}, how are you?</p>
{! end welcome !}
```