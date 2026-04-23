# Styling Helpers

Style a Helper using standard `class` and `style` HTML attributes — they are passed through to the rendered element rather than treated as Helper fields.

## Using class and style fields

Standard `class` and `style` HTML fields can be used as usual, since they won't be treated as helper fields:

```html
<fl-helper name="accordion" class="my-awesome-helper"></fl-helper>
```

The template shorthand syntax also supports both properties:

```html
{! start welcome class="my-awesome-helper" !}
  <p>Hi {! firstName !} {! fields.lastName !}, how are you?</p>
{! end welcome !}
```