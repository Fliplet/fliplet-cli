# App Subscriptions REST APIs

The App Subscriptions REST APIs allows you to read and manage your app's users subscribed via push notifications.

<p class="warning"><strong>Note:</strong> This RESTful API is intended to be used by 3rd party software such as external integrations. <strong>If you're using this in a Fliplet App, please use the <a href="/API/fliplet-notifications.html">Notifications JS APIs</a> instead.</strong></p>

---

## Endpoints

### Get a list of users subscribed to your app for push notifications

#### `GET v1/apps/:id/subscriptions`

Sample cURL request:

```
curl -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/apps/123/subscriptions"
```

Response  (Status code: 200 OK):

```json
{
  "subscriptions": [
    {
      "appId": 123,
      "createdAt": "2018-11-26T14:06:03.637Z",
      "device": "Apple iPhone7,2",
      "id": 5,
      "ipAddress": "123.456.789.123",
      "platform": "native",
      "token": "51c1d1db7988be0cb819dcc50747c930c566e25899619b0fd38d5b5bbb394355",
      "updatedAt": "2018-11-26T14:06:03.637Z",
      "userId": 456,
      "uuid": "07F06C8F-1485-4BF3-BAA8-CEE2D1B8EEB7"
    }
  ]
}
```

<p class="warning"><strong>Note:</strong> all "DateTime" values such as the ones contained in the <code>createdAt</code> and <code>updatedAt</code> fields use the <strong>ISO 8601 (UTC timezone)</strong> format.</p>

---