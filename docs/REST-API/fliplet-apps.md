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
  ]
}
```

---