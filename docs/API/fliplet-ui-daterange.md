# `Fliplet.UI.DateRange()`

(Returns `Object`)

Create a date range input field. This provides a simple mechanism to allow the selection of a date range.

## Install

Add the `fliplet-ui-datetime` dependency to your screen or app libraries.

## Usage

To set up a date range field, use the following markup.

```html
<div class="fl-date-range" id="target">
  <div class="form-group fl-date-picker date-picker-start">
    <i class="fa fa-calendar fa-fw"></i>
    <input type="date" class="form-control" value>
    <input type="text" class="form-control">
    <i class="fa fa-times fa-fw"></i>
  </div>
  <div class="arrow-right">
    <i class="icon fa fa-long-arrow-right fa-fw"></i>
  </div>
  <div class="form-group fl-date-picker date-picker-end">
    <i class="fa fa-calendar fa-fw"></i>
    <input type="date" class="form-control" value>
    <input type="text" class="form-control">
    <i class="fa fa-times fa-fw"></i>
  </div>
</div>
```

Instantiate the date range field using the `Fliplet.UI.DateRange` constructor.

```js
var instance = Fliplet.UI.DateRange('#target');
```

## Constructor

```js
Fliplet.UI.DateRange(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **required** (`Boolean`) If `true`, users will not be able to clear the field after it's given a value. If `false`, a "X" icon will be visible to help users clear the date fields. (**Default**: `false`)
    - **value** (`Object`) Default value `{ start, end }` where `start` and `end` are in `YYYY-MM-DD` format.

## Properties

The date range instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the date range instance.

## Methods

The date range instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the date range field in `{ start, end }` format where `start` and `end` are in `YYYY-MM-DD` format, or `null` if there is no valid date range.

```js
instance.get()
```

### `.set()`

Gives the date range field a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`Object`) New date range value in `{ start, end }` format where `start` and `end` are in `YYYY-MM-DD` format.
  - **triggerChange** (`Boolean`) If `false`, the date range value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the date range value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the date range value changes. The function is called with the instance as the `this` context and the new date range value as the parameter.

## Helper functions

### `Fliplet.UI.DateRange.get()`

(Returns `Object`)

Gets the date range instance from a node or jQuery object.

```js
Fliplet.UI.DateRange.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Time Range](fliplet-ui-timerange.md)
  - [Date Picker](fliplet-ui-datepicker.md)
  - [Time Picker](fliplet-ui-timepicker.md)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
