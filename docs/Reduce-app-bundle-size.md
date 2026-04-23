# Reduce your app bundle size

Blacklist assets from your Fliplet app bundle to shrink it for App Store and Google Play submission.

Navigate to the **App settings** >> **Launch assets** section in Fliplet Studio and you'll find a section for **blacklisting assets**.

Rules are defined as a JSON array of objects like `[ { rule1 }, { rule2 }, { rule3 } ]`. Each rule requires a `type` as described below in the examples.

Example 1: skip any PDF file from being bundled and also the media file with ID 123

```json
[
  { "type": "contentType", "value": "application/pdf" },
  { "type": "mediaFile", "value": 123 }
]
```

## Rules

### Blacklisting by file content type

```json
{ "type": "contentType", "value": "application/pdf" }
```

### Blacklisting by file extension

```json
{ "type": "extension", "value": "pdf" }
```

### Blacklisting by media file ID

```json
{ "type": "mediaFile", "value": 123 }
```

---

## Advanced usage

### Blacklist an array of values

The `value` field can also accept an array of values to be matched by "OR":

```json
[
  { "type": "mediaFile", "value": [123, 456, 789] },
  { "type": "extension", "value": ["doc", "docx"] },
  { "type": "contentType", "value": ["application/pdf"] }
]
```
