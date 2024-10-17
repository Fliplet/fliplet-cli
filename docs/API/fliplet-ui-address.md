# `Fliplet.UI.AddressField()`

The Address field is a customizable component that integrates with Google Maps to enable address lookup. It allows users to search and select addresses using Google's autocomplete and retrieve location details.

## Install

Add the `fliplet-ui-address` dependency to your screen or app libraries.

## Usage

To set up an Address field, use the following markup.

```html
  <div class="form-group fl-address-field" ref="target">
    <input
      type="text"
      class="form-control focus-outline"
      :placeholder="placeholder"
      :readonly="readonly"
      tabindex="0"
      @keydown="handleKeyDown"
    />
    <ul v-if="suggestionSelected" class="google-autocomplete">
      <li v-for="(option, index) in addressSuggestions" :key="index" @click="selectSuggestion(option)" :class="{ 'active': index === activeSuggestionIndex }">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="17" height="17" viewBox="0 0 256 256" xml:space="preserve">
          <defs></defs>
          <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
            <path d="M 15.514 -0.501 c -6.165 0 -11.18 5.015 -11.18 11.18 c 0 1.715 0.378 3.36 1.13 4.901 c 1.034 2.075 4.06 7.191 7.264 12.608 l 1.56 2.64 c 0.256 0.433 0.722 0.7 1.226 0.7 s 0.97 -0.266 1.226 -0.7 l 1.559 -2.638 c 3.182 -5.379 6.189 -10.463 7.243 -12.565 c 0.01 -0.018 0.02 -0.037 0.028 -0.055 c 0.746 -1.531 1.123 -3.177 1.123 -4.89 C 26.694 4.515 21.678 -0.501 15.514 -0.501 z M 15.514 14.734 c -2.453 0 -4.448 -1.995 -4.448 -4.448 s 1.996 -4.448 4.448 -4.448 s 4.448 1.996 4.448 4.448 S 17.966 14.734 15.514 14.734 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(142,142,142); fill-rule: nonzero; opacity: 1;" transform=" matrix(2.81 0 0 2.81 1.4065934065934016 1.4065934065934016) " stroke-linecap="round"/>
          </g>
        </svg>
        \{{ option.label }}
      </li>
    </ul>
  </div>
```

Initialize field using the Fliplet.UI.AddressField constructor.

```js
var instance = Fliplet.UI.AddressField(target);
```

## Constructor

```js
Fliplet.UI.AddressField(el)
```

- **el** (`String|Node|jQuery`) Selector or node for the target element

## Methods

The Address instance supports the following methods.

### `.get()`

(Returns `String`)

Gets the value of the address field.

```js
instance.get()
```

### `.set()`

Sets the value of the address field.

```js
instance.set(value, triggerChange)
```

  - **value** (`Object`) A string representing the new address value.
  - **triggerChange** (`Boolean`) If `false`, the address value will be set without triggering the change event listeners. (**Default**: `true`)

### `.clear()`

Clears the address value from the input.

```js
instance.clear(triggerChange)
```

  - **triggerChange** (`Boolean`) If `false`, the address value will be set without triggering the change event listeners. (**Default**: `true`)

### `.change()`

Add an event listener to be triggered when the address field value changes.

```js
instance.change(fn)
```

  - **fn** (`Function<String>`) Callback function to be run when the address field value changes. The function is called with the instance as the `this` context and the new address field value as the parameter.

### `.getAutocompleteSuggestions()`

Fetch autocomplete suggestions based on the input and country restrictions.

```js
instance.getAutocompleteSuggestions(input, countryRestrictions)
```

- **input** (`String`): The input string to search for.
- **countryRestrictions** (`Array<String>`): An array of country codes to restrict the search to specific countries.

`Returns:` A Promise that resolves to an array of suggestion objects containing label and id.


### `.getAddressComponents()`

Retrieves address components for a specific place ID.

```js
instance.getAddressComponents(id)
```

- **id** (`String`): A string representing the Google Maps place ID.

`Returns:`  A promise that resolves to an array of address components.


