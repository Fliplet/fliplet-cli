# Page JS APIs

## Scroll the user to an element on the page

### Examples

```js
// Scroll to an element by providing the direct element or jQuery reference
Fliplet.Page.scrollTo($('#target'))
Fliplet.Page.scrollTo(document.getElementById('target'))

// Scroll to an element using a selector string
Fliplet.Page.scrollTo('[data-id="123"]')

// Scroll the element with a specific context
Fliplet.Page.scrollTo('.title', { context: '[data-entry-id="456"]' })
```

### Parameters

| Param  | Type                | Description  |
| ------ | ------------------- | ------------ |
| target  | `String|Node|jQuery` | Target element to scroll the user to |
| options | `Object` (Optional) | A map of options for the function     |
| options.duration | `Number` (Optional) | Duration of scroll in ms (Default: `200`)    |
| options.context | `String|Node|jQuery` (Optional) | If set, the scrolling would be performed on the context element instead of the HTML page    |
| options.offset | `Number` (Optional) | Additional offset to apply to the scrolling    |
| options.step | `Function` (Optional) | A stepping callback function that's triggered on each step of the scrolling animation     |

### Returns

`Promise` Promise is resolved when the scrolling is completed.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
