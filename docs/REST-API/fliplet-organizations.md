# Organizations REST APIs

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorise your client to make API requests to Fliplet.

---

## Endpoints

### Get the audit logs for an organization

#### `GET or POST v1/organizations/:id/logs`

Optional parameters:

- `type`: String or Array
- `appId`: Number (ID)
- `fields`: Array of strings
- `startDate`: ISODATE String
- `endDate`: ISODATE String
- `sort`: String (column name: `id`, `createdAt`, `type`; defaults to `createdAt`)
- `order`: String (ASC or DESC; defaults to DESC)
- `limit`: Number (defaults to 50, max 500)
- `offset`: Number
- `format` (`json` or `csv`; defaults to `json`)

<p class="quote">Note: when using GET requests, arrays can be given as a CSV string (e.g. `foo,bar`)</p>

Response  (Status code: 200 OK):

```json
{
  "logs": [
    {
      "id": 1,
      "type": "app.analytics.pageView",
      "data": {
        "_os": "Win32",
        "_pageId": 123456,
        "_platform": "web",
        "_pageTitle": "Welcome",
        "_userEmail": "test@test.com",
        "_deviceTrackingId": "8017a7e5-5d3d-4a85-ac80-d70da58b45d7",
        "_analyticsSessionId": "6fe0cad0-069c-6b65-83dc-21360d15dcc7"
      },
      "requestId": "20680bf2-5dc6-49b1-bb3e-602ec22b0a8c",
      "createdAt": "2020-12-18T14:27:59.723Z",
      "updatedAt": "2020-12-18T14:27:57.584Z",
      "sessionId": 123,
      "userId": 456,
      "appId": 789,
      "dataSourceEntryId": null,
      "dataSourceId": null,
      "organizationId": 1234,
      "appNotificationId": null
    }
  ]
}

```

---