# App Analytics REST APIs

The App Analytics REST APIs allows you to read your app's analytics data.

---

## Endpoints

### Get a list of users subscribed to your app for push notifications

#### `GET v1/apps/:id/analytics/sessions`

Sample cURL request:

```
curl -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/apps/123/analytics/sessions"
```

Response  (Status code: 200 OK):

```json
{
  "sessions": [
    {
      "id": 123,
      "identifier": {
        "os": {
          "major": "14",
          "family": "iOS"
        },
        "device": {
          "family": "iPhone"
        },
        "browser": {
          "major": "14",
          "minor": "1",
          "family": "Mobile Safari UI/WKWebView"
        },
        "ipAddress": "0.0.0.0, 1.1.1.11",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
      },
      "lastAccessedAt": "2022-01-24T19:09:01.342Z",
      "user": {
        "email": "user@email.com"
      },
      "appVersion": {
        "isManualCheck": false,
        "lastCheckedAt": "2022-01-24T19:09:01+00:00",
        "latestVersion": 123,
        "nrOfDownloads": 1,
        "currentVersion": 123,
        "lastUpdateType": null,
        "localUpdatedAt": "2022-01-24T18:31:31.230Z",
        "assetsToDownload": 1
      }
    }
  ]
}
```

---
