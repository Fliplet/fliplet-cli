# Fliplet Data Sources REST APIs

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorise your client to make API requests to Fliplet.

---

## Endpoints

### Get a list of the apps your token has access to

#### `GET v1/apps`

Sample cURL request:

```
curl -X GET -H "Auth-token: eu--36fda313b47a545b88f6f36" "https://api.fliplet.com/v1/apps"
```

Response  (Status code: 200 OK):

```json
{
  "apps": [
    {
      "id": 123,
      "name": "My App",
      "icon": "https://path/to/icon.png",
      "version": null,
      "settings": {},
      "releases": [],
      "dependencies": [],
      "slug": null,
      "createdAt": "2017-11-28T10:25:19.003Z",
      "updatedAt": "2017-11-28T10:25:19.493Z",
      "deletedAt": null,
      "organizationId": 1234,
      "startingPageId": 567,
      "productionAppId": null,
      "appUser": {
        "appRoleId": 1,
        "appId": 123,
        "userId": 456
      }
    }
  ]
}
```


### Get a list of users subscribed to your app for push notifications

#### `GET v1/apps/:id/subscriptions`

Sample cURL request:

```
curl -X GET -H "Auth-token: eu--36fda313b47a545b88f6f36" "https://api.fliplet.com/v1/apps/123/subscriptions"
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