---
title: Data Source file attachments
description: "Attach files to Data Source entries with insert or update, handle upload constraints and distinguish file uploads from dataset imports."
type: api-reference
tags: [js-api, datasources, files]
v3_relevant: true
deprecated: false
---
# Data Source file attachments

Single-record `insert` and `update` accept file attachments alongside column values. Uploaded fields become stored file URLs with associated media IDs; dataset import is a separate capability.

## Before you start

Load the [Data Sources library](../fliplet-datasources.md), configure app-user [write permissions](../../Data-source-security.md) and use a source with an attachment column. The examples use **Equipment requests** with `Item` and `Receipt` columns. The caller also needs the appropriate app/media context and available storage.

The example requires a selected browser `File` from an `<input type="file">`. Upload only after the user chooses the intended file. Use an online connection and `{ offline: false }` for `insert` when the flow must receive a server record; multipart input cannot be queued after a failed send.

## Attachment inputs

| Input | Example | Behavior |
|---|---|---|
| `FormData` | `form.append('Receipt', file, file.name)` | Sent as multipart. Include ordinary fields in the same form. |
| Plain insert object containing `File` or `Blob` | `{ Item: 'Headset', Receipt: file }` | For `insert`, the SDK converts detected files to multipart. For `update`, pass a single File/Blob using explicit FormData: a nonarray object field is JSON-serialized rather than preserved. A File supplies its filename; a Blob needs a usable MIME type or filename. |
| Plain object containing a base64 data URL | `{ Receipt: 'data:image/png;base64,...' }` | Detected as file input and converted to multipart. Use a complete data URL, not an arbitrary base64 string. |
| Array of file inputs | `{ Receipt: [fileA, fileB] }` | File array fields are sent using the `Receipt[]` name and return URL/ID arrays. |

In FormData, ordinary scalar values are strings. Serialize nested nonfile values intentionally rather than relying on browser object coercion. The upload response and read-back are the authoritative stored shapes.

## Insert an entry with a file

This function receives a browser File. It checks that the write returned a server entry, then reads that ID to verify the stored attachment field. The read-back requires read permission.

```js
async function saveReceipt(file) {
  if (!(file instanceof File)) {
    throw new Error('Choose a receipt file first.');
  }

  const connection = await Fliplet.DataSources.connectByName('Equipment requests', {
    offline: false
  });
  const form = new FormData();
  form.append('Item', 'Headset');
  form.append('Receipt', file, file.name);

  const created = await connection.insert(form, { offline: false });
  if (!created || !created.id || !created.data) {
    throw new Error('The upload did not return a saved record.');
  }

  const saved = await connection.findById(created.id);
  console.log('Stored receipt URL:', saved.data.Receipt);
  return saved;
}
```

Call it from your existing file-input handler with `event.target.files[0]`, checking that a file exists. Catch errors in that handler and display the returned message; do not immediately repeat the upload because a failed response can follow a saved entry or file.

## Update an existing attachment

`connection.update(id, formData, options?)` uploads files onto an existing row. Obtain `id` from a current query/read; use a File selected by the user. This example uses the same source and field as the insertion example:

```js
async function replaceReceipt(entryId, file) {
  if (!entryId || !(file instanceof File)) {
    throw new Error('Choose an existing request and a receipt file.');
  }
  const connection = await Fliplet.DataSources.connectByName('Equipment requests', {
    offline: false
  });
  const form = new FormData();
  form.append('Receipt', file, file.name);
  await connection.update(entryId, form); // allowOffline remains false
  const saved = await connection.findById(entryId);
  console.log('Stored receipt:', saved.data.Receipt);
  return saved;
}
```

Existing array-valued attachment fields can have new file URLs appended rather than replacing the array. Do not assume uploading a replacement deletes earlier media files. Media lifecycle and file access are covered by the [Media API](../fliplet-media.md).

## Options and returned fields

