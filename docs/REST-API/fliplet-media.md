---
title: Media REST API
description: "The Media REST API lets external integrations upload, list, and manage media files and folders scoped to a Fliplet app or organization."
type: api-reference
tags: [rest-api, media]
v3_relevant: true
deprecated: false
---
# Media REST API

The Media REST API lets external integrations upload, list, and manage media files and folders scoped to a Fliplet app or organization.

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorize your client to make API requests to Fliplet.

---

## Resources

Before heading deep into describing the API endpoints, let's describe what a **Media Folder** and **Media File** are.

### Media Folder

A representation of a folder which can contain subfolders and files.
Media folders can belong to an organization, an app or a media folder (which acts as the parent folder).

### Media File

Represents a file uploaded via the APIs. It can be contained within a folder, or as a root file for an app or organization.

---

## Endpoints

### Get the folders and files belonging to an app or organization or media folder

#### `GET v1/media`

This endpoint requires a context, which can be an app or an organization or a mediaFolder. The context needs to be sent as a GET parameter in the request, like ​`appId=1​` or ​`organizationId=2` or `folderId=123`

Response  (Status code: 200 OK):

```json
{
  "folders": [
    {
      "id": 2,
      "name": "Sample folder",
      "createdAt": "2017-12-14T10:49:55.489Z",
      "updatedAt": "2017-12-14T10:49:55.489Z",
      "appId": null,
      "parentId": null,
      "organizationId": 456
    }
  ],
  "files": [
    {
      "id": 5,
      "name": "foo.jpg",
      "contentType": "image/jpeg",
      "path": "apps/2/foo.jpg",
      "url": "https://cdn.fliplet.com/apps/2/foo.jpg",
      "thumbnail": "https://cdn.fliplet.com/apps/2/foo-t.jpg",
      "size": [
        500,
        375
      ],
      "isEncrypted": null,
      "versions": {},
      "isOrganizationMedia": true,
      "createdAt": "2017-12-11T17:58:13.245Z",
      "updatedAt": "2017-12-11T17:58:13.245Z",
      "appId": 789,
      "dataSourceEntryId": null,
      "dataTrackingId": null,
      "mediaFolderId": null,
      "userId": 123,
      "organizationId": 456
    }
  ]
}
```

To get list of files and folders within a folder, provide the `folderId` as well as `organizationId` when querying the endpoint.

---

### Create a folder

### `POST v1/media/folders`

- Requires context given in the requesy body (`organizationId`, `parentId` or `appId`)

Request body:

```json
{
  "name": "Folder name",
  "parentId": 123,
  "organizationId": 456
}
```

Sample response:

```json
{
  "id": 789,
  "name": "Folder name",
  "parentId": 123,
  "organizationId": 456,
  "updatedAt": "2018-05-02T13:26:53.013Z",
  "createdAt": "2018-05-02T13:26:53.013Z",
  "appId": null,
  "deletedAt": null
}
```

---

### Upload one or more files

#### `POST v1/media/files`

- Requires context (`folderId` or `appId` or `organizationId`)

<p class="quote"><strong>Note:</strong> Fliplet scans all uploaded files for viruses. If a file is found to be infected the system will automatically quarantine it and not allow apps to download it. Quarantined files can be seen in the trash folder of the File Manager in Fliplet Studio.</p>

Request body (**multipart request**):

```
------WebKitFormBoundarynULsOMhLnEjL9Ao8
Content-Disposition: form-data; name="name[0]"

test.jpg
------WebKitFormBoundarynULsOMhLnEjL9Ao8
Content-Disposition: form-data; name="files[0]"; filename="test.jpg"
Content-Type: image/jpeg


------WebKitFormBoundarynULsOMhLnEjL9Ao8--
```

Sample response:

