# Notifications REST APIs

The Notifications REST APIs allows you to interact and make any sort of change to your app's notifications.

<p class="warning"><strong>Note:</strong> This RESTful API is intended to be used by 3rd party software such as external integrations. <strong>If you're using this in a Fliplet App, please use the <a href="/API/fliplet-notifications.html">Notifications JS APIs</a> instead.</strong></p>

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorize your client to make API requests to Fliplet.

---

## App Notifications

When dealing with app notifications, there's a few things you should keep in mind:

1. Notifications belong to an `app`. You can't have a notification span across multiple apps.
2. Notifications have a default "draft" `status`, meaning they are only visible to Fliplet Studio and Fliplet Viewer users. To make them live to all users, they must be published by updating their status to "published". You can also avoid this step by simply creating your notification as published in first place.
3. Notifications can have a `scope` which limits their visibility. If you don't create a scope, they are treated as broadcasted messages hence available to all users of your app. On the other hand, defining a scope (or a list) will make them private and available to only specific users (e.g. individual users or groups)
4. Notifications have read receipts. Fliplet apps automatically take care of identifying your users so no extra work is required from your end when marking notifications as read.

### Push notifications

App notifications can optionally send a notification. When doing so, you should provide the `payload` and optionally a list of subscriptions IDs to target and a delay for the notification. The following sample can be used as described in the endpoints for creating or updating an app notification:

```json
{
  "pushNotification": {
    "payload": {
      "title": "New article",
      "body": "John has posted a new article on the news page. Go check it out!"
    },
    "subscriptions": [123],
    "delayUntilTimestamp": 1577836800
  }
}
```

---

## Endpoints

### Get the notifications

#### `GET/POST v1/apps/:id/notifications`

Optional query parameters:

- **limit** (number, defaults to `100`)
- **order** (string, defaults to "orderAt")
- **direction** (string, defaults to "DESC")
- **count** (boolean, defaults to `false`. When `true`, only the total count of matched notifications is returned)
- **includeDeleted** (boolean, whether deleted notifications should be returned)
- **where** (object, sequelize "where" query condition)
- **scope** (array, list of scopes to fetch from)

Please note that when making the request as `GET`, supplying the `where` and `scope` parameters is not supported. Therefore, in most occasions you'll need to make a POST request so that you can filter notifications by query and/or a list of scopes.

Request body:
```json
{
  "limit": 50,
  "scope": [{ "topic": "company-updates" }]
}
```

Response:

```json
{
  "notifications": [
    {
      "id": 123,
      "data": { "foo": "bar", "message": "Hi John and company fans!" },
      "scope": [
        { "topic": "company-updates" },
        { "dataSourceId": 123, "email": "john@example.org" }
      ],
      "status": "draft",
      "createdAt": "2018-12-27T18:26:38.260Z",
      "updatedAt": "2018-12-27T18:26:38.260Z",
      "deletedAt": null,
      "orderAt": "2018-12-27T18:26:38.000Z"
    },
    {
      "id": 456,
      "data": { "message": "Hi everyone!" },
      "status": "draft",
      "createdAt": "2018-12-27T18:26:38.260Z",
      "updatedAt": "2018-12-27T18:26:38.260Z",
      "deletedAt": null,
      "orderAt": "2018-12-27T18:26:38.000Z"
    }
  ]
}
```

---

### Create a notification

#### `PUT v1/apps/:id/notifications`

Required parameters:
- **data** (json object)

Optional parameters:
- **scope** (array of json objects)
- **status** (string, defaults to `draft`. Use `published` to make the notification visible to live apps)
- **orderAt** (number, defaults to the current time)
- **pushNotification** (json object containing payload, subscriptions, delayUntilTimestamp)

Sample request body:

```json
{
  "data": { "message": "John posted an article." },
  "scope": [
    { "topic": "company-updates" }
  ],
  "pushNotification": {
    "payload": {
      "title": "New article",
      "body": "John has posted a new article on the news page. Go check it out!"
    },
    "subscriptions": [123]
  }
}
```

---

### Update a notification

#### `PUT v1/apps/:id/notifications/:id`

Optional parameters:
- **data** (json object)
- **extendData** (boolean, defaults to `false` (replace). When `true`, the input data will be merged with the existing notification data instead of replacing it)
- **scope** (array of json objects)
- **status** (string, defaults to `draft`. Use `published` to make the notification visible to live apps)
- **orderAt** (datetime, defaults to the current time)
- **pushNotification** (json object containing payload, subscriptions, delayUntilTimestamp)

---

### Delete a notification

#### `DELETE v1/apps/:id/notifications/:id`

---

### Mark one or more notifications as read

#### `POST v1/apps/:id/notifications/mark-as-read`

Required parameters:
- **recipientId** ([GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) string to identify your user)
- **entries** (array of notification IDs)

---

### Get a list of users subscribed to your app for push notifications

#### `GET v1/apps/:id/subscriptions`

Sample cURL request:

```
curl -X GET -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/apps/123/subscriptions"
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