## Helper functions

### `Fliplet.UI.AddressField.get()`

(Returns `Object`)

Gets the Address field instance from a node or jQuery object.

```js
Fliplet.UI.AddressField.get(el)
```

  - **el** (`String|Node|jQuery`) Selector or node for the target element

## Variables you will need to define

- **countryRestrictions**: `Array`
  - **Description**: An array of country restrictions for address suggestions.
  - **Default Value**: `[]`

- **manualInput**: `Boolean`
  - **Description**: Determines if manual input is allowed.
  - **Default Value**: `true`

- **storeInSeparateFields**: `Boolean`
  - **Description**: Indicates whether to store address components in separate fields.
  - **Default Value**: `false`

- **separateFieldsName**: `Array`
  - **Description**: An array of objects defining separate field labels and keys for the address components.
  - **Default Value**:
    ```js
    [
      { label: 'Street number of the address', key: 'streetNumber' },
      { label: 'Street name of the address', key: 'streetName' },
      { label: 'City name', key: 'city' },
      { label: 'State name', key: 'state' },
      { label: 'Postal code', key: 'postalCode' },
      { label: 'Country', key: 'country' }
    ]
    ```

- **fieldOptions**: `Array`
  - **Description**: An array of available field options for the address field to pass its values.
  - **Default Value**: `[]`

- **selectedFieldOptions**: `Object`
  - **Description**: An object holding the currently selected field options for each address component.
  - **Default Value**:
    ```js
    function() {
      return {
        streetNumber: '',
        streetName: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      };
    }
    ```

- **addressSuggestions**: `Array`
  - **Description**: An array of suggestions for the address field.
  - **Default Value**: `[]`

- **addressComponents**: `Array`
  - **Description**: An array of components of the selected address.
  - **Default Value**: `[]`

- **suggestionSelected**: `Boolean`
  - **Description**: Indicates whether a suggestion has been selected from the suggestions list.
  - **Default Value**: `false`

- **activeSuggestionIndex**: `Number`
  - **Description**: The index of the currently active suggestion in the suggestions list.
  - **Default Value**: `-1`

- **lastChosenAutocompleteValue**: `String`
  - **Description**: Stores the label of the last chosen autocomplete suggestion.
  - **Default Value**: `''`


## Functions you will need to define

### `initAutocomplete(input, countryRestrictions)`

Initializes the address field's autocomplete functionality and fetches suggestions based on user input and country restrictions.

```js
initAutocomplete: async function(input, countryRestrictions) {
  // Initialize the address field using Fliplet's UI component
  this.addressField = Fliplet.UI.AddressField(this.$refs.addressField);

  // Fetch autocomplete suggestions for the given input and country restrictions
  const suggestions = await this.addressField.getAutocompleteSuggestions(input, countryRestrictions);

  // Check if the current value is an object (indicating that something has already been selected from the suggestions)
  if (typeof this.value === 'object') {
    // If the value is an object, reset the address suggestions and mark suggestion as selected
    this.addressSuggestions = [];
    this.suggestionSelected = true;
  } else {
    // Otherwise, update the address suggestions with the fetched suggestions
    this.addressSuggestions = suggestions;
  }
}
```

- **`input`** (`String`) – The text input for which autocomplete suggestions are being fetched.
- **`countryRestrictions`** (`Array<String>`) – An array of country codes that restrict the autocomplete suggestions to specific countries.


### `updateFieldOptions()`

Updates the available field options based on the parent fields, filtering out specific field types (e.g., `flButtons` and `flAddress`).

```js
updateFieldOptions: function() {
  var fields = this.$parent.fields; // Access the parent fields

  // Map the fields to create an array of field options
  this.fieldOptions = fields.map(function(field) {
    // Exclude specific field types from the options
    if (field._type !== 'flButtons' && field._type !== 'flAddress') {
      return { label: field.label, disabled: false }; // Create an option object for valid fields
    }
  }).filter(Boolean); // Filter out any undefined values from the array
}
```

### `extractAddressComponents(place)`

