# `Fliplet.UI.DatePicker()`

(Returns `Object`)

Create a date picker input field. This provides a simple mechanism to allow the selection of a date.

## Install

Add the `fliplet-ui-datetime` dependency to your screen or app libraries.

## Usage

To set up a date picker, use the following markup.

```html
<div class="form-group fl-date-picker" id="target">
  <i class="fa fa-calendar fa-fw"></i>
  <input type="date" class="form-control">
  <input type="text" class="form-control">
  <i class="fa fa-times fa-fw"></i>
</div>
```

The date picker can be initialized with a preset value by giving the `type="date"` input a `value`.

Then, instantiate the date picker field using the `Fliplet.UI.DatePicker` constructor.

```js
var instance = Fliplet.UI.DatePicker('#target');
```

## Constructor

```js
Fliplet.UI.DatePicker(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **required** (`Boolean`) If `true`, users will not be able to clear the field after it's given a value. If `false`, a "X" icon will be visible to help users clear the date field. (**Default**: `false`)

## Properties

The date picker instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the date picker instance.

## Methods

The date picker instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the date field in `YYYY-MM-DD` format, or an empty string if there is no valid date value.

```js
instance.get()
```

### `.set()`

Gives the date picker a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`String`) New date value in `YYYY-MM-DD` format
  - **triggerChange** (`Boolean`) If `false`, the date picker value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the date picker value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the date picker value changes. The function is called with the instance as the `this` context and the new date value as the parameter.

## Helper functions

### `Fliplet.UI.DatePicker.get()`

(Returns `Object`)

Gets the date picker instance from a node or jQuery object.

```js
Fliplet.UI.DatePicker.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Number Input](fliplet-ui-number.md)
  - [Time Picker](fliplet-ui-timepicker.md)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
