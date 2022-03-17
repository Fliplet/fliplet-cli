# `Fliplet.CSV`

## Install

Add the `fliplet-csv` dependency to your screen or app resources.

## `Fliplet.CSV.encode()`

(Returns `String`)

Encodes JSON data into CSV.

```js
Fliplet.CSV.encode(data, options);
```

  - **data** (Object \| Array) JSON data to be encoded into CSV.
  - **options** (Object) Optional configuration for further CSV encoding. See [Papa Parse documentation](https://www.papaparse.com/docs#json-to-csv) for more. **Note** Fliplet CSV uses `\n` as the newline sequence by default to maximize CSV shareability and support across all platforms. In addition, the following options are also supported:
    - **base64** (Boolean) Set as `true` to encode the CSV data in Base64 encoding. (**Default**: `false`)
    - **dataUrl** (Boolean) Set as `true` to encode the CSV data as `data:` URL. (**Default**: `false`)
    - **columns** (Array) Include only the specified columns, in given order (**Default**: All columns)

The CSV JS API uses [Papa Parse](https://www.papaparse.com/) as the underlying engine. This means it's capable of generating CSV with different data formats. Examples:

```js
// Specifying a collection of entries
Fliplet.CSV.encode([
  { 'Column 1', 'foo', 'Column 2': 'bar' },
  { 'Column 1', 'abc', 'Column 2': 'def' }
]);

// Pick specific columns from a collection of entries
Fliplet.CSV.encode([
  { 'Column 1', 'foo', 'Column 2': 'bar', 'Column 3': 'baz' },
  { 'Column 1', 'abc', 'Column 2': 'def', 'Column 3': 'ghi' }
], {
  columns: ['Column 3', 'Column 1'] // Show only the specified columns, in given order
});

// Specifying fields and data explicitly
Fliplet.CSV.encode({
  fields: ['Column 1', 'Column 2'],
  data: [
    ['foo', 'bar'],
    ['abc', 'def']
  ]
});

// Two-line, comma-delimited, without header row
Fliplet.CSV.encode([
  ['1-1', '1-2', '1-3'],
  ['2-1', '2-2', '2-3']
]);
```

## `Fliplet.CSV.decode()`

(Returns `Array`)

Decodes CSV string into JSON data.

```js
Fliplet.CSV.decode(csv, options);
```

  - **csv** (String) CSV string to be decoded.
  - **options** Optional configuration for further CSV encoding. See [Papa Parse documentation](https://www.papaparse.com/docs#config) for more.

## `Fliplet.CSV.download()`

(Returns `Promise`)

Downloads JSON data as a CSV file.

**Note** Downloading CSV files only works in web apps.

```js
Fliplet.CSV.download(data, options);
```

  - **data** JSON data to be encoded into CSV.
  - **options** (Object) Optional configuration for further CSV encoding. See `Fliplet.CSV.encode()` above for more information. In addition, the following options are also supported:
    - **fileName** (String) Full file name (including file extension) for the downloaded file. (**Default**: `Untitled.csv`)
    - **columns** (Array) Include only the specified columns, in given order (**Default**: All columns)

## `Fliplet.CSV.email()`

Attaches CSV file to an email.

(Returns `Promise`)

Emails JSON data as a CSV attachment.

**Note** Attaching CSV files to emails only works in native apps.

```js
Fliplet.CSV.email(data, options);
```

  - **data** JSON data to be encoded into CSV.
  - **options** (Object) Optional configuration for further CSV encoding. See `Fliplet.CSV.encode()` above for more information. In addition, the following options are also supported:
    - **emailOptions** (String) A mapping object for configuring the email. See [`Fliplet.Communicate.composeEmail()`](https://developers.fliplet.com/API/fliplet-communicate.html#compose-an-email) for more information.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
