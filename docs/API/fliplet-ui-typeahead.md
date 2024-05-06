# `Fliplet.UI.Typeahead()`

(Returns `Object`)

Create a typeahead input field. This provides a simple mechanism to allow the selection of options from a predefined list as users begin typing, enhancing the user experience by offering real-time suggestions that match or closely match the input, ultimately streamlining the selection process.

## Install

Add the `fliplet-ui-typeahead` dependency to your screen or app libraries.

## Usage

To set up a typeahead field, use the following markup.

```html
<div class="form-group fl-typeahead" id="target">
  <select placeholder="Start typing..."></select>
</div>
```

Instantiate the slider range field using the `Fliplet.UI.Typeahead` constructor.

```js
var instance = Fliplet.UI.Typeahead('#target');
```

## Constructor

```js
Fliplet.UI.Typeahead(el, options)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element
  - **params** (`Object`) A map of parameters for the constructor
    - **value** (`Array`) Value to initialize the field with
    - **options** (`Array`) A list of options available
    - **freeInput** (`Boolean`) When set to FALSE, users can only input options in the predefined list (**Default**: `true`)
    - **maxItems** (`Number`) Maximum number of options users can select
    - **placeholder** (`String`) Typeahead placeholder (**Default**: `Start typing...`)

## Properties

The typeahead instance returned by the constructor contains the following property.

  - **$el** (`jQuery`) The jQuery object containing the typeahead instance.

## Methods

The typeahead instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the typeahead field.

```js
instance.get()
```

### `.set()`

Gives the typeahead field a value.

```js
instance.set(value, triggerChange)
```

  - **value** (`Object`) New typeahead value.
  - **triggerChange** (`Boolean`) If `false`, the typeahead value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the typeahead value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the typeahead value changes. The function is called with the instance as the `this` context and the new typeahead value as the parameter.

## Helper functions

### `Fliplet.UI.Typeahead.get()`

(Returns `Object`)

Gets the typeahead instance from a node or jQuery object.

```js
Fliplet.UI.Typeahead.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