The [individual-write reference](writing-data.md#individual-writes) owns all insert/update options. `folderId` selects a media folder for attachments; it does not grant access to that folder. `ack` concerns local reconciliation, not upload authorization. `public` requests shared-content behavior for the entry and is not a file-access permission switch.

The returned record uses a `{ id, data, ... }` envelope. For a file field named `Receipt`, stored `data.Receipt` contains its URL, or an array of URLs for a multi-file field. `data.ReceiptMediaFileId` contains the associated media ID or ID array. Excluded fields might be absent, and protected hashes are redacted.

An entry response does not mean every server hook, malware scan or downstream action completed. Check file access using the intended app identity; visibility in Studio is not sufficient.

### Per-field file schema

The optional `_flSchema` input is an object keyed by attachment field name. In FormData it is supplied as a JSON string. It configures file handling rather than enforcing a Data Source column type.

| `_flSchema.Receipt` property | Type | Behavior |
|---|---|---|
| `append` | Boolean | `false` discards existing attachment arrays in favor of the requested files/values. Omitted values allow retaining existing arrays for array uploads. This does not delete the earlier media objects. |
| `name` | String | Overrides the stored uploaded filename. |
| `mediaFolderId` | Number | Overrides the request's `folderId` for this attachment field. |
| `encryptionKey` | String | Supplies a private file-encryption key to the configured media upload path. Use only as part of an established encrypted-media integration; supplying a key is not an access-rule grant. |

For an intentionally replaced multi-file field, include the schema and file array in the same request:

```js
function receiptForm(files) {
  if (!Array.isArray(files) || !files.length || !files.every(file => file instanceof File)) {
    throw new Error('Choose at least one receipt file.');
  }
  const form = new FormData();
  form.append('_flSchema', JSON.stringify({ Receipt: { append: false } }));
  files.forEach(file => form.append('Receipt[]', file, file.name));
  return form; // pass to connection.update(existingEntryId, form)
}
```

## Upload constraints and failures

The current server accepts a maximum of **500 MiB per attached file** (524,288,000 bytes). A multipart request envelope above **510 MiB** can be rejected before individual file processing. Plan lower app limits when several files share a request; hosting limits and available organization storage can further restrict uploads.

Files need a recognizable filename extension or a supported MIME type from which an extension can be determined. Unrecognized formats and over-limit files reject with HTTP 422. Executable, script, binary and archive extensions rejected by the current validator are:

```text
exe msi dll bat cmd sh bash jar bin sys
js rb py php ts pl cgi
so drv vxd
zip tar 7z rar gz iso
```

Use normal lowercase filename extensions and a MIME type matching the file. Do not treat an extension list or client-side validation as an upload security guarantee. Server storage, access and scanning controls still apply.

`insert` can expose permanent HTTP 401/422 failures as `{ code: 2, message }`. A multipart send failure can reject `{ code: 1, message }`; the message can contain a nested error object. Update normally rejects the request error. Enabling `allowOffline` for update can instead resolve an offline-shaped value after failure, so leave it disabled when confirming an upload. See [write outcomes and recovery](writing-data.md#failures-and-recovery).

## Dataset imports

`connection.import(data)` exists as a transport wrapper: it applies the client `insert` hook and posts its input without automatic processing or a content-type declaration. That signature does **not** establish CSV-file parsing support. The inspected destination consumes an `entries` batch, and a FormData file alone does not establish that an import occurred. No CSV `FormData` example is recommended here.

For data you have already parsed and validated into flat column objects, use [append](writing-data.md#appending-and-replacing-a-batch) to add rows or `replaceWith` for an intentional complete replacement. This does not provide a CSV parser. Follow the supported Studio import workflow for file-based dataset import, or supply your own verified parser before calling a batch method.

`append`, `replaceWith` and `commit` are not single-record file upload methods. Do not pass File/Blob values to their JSON batch payloads and assume they will upload attachments.

[Back to Data Sources](../fliplet-datasources.md)
