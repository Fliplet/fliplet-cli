# `Fliplet.UI.NumberInput()`

(Returns `Object`)

Create a number input field. This provides a simple mechanism to allow the input of a number.

## Install

Add the `fliplet-ui-number` dependency to your screen or app libraries.

## Usage

To set up a number input, use the following markup.

```html
<div class="form-group fl-number-input" id="target">
  <input type="number" class="form-control">
</div>
```

The number input can be initialized with a preset value by giving the `type="number"` input a `value`.

Then, instantiate the number input using the `Fliplet.UI.NumberInput` constructor.

```js
var instance = Fliplet.UI.NumberInput('#target');
```

## Constructor

```js
Fliplet.UI.NumberInput(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **required** (`Boolean`) If `true`, users will not be able to clear the field after it's given a value. (**Default**: `false`)

## Properties

The number input instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the number input instance.

## Methods

The number input instance supports the following methods.

### `.get()`

(Returns `Number`)

Gets the value of the number input. If there is no value, `undefined` is returned. If it's an invalid value, `NaN` is returned.

```js
instance.get()
```

### `.set()`

Gives the number input a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`Number|String`) New number input value
  - **triggerChange** (`Boolean`) If `false`, the number input value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the number input value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<Number>`) Callback function to be run when the number input value changes. The function is called with the instance as the `this` context and the new number value as the parameter.

## Helper functions

### `Fliplet.UI.NumberInput.get()`

(Returns `Object`)

Gets the number input instance from a node or jQuery object.

```js
Fliplet.UI.NumberInput.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Number Input](fliplet-ui-number.md) (`fliplet-ui-number`)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
