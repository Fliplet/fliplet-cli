# Organizations REST APIs

## Authentication

Please head to the [how to authenticate](#organization-tokens) page of the documentation to read more about how you can authorize your client to make API requests to Fliplet.

---

## Endpoints

### Get the audit logs for an organization

#### `GET or POST v1/organizations/:id/logs`

Optional parameters:

  - `type`: String or Array of strings ([see list of available types](/Organization-audit-log-types.html))
  - `appId`: Number (ID)
  - `fields`: Array of strings
  - `startDate`: ISODATE String
  - `endDate`: ISODATE String
  - `sort`: String (column name: `id`, `createdAt`, `type`; defaults to `createdAt`)
  - `order`: String (ASC or DESC; defaults to DESC)
  - `limit`: Number (defaults to 50, max 500)
  - `offset`: Number
  - `format` (`json` or `csv`; defaults to `json`)

<p class="quote">Note: when using GET requests, arrays can be given as a CSV string (e.g. <code>type=foo,bar</code>)</p>

The following [types](/Organization-audit-log-types.html) are filtered out by default since they are primarily used for analytics: `app.analytics.pageView`, `app.analytics.event`, `app.view`, `app.update`,  `studio.analytics.presence`.

**Response  (Status code: 200 OK):**

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
  ],
  "query": {
    "where": { "type": "app.analytics.pageView" },
    "offset": 0,
    "limit": 50,
    "order": [["createdAt", "DESC"]]
  }
}

```

### Get the aggregated logs for an organization

#### `GET or POST v1/organizations/:id/analytics`

Optional parameters:

  - `startDate`: ISODATE String
  - `endDate`: ISODATE String

**Response  (Status code: 200 OK):**

```json
{
  "appSessions": [{ "day": "2023-05-18", "count": 1 }],
  "studioSessions": [{ "day": "2023-05-18", "count": 0 }],
  "stats": {
    "uniqueAppUsers": { "count": 0, "previousPeriodCount": 0 },
    "totalAppUsers": { "count": 0, "previousPeriodCount": 0 },
    "appSessions": { "count": 0, "previousPeriodCount": 0 },
    "studioSessions": { "count": 0, "previousPeriodCount": 0 },
    "studioUsers": { "count": 0, "previousPeriodCount": 0 },
    "newStudioUsers": { "count": 0, "previousPeriodCount": 0 },
    "appsCreated": { "count": 0, "previousPeriodCount": 0 },
    "appsEdited": { "count": 0, "previousPeriodCount": 0 },
    "appsPublished": { "count": 0, "previousPeriodCount": 0 }
  },
  "apps": [
    {
      "id": 1,
      "name": "Sample App",
      "createdAt": "2022-06-08T05:44:53.968Z",
      "updatedAt": "2022-08-04T11:11:05.469Z",
      "publishedAt": "2022-07-26T11:31:31.984Z",
      "publishedAppleAt": "2022-07-26T11:31:31.984Z",
      "publishedGoogleAt": "2022-07-26T11:31:31.984Z",
      "publishedWebAt": "2022-06-08T05:49:50.076Z",
      "stats": {
        "users": { "count": 0, "previousPeriodCount": 0 },
        "sessions": { "count": 0, "previousPeriodCount": 0 },
        "events": { "count": 0, "previousPeriodCount": 0 },
        "devices": { "count": 0, "previousPeriodCount": 0 },
        "updates": { "count": 0, "previousPeriodCount": 0 },
        "publishes": { "count": 0, "previousPeriodCount": 0 }
      }
    }
  ],
  "users": [
    {
      "id": 1,
      "email": "foo@example.org",
      "lastSeenAt": "2023-06-07T10:02:48.203Z",
      "createdAt": "2022-05-10T07:17:17.944Z",
      "stats": {
        "studioSessions": { "count": 0 },
        "viewerSessions": { "count": 0 },
        "appPublishes": { "count": 0 },
        "appsAvailable": { "count": 4 },
        "appsCreated": { "count": 0 }
      }
    }
  ]
}
```

---

## Organization Tokens

The following REST APIs enable you to handle organization tokens, facilitating authorized access to organization-specific REST APIs.

---

### Create your organization token

#### `POST v1/organizations/:id/tokens`

e.g. `v1/organizations/123/tokens`

Request body:

```json
{
  "name": "My token"
}
```

Sample cURL request:

```
curl -X POST -H "Auth-token: eu--abcdef123456" -H "Content-Type: application/json" -d '{"name": "My token"}' "https://api.fliplet.com/v1/organizations/123/tokens"
```

Response  (Status code: 201 Created):

```json
{
    "token": "eu--abcdef12345678",
    "id": 1,
    "name": "My token"
}
```

---

### Get your organization tokens

#### `GET v1/organizations/:id/tokens`

e.g. `v1/organizations/123/tokens`

Sample cURL request:

```
curl -X GET -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/organizations/123/tokens"
```

Response (Status code: 200 OK):

```json
{
    "organizationTokens": [
        {
            "fullName": "My token",
            "id": 1,
            "firstName": "My token",
            "lastName": null,
            "email": "token@fliplet.com",
            "type": "integrationToken",
            "organizationUser": {
                "createdAt": "2023-08-01T13:07:20.008Z",
                "updatedAt": "2023-08-01T13:07:20.008Z",
                "userId": 1,
                "organizationId": 123,
                "organizationRoleId": 3
            }
        }
    ]
}
```

---

### Delete your organization token

#### `DELETE v1/organizations/:orgId/tokens/:tokenId`

e.g. `v1/organizations/123/tokens/1`

Sample cURL request:

```
curl -X DELETE -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/organizations/123/tokens/1"
```

Response status code: 200 (no body)

---
