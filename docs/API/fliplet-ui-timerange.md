---
title: Fliplet.UI.TimeRange()
description: "Render a paired start/end time range input in HH:mm format with required flag, default value, and get/set/change methods via Fliplet.UI.TimeRange."
type: api-reference
tags: [js-api, timerange]
v3_relevant: true
deprecated: false
exclude_from_v3_catalog: true
---
# `Fliplet.UI.TimeRange()`

Render a paired start/end time range input in `HH:mm` format with an optional default `{ start, end }` value and a `required` flag via `Fliplet.UI.TimeRange()`. The constructor returns a controller instance with `get`, `set`, and `change` methods for reading or updating the selected range.

## Install

Add the `fliplet-ui-datetime` dependency to your screen or app libraries.

## Usage

To set up a time range field, use the following markup.

```html
<div class="fl-time-range" id="target">
  <div class="form-group fl-time-picker time-picker-start">
    <i class="fa fa-clock-o fa-fw"></i>
    <input type="time" class="form-control" value>
    <input type="text" class="form-control">
    <i class="fa fa-times fa-fw"></i>
  </div>
  <div class="arrow-right">
    <i class="icon fa fa-long-arrow-right fa-fw"></i>
  </div>
  <div class="form-group fl-time-picker time-picker-end">
    <i class="fa fa-clock-o fa-fw"></i>
    <input type="time" class="form-control" value>
    <input type="text" class="form-control">
    <i class="fa fa-times fa-fw"></i>
  </div>
</div>
```

Instantiate the time range field using the `Fliplet.UI.TimeRange` constructor.

```js
var instance = Fliplet.UI.TimeRange('#target');
```

## Constructor

```js
Fliplet.UI.TimeRange(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **options** (`Object`) A map of options for the constructor
    - **required** (`Boolean`) If `true`, users will not be able to clear the field after it's given a value. If `false`, a "X" icon will be visible to help users clear the time fields. (**Default**: `false`)
    - **value** (`Object`) Default value `{ start, end }` where `start` and `end` are in `HH:mm` format.

## Properties

The time range instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the time range instance.

## Methods

The time range instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the time range field in `{ start, end }` format where `start` and `end` are in `HH:mm` format, or `null` if there is no valid time range.

```js
instance.get()
```

### `.set()`

Gives the time range field a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`Object`) New time range value in `{ start, end }` format where `start` and `end` are in `HH:mm` format.
  - **triggerChange** (`Boolean`) If `false`, the time range value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the time range value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the time range value changes. The function is called with the instance as the `this` context and the new time range value as the parameter.

## Helper functions

### `Fliplet.UI.TimeRange.get()`

(Returns `Object`)

Gets the time range instance from a node or jQuery object.

```js
Fliplet.UI.DatePicker.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Related

  - [Time Range](fliplet-ui-timerange.md)
  - [Date Picker](fliplet-ui-datepicker.md)
  - [Time Picker](fliplet-ui-timepicker.md)

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