```json
{
  "files": [
    {
      "id": 5,
      "name": "foo.jpg",
      "contentType": "image/jpeg",
      "path": "apps/2/foo.jpg",
      "url": "https://cdn.fliplet.com/apps/2/foo.jpg",
      "thumbnail": "https://cdn.fliplet.com/apps/2/foo-t.jpg",
      "size": [
        500,
        375
      ],
      "isEncrypted": null,
      "versions": {},
      "isOrganizationMedia": true,
      "createdAt": "2017-12-11T17:58:13.245Z",
      "updatedAt": "2017-12-11T17:58:13.245Z",
      "appId": 789,
      "dataSourceEntryId": null,
      "dataTrackingId": null,
      "mediaFolderId": null,
      "userId": 123,
      "organizationId": 456
    }
  ]
}
```

Please note that the following image content types are automatically resized to have both dimensions no larger than `3840px`; when a resizing occurs, the scale of the image will be kept intact:

- `image/apng`: Animated Portable Network Graphics (APNG)
- `image/avif`: AV1 Image File Format (AVIF)
- `image/jpeg`: Joint Photographic Expert Group image (JPEG / JPG)
- `image/png`: Portable Network Graphics (PNG)
- `image/svg+xml`: Scalable Vector Graphics (SVG)
- `image/webp`: Web Picture format (WEBP)

---

## Stream the contents of a file

### `GET v1/media/files/<id>/contents`

Streams the contents of an encrypted media file to the requester. This endpoint is often used by Fliplet apps when displaying images, e.g.:

```
v1/media/files/123/contents/foo.jpg?auth_token=eu--123456&size=large
```

This endpoint accepts a `size` query parameter (which defaults to `large` when images are downloaded by Fliplet apps) to downsample or resize images, like `size=medium` or `size=640^480` or `size=640>?`. See examples below:

- `small` image is resized so that the smallest dimension is equal to `640` px
- `medium` image is resized so that the smallest dimension is equal to `960` px
- `large` image is resized so that the smallest dimension is equal to `1366` px
- `xlarge` image is resized so that the smallest dimension is equal to `1980` px (**default size applied when not specified**)
- `xxlarge` image is resized so that the smallest dimension is equal to `2560` px
- `xxxlarge` image is resized so that the smallest dimension is equal to `3840` px
- `320>?` image width will be resized to `320` while height will be automatic keeping the same scale ratio
- `320>240` image will be resized (keeping the scale ratio) to ensure the smallest dimension is equal to the given size on each axis
- `320!320` image dimensions will both be resized to be equal to the target size. This resize may result in a **stretched image if the source image is not a square**.

#### Convert image format and quality

In addition to (or instead of) `size`, the endpoint accepts a `format` query parameter to convert the image on the fly, and an optional `quality` parameter to control encoder quality.

| Parameter | Allowed values | Notes |
|---|---|---|
| `format` | `jpg`, `webp` | Output format. When omitted, the original encoding is preserved (PNG stays PNG, WebP stays WebP, others fall back to JPEG when resizing). |
| `quality` | `1`–`100` | Encoder quality. Defaults to `88` for `jpg` and `80` for `webp`. Only meaningful when `format` is set. |

Examples:

```
v1/media/files/123/contents?format=webp&quality=75
v1/media/files/123/contents?size=large&format=jpg
v1/media/files/123/contents?size=medium&format=webp
```

The endpoint returns `400 Bad Request` in any of these cases:

- `format` is set to a value other than `jpg` or `webp`
- `quality` is provided without `format`
- `quality` is not an integer between `1` and `100`

Transformed variants are cached on S3 under a key that combines `size`, `format`, and `quality`, so different combinations of these parameters generate independent derivatives and do not overwrite each other. Requests that pass `size` only continue to hit any pre-existing legacy cache entries.

Note that this endpoint is meant to be called directly from the client since the file is streamed back to the requester.

---

## View a PDF file in the browser (without download)

### `GET v1/media/files/<id>/pdf`

