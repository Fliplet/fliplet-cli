# App Subscriptions REST APIs

Contains endpoints to read and manage your app's users subscribed via push notifications.

---

## Endpoints

### Get a list of users subscribed to your app for push notifications

#### `GET v1/apps/:id/subscriptions`

Sample cURL request:

```
curl -H "Auth-token: eu--36fda313" "https://api.fliplet.com/v1/apps/123/subscriptions"
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

---