Extracts address components from a given place object and returns an object containing structured address data.

```js
extractAddressComponents: function(place) {
  // Initialize an object to hold the extracted address data
  const addressData = {
    streetNumber: '',
    streetName: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  };

  // Iterate through each component in the place array
  for (const component of place) {
    const { types, long_name: longName } = component; // Destructure to get types and long name of the component

    // Iterate through each type of the current component
    for (const type of types) {
      switch (type) {
        case 'street_number':
          addressData.streetNumber = longName;
          break;
        case 'route':
          addressData.streetName = longName;
          break;
        case 'locality':
          addressData.city = longName;
          break;
        case 'postal_town':
          if (!addressData.city) {
            addressData.city = longName;
          }
          break;
        case 'administrative_area_level_1':
          addressData.state = longName;
          break;
        case 'country':
          addressData.country = longName;
          break;
        case 'postal_code':
          addressData.postalCode = longName;
          break;

        default:
          // Ignore other types not explicitly handled
          break;
      }
    }
  }

  // Return the populated addressData object with the extracted address components
  return addressData;
}
```

- **place** (`Array<Object>`) – An array of address components returned from a geocoding service, where each component includes its types and long name.


### `assignValuesToSeparateFields(place, separateFieldsName)`

Assigns extracted address component values to specified separate fields based on the provided field names.

```js
assignValuesToSeparateFields: function(place, separateFieldsName) {
  // Extract address components from the given place object
  const addressData = this.extractAddressComponents(place);

  // Iterate over each field in the separateFieldsName array
  separateFieldsName.forEach(field => {
    // Assign the extracted address component value to the corresponding field
    field.value = addressData[field.key];
  });
}
```

- **`place`** (`Array<Object>`) – An array of address components returned from a geocoding service.
- **`separateFieldsName`** (`Array<Object>`) – An array of objects, each containing a `key` property that corresponds to the keys in the `addressData` object and a `value` property where the extracted values will be assigned.


### `updateSelectedFieldsProperty(attr, value)`

Updates the specified property of selected fields based on the given attribute and value.

```js
updateSelectedFieldsProperty: function(attr, value) {
  // Toggle the value if the attribute is 'readonly'
  if (attr === 'readonly') {
    value = !value;
  }

  // Get the parent fields and selected field options
  const fields = this.$parent.fields;
  const selectedValues = Object.values(this.selectedFieldOptions);

  // Iterate over each field and update the specified property if it matches the selected values
  fields.forEach(field => {
    if (selectedValues.includes(field.name)) {
      field[attr] = value;
    }
  });
}
```

- **`attr`** (`String`) – The attribute/property of the fields to be updated (e.g., `readonly`, `value`).
- **`value`** (`Boolean`) – The new value to assign to the specified attribute of the selected fields.


### `updateSelectedFieldsOptions()`

Updates the selected field options by validating them against the available field options. If any selected option is not valid, it resets that option to an empty string.

```js
updateSelectedFieldsOptions: function() {
  // Iterate over each key in the selectedFieldOptions object
  Object.keys(this.selectedFieldOptions).forEach(key => {
    const selectedFieldLabel = this.selectedFieldOptions[key]; // Get the currently selected field label
    // Check if the selected field label exists in the available field options
    const isValidOption = this.fieldOptions.find(option => option.label === selectedFieldLabel);

    // If the selected option is not valid, reset it to an empty string
    if (!isValidOption) {
      this.selectedFieldOptions[key] = '';
    }
  });
}
```

### `updateDisabledOptions()`

Updates the disabled status of field options based on the currently selected field options and their assigned values.

```js
updateDisabledOptions: function() {
  // Update the field options and the selected fields options
  this.updateFieldOptions();
  this.updateSelectedFieldsOptions();

  // Get an array of assigned values from the selected field options
  const assignedValues = Object.values(this.selectedFieldOptions)
    .filter(value => value && this.fieldOptions.some(option => option.label === value))
    .map(value => value); // Filter and map to only include valid assigned values

  // Disable options that have been assigned
  this.fieldOptions.forEach(option => {
    option.disabled = assignedValues.includes(option.label); // Set disabled status based on assigned values
  });
}
```