Opens a PDF file in a built-in [pdf.js](https://mozilla.github.io/pdf.js/) viewer. This viewer does **not** include a download button, making it useful when you want users to view PDFs without being able to download them.

**Example URL:**

```text
https://api.fliplet.com/v1/media/files/123/pdf
```

**Usage in your app:**

```js
// Get the PDF viewer URL for a file
var pdfViewerUrl = Fliplet.Env.get('apiUrl') + 'v1/media/files/' + fileId + '/pdf';

// Open in the in-app browser
Fliplet.Navigate.url(pdfViewerUrl);
```

<p class="quote"><strong>Important notes:</strong></p>

  - This endpoint only works **online** — the PDF is streamed from the server and cannot be used offline
  - The viewer does not include download functionality, preventing users from saving the file
  - If the file is not a PDF, the endpoint will redirect to the standard `/contents` endpoint instead
  - Authentication is handled automatically — the auth token is appended for mobile devices

**Controlling download behavior:**

If you need some PDFs to be downloadable and others not:

  - Use this `/pdf` endpoint for PDFs that should **not** be downloadable
  - Use the standard `/contents` endpoint or the direct CDN URL for PDFs that **can** be downloaded

---

## Download contents of a folder or a list of files as a ZIP package

### `GET v1/media/zip?folderId=33&files=1359,5336`

Requires a list of files IDs as a GET query parameter like `files=1,2,3` or list of folders IDs as `folders=1,2,3` plus optionally the parent folder id as `folderId=456`.

This endpoint is meant to be called directly from the client since the zip file is streamed back to the requester.

---

## Delete a folder

#### `DELETE v1/media/folders/<id>`

e.g. `v1/media/folders/123`

Deletes a media folder given its ID.

---

## Delete a file

#### `DELETE v1/media/files/<id>`

e.g. `v1/media/files/123`

Deletes a media file given its ID.

---

## Access rules

These endpoints manage [file security access rules](/File-security) on files, folders, and app root media. All endpoints require a **Studio token** for authentication.

For the rule format, evaluation logic, and examples, see [Securing your files and folders](/File-security).

<p class="quote">A maximum of <strong>20 rules</strong> can be configured per resource.</p>

---

### Get file access rules

#### `GET v1/media/files/<id>/accessRules`

Returns the access rules for a file, including any inherited rules.

Response (Status code: 200 OK):

```json
{
  "accessRules": null,
  "effectiveRules": [
    {
      "type": ["read"],
      "allow": "all",
      "enabled": true
    }
  ],
  "inheritedFrom": {
    "type": "folder",
    "folderId": 123,
    "folderName": "Public Documents"
  }
}
```

| Property | Description |
|---|---|
| `accessRules` | The file's own rules, or `null` if it inherits from a parent |
| `effectiveRules` | The rules that actually apply to this file (own or inherited) |
| `inheritedFrom` | Where the effective rules come from: `null` (own rules), `{ "type": "folder", "folderId", "folderName" }`, or `{ "type": "app", "appId" }` |

---

### Set file access rules

#### `PUT v1/media/files/<id>/accessRules`

Sets or clears the access rules for a file.

Request body:

```json
{
  "accessRules": [
    {
      "type": ["read"],
      "allow": "loggedIn",
      "enabled": true
    }
  ]
}
```

To clear a file's own rules and revert to inheriting from its parent folder:

```json
{
  "accessRules": null
}
```

---

### Get folder access rules

#### `GET v1/media/folders/<id>/accessRules`

Returns the access rules for a folder, including any inherited rules. The response shape is the same as the [file access rules endpoint](#get-file-access-rules).

---

### Set folder access rules

#### `PUT v1/media/folders/<id>/accessRules`

Sets or clears the access rules for a folder. The request body format is the same as the [file access rules endpoint](#set-file-access-rules).

---

### Get app root media access rules

#### `GET v1/media/apps/<id>/accessRules`

Returns the app-level root media access rules. These serve as the final fallback in the [inheritance chain](/File-security#security-rules) when no file or folder rules are found.

Response (Status code: 200 OK):

```json
{
  "accessRules": [
    {
      "type": ["read"],
      "allow": "all",
      "enabled": true
    },
    {
      "type": ["create"],
      "allow": "loggedIn",
      "enabled": true
    }
  ]
}
```

---

### Set app root media access rules

#### `PUT v1/media/apps/<id>/accessRules`

Sets or clears the app-level root media access rules.

Request body:

```json
{
  "accessRules": [
    {
      "type": ["read"],
      "allow": "all",
      "enabled": true
    }
  ]
}
```

To clear app-level rules:

```json
{
  "accessRules": null
}
```

---
