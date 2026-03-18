---
description: Control access to media files and folders with granular, server-enforced access rules supporting inheritance, custom JavaScript, and API token scoping.
---

# Media file access rules

Media file access rules provide server-enforced access control for files and folders in Fliplet apps. Rules determine who can read, create, update, or delete media resources — evaluated per-request on the server, with a folder-to-file inheritance chain.

Access rules for media files follow the same model as [data source security rules](/Data-source-security.html), with adaptations for the media file hierarchy (apps → folders → files).

## Contents

- [How it works](#how-it-works)
- [REST API endpoints](#rest-api-endpoints)
- [Access rule structure](#access-rule-structure)
- [Rule evaluation](#rule-evaluation)
- [Inheritance](#inheritance)
- [Custom rules](#custom-rules)
- [Private files in app bundles](#private-files-in-app-bundles)
- [Client-side SDK](#client-side-sdk)

## How it works

Every request to a media file endpoint (download, upload, update, delete) is evaluated against the resource's access rules:

1. **Studio users** bypass all rules — they always have full access to files in apps they manage.
2. The system loads the resource's own rules. If none exist, it walks up the folder hierarchy until it finds rules.
3. Rules are evaluated **top to bottom**. The first matching rule determines the outcome.
4. If no rule matches at any level, **access is denied**.

<p class="info">Access rules are enforced on all media API endpoints including file downloads, thumbnail generation, signed URL creation, and versioned file access.</p>

## REST API endpoints

### Get access rules

Returns the direct rules on a resource, the effective rules after inheritance resolution, and the inheritance source.

**For files:**

```
GET /v1/media/files/:fileId/accessRules
```

**For folders:**

```
GET /v1/media/folders/:folderId/accessRules
```

**For app root (app-level default rules):**

```
GET /v1/media/apps/:appId/accessRules
```

**Response:**

```json
{
  "accessRules": [
    {
      "allow": "loggedIn",
      "type": ["read"],
      "enabled": true,
      "stop": false
    }
  ],
  "effectiveRules": [
    {
      "allow": "loggedIn",
      "type": ["read"],
      "enabled": true
    }
  ],
  "inheritedFrom": {
    "type": "folder",
    "fromId": 456,
    "distance": 1
  }
}
```

| Field | Type | Description |
|---|---|---|
| `accessRules` | Array | Rules defined directly on this resource. Empty array if no own rules. |
| `effectiveRules` | Array | The resolved rules that apply after walking the inheritance chain. Matches `accessRules` when own rules exist. |
| `inheritedFrom` | Object or null | The source of inherited rules. `null` when the resource has its own rules. |
| `inheritedFrom.type` | String | `"self"`, `"folder"`, or `"app_root"`. |
| `inheritedFrom.fromId` | Number | ID of the folder or app the rules are inherited from. |
| `inheritedFrom.distance` | Number | How many levels up the hierarchy the rules were found. |

### Set access rules

Replaces all rules on a resource. Send the full array — this is not a patch operation.

**For files:**

```
PUT /v1/media/files/:fileId/accessRules
```

**For folders:**

```
PUT /v1/media/folders/:folderId/accessRules
```

**For app root:**

```
PUT /v1/media/apps/:appId/accessRules
```

**Request body:**

```json
{
  "accessRules": [
    {
      "allow": "all",
      "type": ["read"],
      "enabled": true
    },
    {
      "allow": "loggedIn",
      "type": ["read", "create", "update", "delete"],
      "enabled": true
    }
  ]
}
```

**To clear rules and revert to inheritance:**

```json
{
  "accessRules": null
}
```

<p class="warning">Setting <code>accessRules</code> to <code>null</code> removes all direct rules. The resource will inherit rules from its parent folder or app root. Setting it to an empty array <code>[]</code> has the same effect.</p>

**Validation constraints:**

- Maximum **20 rules** per resource.
- `allow` is required on every rule (string or object).
- `type` is required on non-script rules (array of action strings).
- Valid action strings: `"read"`, `"create"`, `"update"`, `"delete"`.

## Access rule structure

Each rule is a JSON object with these properties:

| Property | Type | Required | Description |
|---|---|---|---|
| `allow` | String or Object | Yes | Who the rule applies to. See [Allow conditions](#allow-conditions). |
| `type` | Array of strings | Yes* | Actions granted: `"read"`, `"create"`, `"update"`, `"delete"`. *Not required for script rules. |
| `enabled` | Boolean | No | Whether the rule is active. Defaults to `true`. Disabled rules are skipped during evaluation. |
| `stop` | Boolean | No | When `true` and the rule does not grant access, evaluation stops and access is denied immediately. Defaults to `false` (continue to next rule). |
| `appId` | Array of numbers or null | No | Restrict the rule to specific app IDs. `null` means all apps. |
| `name` | String | No | A descriptive label for the rule (used in the Studio UI). |
| `script` | String | No | Custom JavaScript for advanced rule logic. See [Custom rules](#custom-rules). |

### Allow conditions

The `allow` property determines who the rule applies to:

**All users** (including anonymous):

```json
{ "allow": "all" }
```

**Logged in users** (any authenticated session):

```json
{ "allow": "loggedIn" }
```

**Specific users** (match against user session fields):

{% raw %}
```json
{
  "allow": {
    "user": {
      "Email": { "equals": "{{user.[Email]}}" },
      "Department": { "contains": "Engineering" }
    }
  }
}
```
{% endraw %}

Supported operators: `equals`, `notequals`, `contains`. Values support Handlebars expressions to reference the authenticated user's session data.

**Specific API tokens:**

```json
{
  "allow": {
    "tokens": [75, 88]
  }
}
```

**Data source entry matching:**

```json
{
  "allow": {
    "dataSource": {
      "id": 100,
      "fileColumn": "Avatar",
      "where": {
        "Email": { "equals": "{{user.[Email]}}" }
      }
    }
  }
}
```

This grants access when the file is referenced in the specified data source column for an entry matching the `where` conditions.

## Rule evaluation

Rules are evaluated sequentially for each request. The evaluation flow for a single rule:

1. **Enabled check** — If `enabled` is `false`, skip to the next rule.
2. **App scope check** — If `appId` is set and the requesting app is not in the list, skip to the next rule.
3. **Allow condition** — Evaluate the `allow` condition against the request context:
   - `"all"` — Always matches.
   - `"loggedIn"` — Matches if the user has an active session.
   - `{ "user": {...} }` — Matches if the user's session fields satisfy all conditions.
   - `{ "tokens": [...] }` — Matches if the request uses one of the listed API tokens.
4. **Action check** — Verify the requested action (`read`, `create`, `update`, `delete`) is in the rule's `type` array.
5. **Outcome:**
   - If all checks pass → **access granted**. No further rules are evaluated.
   - If the rule does not match and `stop` is `true` → **access denied**. No further rules are evaluated.
   - If the rule does not match and `stop` is `false` → **continue** to the next rule.

If all rules are exhausted without a match, the system falls through to [inheritance](#inheritance).

### The stop flag

The `stop` property creates gate patterns — rules that must be satisfied before any subsequent rules are considered:

```json
[
  {
    "allow": "loggedIn",
    "type": ["read"],
    "stop": true
  },
  {
    "allow": { "user": { "Role": { "equals": "Manager" } } },
    "type": ["read", "update", "delete"]
  }
]
```

In this example, unauthenticated users are denied immediately at the first rule (`stop: true`). Authenticated users pass the first rule's allow check, get read access, and continue to the second rule for additional permissions.

## Inheritance

Media access rules follow a **most-specific-wins** inheritance model:

```
File rules  →  Parent folder rules  →  ... →  App root rules
(most specific)                              (least specific)
```

- A resource with its own rules uses only those rules. Inherited rules are not evaluated.
- A resource with no rules inherits from its nearest ancestor that has rules defined.
- The app root is the final fallback. If no rules exist at any level, access is denied.

Setting a resource's `accessRules` to `null` removes its direct rules and reverts to inheritance.

<p class="quote">Set rules on a parent folder to apply consistent access control to all files and subfolders within it. Only define file-level rules when a specific file needs different permissions than its parent.</p>

## Custom rules

For advanced access control logic, use JavaScript rules. Custom rules receive context variables and must return a result object.

### Available variables

| Variable | Type | Description |
|---|---|---|
| `type` | String | The action being requested: `"read"`, `"create"`, `"update"`, or `"delete"`. |
| `user` | Object or undefined | The authenticated user's session data. `undefined` if the user is not logged in. Always check before accessing properties. |
| `resourceType` | String | `"file"` or `"folder"`. |
| `resourceId` | Number | The ID of the file or folder being accessed. |

### Return format

Custom rules must return an object with a `granted` boolean:

```js
// Grant access
return { granted: true };

// Deny access
return { granted: false };
```

<p class="warning">Do not return bare booleans (<code>return true</code>). The return value must be an object with a <code>granted</code> property.</p>

### Example: restrict access by user role

```js
// Only users with the "Admin" role can access this resource
// user is undefined when not logged in — always guard against this
if (!user || !user.Role) {
  return { granted: false };
}

return { granted: user.Role === 'Admin' };
```

### Example: deny all access (lock a resource)

```js
// Deny all access regardless of user
return { granted: false };
```

Use this with `stop: true` to create an absolute deny rule that prevents any subsequent rules from granting access.

### Example: time-based access

```js
// Allow read access only during business hours (UTC)
if (type !== 'read') {
  return { granted: false };
}

var hour = new Date().getUTCHours();

return { granted: hour >= 9 && hour < 17 };
```

## Private files in app bundles

Files protected by access rules are automatically separated from public assets in app bundles. When an app is built:

- **Public files** (those with an `allow: "all"` read rule as their first matching rule) are included directly in the app bundle.
- **Private files** are listed as metadata only — no URLs are included in the bundle.

Private files are loaded at runtime when a user authenticates. The client SDK handles this automatically.

## Client-side SDK

### Fliplet.Media.PrivateFiles

The client SDK automatically loads private files when a user logs in. Authorized files receive signed URLs that the app uses to display or download them.

```js
// Private files are loaded automatically on login.
// To manually trigger a refresh (e.g., after rule changes):
Fliplet.Media.PrivateFiles.get().then(function(files) {
  // files is an array of { url, path, hash, updatedAt }
  console.log('Authorized private files:', files.length);
});
```

<p class="info">Signed URLs for private files are temporary and automatically refreshed by the SDK. Do not cache or store them long-term.</p>

### Checking access from JavaScript

To check access rules for a specific file or folder from client-side code:

```js
// Get effective rules for a file
Fliplet.API.request({
  url: 'v1/media/files/' + fileId + '/accessRules'
}).then(function(response) {
  var hasAccess = response.effectiveRules.length > 0;
  var isInherited = response.inheritedFrom !== null;

  console.log('Has access rules:', hasAccess);
  console.log('Inherited:', isInherited);
});
```