### `onChange()`

Sets up an event listener that is triggered when the address field value changes. This function processes the selected address components and updates relevant field values accordingly.

```js
onChange: function() {
  // Add a change event listener to the address field
  this.addressField.change((value) => {
    // Check if there are any address components available
    if (this.addressComponents.length) {
      // Assign extracted address components to separate fields
      this.assignValuesToSeparateFields(this.addressComponents, this.separateFieldsName);

      // Iterate over the selected field options to update the corresponding field values
      for (const key in this.selectedFieldOptions) {
        if (!this.selectedFieldOptions[key]) continue; // Skip empty selections

        const matchedField = this.separateFieldsName.find(field => field.key === key); // Find the matched field by key
        const fieldName = this.selectedFieldOptions[key]; // Get the field name from selected options

        if (!matchedField) continue; // Skip if no matched field found

        const fields = this.$parent.fields; // Access parent fields

        // Update the value of the matched field
        fields.forEach(field => {
          if (field.label === fieldName) {
            field.value = matchedField.value; // Set the field's value
          }
        });
      }
    }

    // Update the property of the selected fields to read-only based on manual input
    this.updateSelectedFieldsProperty('readonly', this.manualInput);

    // Set the current value and update it based on whether manual input is allowed
    if (!this.manualInput && this.addressComponents.length) {
      this.suggestionSelected = true;
      this.value = value;
      this.updateValue();
    } else {
      this.value = value;
      this.updateValue();
    }

    this.suggestionSelected = true; // Ensure the suggestion is marked as selected
  });
}
```

### `handleKeyDown(event)`

Handles keyboard events for navigating and selecting address suggestions in the autocomplete dropdown.

```js
handleKeyDown: function(event) {
  const suggestionsCount = this.addressSuggestions.length; // Get the count of available suggestions

  // If there are no suggestions, exit the function early
  if (!suggestionsCount) {
    return;
  }

  // Handle different key events
  switch (event.key) {
    case 'ArrowDown': // Move down in the suggestions
      event.preventDefault(); // Prevent default behavior (e.g., scrolling)

      // Move to the next suggestion if possible
      if (this.activeSuggestionIndex < suggestionsCount - 1) {
        this.activeSuggestionIndex += 1; // Increment the active suggestion index
      }

      break;

    case 'ArrowUp': // Move up in the suggestions
      event.preventDefault(); // Prevent default behavior

      // Move to the previous suggestion if possible
      if (this.activeSuggestionIndex > 0) {
        this.activeSuggestionIndex -= 1; // Decrement the active suggestion index
      }

      break;

    case 'Enter': // Select the currently active suggestion
      event.preventDefault(); // Prevent default behavior

      // If a suggestion is currently active, select it
      if (this.activeSuggestionIndex >= 0) {
        const selectedSuggestion = this.addressSuggestions[this.activeSuggestionIndex]; // Get the selected suggestion

        this.lastChosenAutocompleteValue = selectedSuggestion.label; // Store the label of the selected suggestion
        this.selectSuggestion(selectedSuggestion); // Call the function to handle the selection
        this.activeSuggestionIndex = -1; // Reset the active suggestion index
      }

      break;

    default:
      break; // Do nothing for other keys
  }
}
```

### `handleClickOutside(event)`

Handles click events outside the suggestions list to clear suggestions if necessary.

```js
handleClickOutside: function(event) {
  const suggestionsList = this.$el.querySelector('.google-autocomplete'); // Get the suggestions list element

  // Check if the suggestions list exists and if the click was outside of it while manual input is enabled
  if (suggestionsList && !suggestionsList.contains(event.target) && this.manualInput) {
    this.addressSuggestions = []; // Clear the address suggestions
    this.suggestionSelected = false; // Mark that no suggestion has been selected
  }
}
```

---

[Back to Fliplet.UI](./fliplet-ui.md)
{: .buttons}
