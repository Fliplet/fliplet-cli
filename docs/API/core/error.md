# Error

### Parse error responses and objects

Use the `Fliplet.parseError()` method to process error responses or objects into readable messages.

```js
Fliplet.parseError({
  error: {
    code: 429,
    message: 'Try later'
  }
}); // "Try later"
```

The function looks for common properties in error responses to automatically find the readable message, such as:

- `responseJSON`
- `message`
- `error_message`
- `description`
- `responseText`
- `error`

Any unknown objects are then turned into JSON strings.
