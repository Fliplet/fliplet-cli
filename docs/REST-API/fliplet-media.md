# Media REST APIs

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorise your client to make API requests to Fliplet.

---

## Entities

Before heading deep into describing the API endpoints, let's describe what a **Media Folder** and **Media File** are.

### Media Folder

A representation of a folder which can contain subfolders and files.
Media folders can belong to an organisation, an app or a media folder (which acts as the parent folder).

### Media File

Represents a file uploaded via the APIs. It can be contained within a folder, or as a root file for an app or organisation.

---

## Endpoints

### Get the folders and files belonging to an app or organisation or media folder

#### `GET v1/media`

This endpoint requires a context, which can be an app or an organisation or a mediaFolder. The context needs to be sent as a GET parameter in the request, like ​`appId=1​` or ​`organizationId=2` or `folderId=123`

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

### Uploads one or more files

#### `POST v1/media/files`

- Requires context (`folderId` or `appId` or `organizationId`)

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
- `xlarge` image is resized so that the smallest dimension is equal to `1980` px
- `320>?` image width will be resized to `320` while height will be automatic keeping the same scale ratio
- `320>240` image will be resized (keeping the scale ratio) to ensure the smallest dimension is equal to the given size on each axis
- `320!320` image dimensions will both be resized to be equal to the target size. This resize may result in a **stretched image if the source image is not a square**.

Note that this endpoint is meant to be called directly from the client since the file is streamed back to the requester.

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