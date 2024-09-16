# `Fliplet.UI.RangeSlider()`

(Returns `Object`)

Create a range slider input field. This provides a simple mechanism to allow the selection of a number within the given range.

## Install

Add the `fliplet-ui-rangeslider` dependency to your screen or app libraries.

## Usage

To set up a range slider field, use the following markup.

```html
<div class="form-group fl-range-slider" id="target">
  <input type="range" min max step value>
</div>
```

The range slider can be initialized with the following presets via attributes set on the `type="range"` input.

  - **min** (`Number`) The lowest value in the range of permitted values. (**Default**: `0`)
  - **max** (`Number`) The greatest value in the range of permitted values. (**Default**: `100`)
  - **step** (`Number`) The step attribute is a number that specifies the granularity that the value must adhere to. Only values that match the specified stepping interval are valid.
  - **value** (`Number`) Default value for the field

Then, instantiate the slider range field using the `Fliplet.UI.RangeSlider` constructor.

```js
var instance = Fliplet.UI.RangeSlider('#target');
```

## Constructor

```js
Fliplet.UI.RangeSlider(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **value** (`Number`) Default value

## Properties

The range slider instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the range slider instance.

## Methods

The range slider instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the range slider field.

```js
instance.get()
```

### `.set()`

Gives the range slider field a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`Object`) New range slider value.
  - **triggerChange** (`Boolean`) If `false`, the range slider value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the range slider value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the range slider value changes. The function is called with the instance as the `this` context and the new range slider value as the parameter.

## Helper functions

### `Fliplet.UI.RangeSlider.get()`

(Returns `Object`)

Gets the range slider instance from a node or jQuery object.

```js
Fliplet.UI.RangeSlider.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Number Input](fliplet-ui-number.md) (`fliplet-ui-number`)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
