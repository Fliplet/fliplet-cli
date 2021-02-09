# Apps REST APIs

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorize your client to make API requests to Fliplet.

---

## Endpoints

### Get a list of the apps your token has access to

#### `GET v1/apps`

Sample cURL request:

```
curl -X GET -H "Auth-token: eu--abcdef123456" "https://api.fliplet.com/v1/apps"
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

---

### Update your live app

#### `POST v1/apps/:id/publish`

Use the publish API endpoint to send an in-app update to your live app.

An update is required to have the `release` attribute with the following properties:

- `type`: `silent`, `visible` or `forced`
- `changelog`: release notes for the update

Sample cURL request:

```
curl 'https://api.fliplet.com/v1/apps/123/publish' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -H "Auth-token: eu--abcdef123456" \
  --data-binary '{"release":{"type":"visible","changelog":"Description of the update"}}' \
  --compressed
```

**Sample response** (Status code *200*):

```json
{
  "app": {
    "version": 2,
    "id": 123,
    "updatedAt": "2020-12-15T14:54:29.866Z"
  }
}

```


---
