# `Fliplet.UI.TimePicker()`

(Returns `Object`)

Create a time picker input field. This provides a simple mechanism to allow the selection of a time.

## Install

Add the `fliplet-ui-datetime` dependency to your screen or app libraries.

## Usage

To set up a time picker, use the following markup.

```html
<div class="form-group fl-time-picker" id="target">
  <i class="fa fa-clock-o fa-fw"></i>
  <input type="time" class="form-control">
  <input type="text" class="form-control">
  <i class="fa fa-times fa-fw"></i>
</div>
```

The time picker can be initialized with a preset value by giving the `type="time"` input a `value`.

Then, instantiate the time picker field using the `Fliplet.UI.TimePicker` constructor.

```js
var instance = Fliplet.UI.TimePicker('#target');
```

## Constructor

```js
Fliplet.UI.TimePicker(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **required** (`Boolean`) If `true`, users will not be able to clear the field after it's given a value. If `false`, a "X" icon will be visible to help users clear the time field. (**Default**: `false`)

## Properties

The time picker instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the time picker instance.

## Methods

The time picker instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the time field in 24-hour `HH:mm` format, or an empty string if there is no valid time value.

```js
instance.get()
```

### `.set()`

Gives the time picker a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`String`) New time value in 24-hour `HH:mm` format
  - **triggerChange** (`Boolean`) If `false`, the time picker value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the time picker value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the time picker value changes. The function is called with the instance as the `this` context and the new time value as the parameter.

## Helper functions

### `Fliplet.UI.TimePicker.get()`

(Returns `Object`)

Gets the time picker instance from a node or jQuery object.

```js
Fliplet.UI.TimePicker.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Date Picker](fliplet-ui-datepicker.md)
  - [Number Input](fliplet-ui-number.md)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
