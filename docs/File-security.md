---
title: Securing Fliplet files and folders
description: Secure files and folders in your Fliplet apps with access rules and custom JavaScript security rules.
type: how-to
tags: [file, security]
v3_relevant: true
deprecated: false
---

# Securing Fliplet files and folders

How to control read, upload, update, and delete access to media files and folders in Fliplet apps using access rules and custom security rules.

## Contents

- [Security rules](#security-rules)
- [Access rule structure](#access-rule-structure)
  - [Explicit deny with `stop`](#explicit-deny-with-stop)
  - [Data source ownership rules](#data-source-ownership-rules)
- [Private media files and app bundles](#private-media-files-and-app-bundles)
- [Custom security rules](#custom-security-rules)
  - [Granting access](#granting-access)
  - [The `file` object](#the-file-object)
  - [Restrict file types on upload](#restrict-file-types-on-upload)
  - [Reading data from other Data Sources](#reading-data-from-other-data-sources)
- [REST API endpoints](#rest-api-endpoints)

## Security rules

Access to files and folders is secured via the **File Security** section in Fliplet Studio. Rules control who can read, create (upload), update, and delete files — enforced server-side for all app token requests. Rules can be configured through the Studio UI wizard without writing any code.

Key behaviors:

- **Denied by default** — access is denied when no rules exist on a resource or any of its ancestors. Note that apps come with a preset rule granting public read and logged-in upload access, which can be changed in Studio
- **First-match wins** — rules are evaluated top to bottom; the first rule that grants access is used and evaluation stops. If no rules match, access is denied
- **Inheritance chain** — rules are resolved by walking up the resource hierarchy until rules are found:
  1. The file or folder's own rules
  2. Parent folder → grandparent folder → … (up the folder tree)
  3. The app's root media access rules (final fallback)
  4. No rules found anywhere → access denied

  A resource with its own rules **completely replaces** inherited rules (no merging). The system uses only the first set of rules it finds in this chain.
- **Action-based** — rules specify which operations they permit: `read`, `create`, `update`, `delete`

## Access rule structure

File security rules follow the same conventions as [Data Source security rules](/Data-source-security#access-rule-structure), using the same `allow` schema, condition operators, and session handling. Each rule specifies who can access files and what operations they can perform.

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | Array of strings | Yes | Operations this rule applies to: `"read"`, `"create"`, `"update"`, `"delete"`. Note: `"create"` is only valid on folder rules (not file rules) |
| `allow` | String or Object | Yes | Who can access: `"all"`, `"loggedIn"`, `{ "user": {...} }`, `{ "tokens": [...] }`, or `{ "dataSource": {...} }` |
| `enabled` | Boolean | No | Whether the rule is active (defaults to `true`) |
| `appId` | Array of numbers | No | Restrict this rule to specific app IDs (applies to all apps if omitted) |
| `name` | String | No | Descriptive label for identifying the rule in Studio |
| `script` | String | No | Custom JavaScript code for advanced security logic. When present, overrides `allow` and `type` — see [Custom security rules](#custom-security-rules) |
| `stop` | Boolean | No | If `true` and the rule does not match the request, evaluation stops immediately (explicit deny). Defaults to `false`. See [Explicit deny with `stop`](#explicit-deny-with-stop) |

<p class="quote">A maximum of <strong>20 rules</strong> can be configured per file or folder.</p>

### Defining who can access

The `allow` property supports the same modes as Data Source rules. User filters support three operators (`equals`, `notequals`, `contains`) and can reference session data using Handlebars syntax:

{% raw %}
```json
[
  {
    "type": ["read", "create", "update", "delete"],
    "allow": { "user": { "Role": { "equals": "Admin" } } },
    "enabled": true
  },
  {
    "type": ["read"],
    "allow": {
      "user": {
        "Department": { "equals": "Engineering" },
        "Status": { "notequals": "Inactive" }
      }
    },
    "enabled": true
  },
  {
    "type": ["read", "create"],
    "allow": "loggedIn",
    "enabled": true
  }
]
```
{% endraw %}

To grant access to specific API tokens, use the `tokens` mode with an array of Fliplet API token IDs:

```json
{
  "type": ["read"],
  "allow": { "tokens": [42857] },
  "enabled": true
}
```

For the full `allow` reference and Handlebars templating details, see [Data Source security rules](/Data-source-security#defining-who-can-access).

### Explicit deny with `stop`

Normally, when a rule does not match the current request it is skipped and evaluation continues with the next rule. Setting `stop: true` on a rule changes this behavior: if the rule **does not match**, evaluation halts immediately and access is denied.

This lets you create an explicit deny — a rule that says "if you don't pass this check, stop here; don't even look at the remaining rules."

**Example:** only non-suspended logged-in users should be able to read files, even though a broader `loggedIn` rule exists further down:

```json
[
  {
    "type": ["read"],
    "allow": {
      "user": { "Status": { "notequals": "Suspended" } }
    },
    "stop": true,
    "enabled": true
  },
  {
    "type": ["read"],
    "allow": "loggedIn",
    "enabled": true
  }
]
```

A non-suspended user matches the first rule and is granted access. A suspended user **fails** the first rule — because `stop` is `true`, evaluation halts and access is denied before the second `loggedIn` rule is reached.

<p class="quote"><strong>Note:</strong> The <code>stop</code> property is specific to file security rules. It is not available on <a href="/Data-source-security">Data Source security rules</a>.</p>

### Data source ownership rules

File rules support an additional `allow` mode not available on Data Source rules: `{ "dataSource": {...} }`. This grants access when a data source entry references the file and optionally matches user criteria. This mode is only available on **file rules** (not folder rules).

{% raw %}
```json
[
  {
    "type": ["read"],
    "allow": {
      "dataSource": {
        "id": 123,
        "fileColumn": "Attachments",
        "where": {
          "Owner": "{{user.[Email]}}"
        }
      }
    },
    "enabled": true
  }
]
```
{% endraw %}

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | Number | Yes | The data source ID to query |
| `fileColumn` | String | Yes | The column name that contains file references (checked for the file's ID via substring match) |
| `where` | Object | No | Additional filter criteria applied to matching entries. Supports Handlebars templates for session data. If omitted, any entry referencing the file grants access |

### Full example: department document library

This example shows a folder structure where public files are accessible to everyone, department folders are restricted to logged-in users in the matching department, and only admins can upload or delete.

**Folder structure:**

```
/public/
  welcome.pdf
/engineering/
  architecture.pdf
  roadmap.xlsx
/marketing/
  brand-guide.pdf
```

**Rules on the `/public/` folder:**

```json
[
  {
    "type": ["read"],
    "allow": "all",
    "enabled": true
  }
]
```

**Rules on the `/engineering/` folder:**

```json
[
  {
    "type": ["read", "create", "update", "delete"],
    "allow": { "user": { "Role": { "equals": "Admin" } } },
    "enabled": true
  },
  {
    "type": ["read"],
    "allow": {
      "user": {
        "Department": { "equals": "Engineering" }
      }
    },
    "enabled": true
  }
]
```

The second rule uses a **literal value** (`"Engineering"`) for the department check. Unlike Data Source rules which have `require` for query scoping, file security rules can only filter by the user's identity via `allow.user`. Using a Handlebars self-reference like {% raw %}`"equals": "{{user.[Department]}}"`{% endraw %} would compare the user's department against itself — always true, granting access to any logged-in user regardless of department.

**Rules on the `/marketing/` folder** would follow the same pattern with `"Department": { "equals": "Marketing" }`.

**Access outcomes:**

| User | Role | Department | `/public/welcome.pdf` read | `/engineering/roadmap.xlsx` read | `/engineering/` upload |
|---|---|---|---|---|---|
| Anonymous | — | — | Granted | Denied | Denied |
| Bob | User | Engineering | Granted | Granted | Denied |
| Carol | User | Marketing | Granted | Denied | Denied |
| Alice | Admin | Engineering | Granted | Granted | Granted |

Rules are evaluated top to bottom — the admin rule matches first for Alice, the department rule matches for Bob. Carol is denied because her department does not match the literal value "Engineering". Files in `/engineering/` inherit the folder's rules.

#### API calls that succeed

**Bob reading files from `/engineering/`** — Bob is logged in (Role: User, Department: Engineering). The second rule matches because his department equals "Engineering":

```js
// JS API — list files in the engineering folder
Fliplet.Media.Folders.get({ folderId: 2 }).then(function (response) {
  // response.files contains architecture.pdf and roadmap.xlsx
  console.log('Engineering files:', response.files);
});
```

```plaintext
// REST API equivalent
GET /v1/media?folderId=2
Auth-token: <Bob's app token>

// Response (200 OK):
{
  "files": [
    { "id": 10, "name": "architecture.pdf", "contentType": "application/pdf", ... },
    { "id": 11, "name": "roadmap.xlsx", "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ... }
  ],
  "folders": []
}
```

**Alice uploading to `/engineering/`** — Alice is logged in (Role: Admin). The first rule matches because her role equals "Admin", granting `create` access:

```js
// JS API — upload a file to the engineering folder
var formData = new FormData();
formData.append('files[0]', fileInput.files[0]);

Fliplet.Media.Files.upload({
  data: formData,
  folderId: 2 // engineering folder
}).then(function (files) {
  console.log('Uploaded:', files);
});
```

```plaintext
// REST API equivalent
POST /v1/media/files?folderId=2
Auth-token: <Alice's app token>
Content-Type: multipart/form-data

// Response (201 Created):
{
  "files": [{ "id": 12, "name": "new-doc.pdf", ... }]
}
```

**Anonymous reading from `/public/`** — No login required. The rule uses `"allow": "all"`:

```js
// JS API — list files in the public folder
Fliplet.Media.Folders.get({ folderId: 1 }).then(function (response) {
  // response.files contains welcome.pdf
});
```

```plaintext
// REST API — read file contents directly
GET /v1/media/files/9/contents/welcome.pdf
// No auth token needed — the rule grants public read access

// Response: file stream (200 OK)
```

#### API calls that fail

When a request is denied, the API responds with HTTP status **401** and a JSON error body (note: [Data Source denials](/Data-source-security#queries-that-fail) return HTTP 400 instead):

```json
{
  "error": "file.access",
  "message": "You do not have permission to access this file"
}
```

In the JS API, the promise is rejected with this error.

**Carol trying to read `/engineering/` files** — Carol is logged in (Role: User, Department: Marketing). The admin rule does not match (wrong role), and the department rule does not match (Marketing ≠ Engineering):

```js
// JS API — Carol tries to read a file from engineering
Fliplet.Media.Folders.get({ folderId: 2 }).catch(function (error) {
  // error: "You do not have permission to access this file"
});
```

```plaintext
// REST API equivalent
GET /v1/media?folderId=2
Auth-token: <Carol's app token>

// Response (401 Unauthorized):
{ "error": "file.access", "message": "You do not have permission to access this file" }
```

**Bob trying to upload to `/engineering/`** — Bob is logged in (Role: User, Department: Engineering). He can read files, but the only rule granting `create` access requires Role: Admin:

```js
// JS API — Bob tries to upload
Fliplet.Media.Files.upload({
  data: formData,
  folderId: 2
}).catch(function (error) {
  // error: "You do not have permission to create files here"
});
```

```plaintext
// REST API equivalent
POST /v1/media/files?folderId=2
Auth-token: <Bob's app token>
Content-Type: multipart/form-data

// Response (401 Unauthorized):
{ "error": "file.access", "message": "You do not have permission to create files here" }
```

**Anonymous trying to read `/engineering/` files** — No login. Neither rule matches: the admin rule requires a user session, and the department rule requires a logged-in user with a matching department:

```plaintext
// REST API
GET /v1/media/files/10/contents/architecture.pdf
// No auth token

// Response (401 Unauthorized):
{ "error": "file.access", "message": "You do not have permission to access this file" }
```

## Private media files and app bundles

Files that do not have an unconditional public read rule (i.e., `"allow": "all"` for `"read"`) are treated as **private**. This affects how files are included in app bundles:

- **Public files** are included in the app bundle as normal and are available offline
- **Private files** are excluded from the bundle — only metadata (file ID, name, content type) is included
- At runtime, the app must make **authenticated API requests** to access private file contents (e.g., via `Fliplet.Media.Files.get()` or the `/v1/media/files/:id/contents` endpoint)
- Private files are **not available offline** unless your app explicitly fetches and caches them at runtime

This partitioning ensures that secured files are never exposed in the publicly downloadable app bundle.

## Custom security rules

For advanced logic beyond what the standard rule properties support, you can write custom JavaScript security rules. This follows the same model as [custom Data Source security rules](/Data-source-security#custom-security-rules) — the script is evaluated at runtime in a sandboxed environment.

<p class="warning"><strong>Important:</strong> When a rule has a custom script, the script is the <strong>sole determinant</strong> of access. Standard rule fields like <code>allow</code> and <code>type</code> are ignored — the script runs regardless of login status or operation type. Your script must perform its own identity and operation checks (e.g., <code>if (!user) return { granted: false };</code>). If the script does not return a value (e.g., an unhandled operation type falls through without a <code>return</code>), access is <strong>denied by default</strong>.</p>

When writing a custom rule, these variables are available in the script context:

- `type` (String) — the operation being attempted: `read`, `create`, `update`, or `delete`
- `user` (Object) — the authenticated user's session data, or `undefined` if not logged in. For data-source passport sessions (e.g., Email Verification, Fliplet Login), this contains the flat column values from the user's row in the authentication data source (e.g., `user.Email`, `user.Role`). For SAML2 sessions, it contains the assertion attributes.
- `file` (Object) — the resource being accessed. This is the plain Sequelize model of either a file or a folder, depending on the operation. See [The `file` object](#the-file-object) for available properties.
- `DataSources` (Function) — server-side library for reading data from other data sources. See [Reading data from other Data Sources](#reading-data-from-other-data-sources).

<p class="quote">Script execution has a <strong>3-second timeout</strong>. Async operations (like <code>DataSources</code> queries) are supported via <code>await</code>.</p>

Here is an example covering multiple scenarios:

```js
// Check the operation type
if (type === 'read') {
  // Any logged-in user can read
  if (user) {
    return { granted: true };
  }

  return { granted: false, message: 'You must be logged in to access this file' };
}

if (type === 'create') {
  // Only editors can upload
  if (user && user.Role === 'Editor') {
    return { granted: true };
  }

  return { granted: false, message: 'Only editors can upload files' };
}

if (type === 'update' || type === 'delete') {
  // Only the original uploader can modify or delete.
  // file.userId is the Fliplet user ID of who uploaded the file.
  // user.id is the authenticated user's Fliplet user ID (not a data source column).
  if (user && file && file.userId === user.id) {
    return { granted: true };
  }

  return { granted: false, message: 'You can only modify files you uploaded' };
}

// Deny by default if none of the conditions above matched
return { granted: false };
```

### Granting access

Return `{ granted: true }` to allow access, or `{ granted: false }` to deny. You can include a `message` when denying for debugging purposes (e.g., `{ granted: false, message: 'Only managers can access report files' }`).

<p class="warning"><strong>Important:</strong> You must return an object — bare boolean values (e.g., <code>return true</code>) are not supported and will be treated as a denial. Always use <code>return { granted: true }</code> or <code>return { granted: false }</code>.</p>

### The `file` object

The `file` variable in custom scripts contains the plain Sequelize model of the resource being accessed — either a file or a folder. The available properties depend on the resource type.

**For files:**

```js
{
  id: 456,
  name: "team-photo.jpg",
  contentType: "image/jpeg",
  size: [640, 480],           // Image dimensions [width, height] — only populated for images
  mediaFolderId: 12,         // ID of the parent folder
  appId: 789,
  userId: 42,                // ID of the user who uploaded the file
  isEncrypted: false,
  metadata: {},
  accessRules: null,         // This file's own rules (if any)
  createdAt: "2025-06-15T10:30:00Z",
  updatedAt: "2025-06-15T10:30:00Z"
}
```

**For folders** (when the operation targets a folder, e.g., `create` for uploading into a folder):

```js
{
  id: 12,
  name: "2025",
  parentId: 5,               // ID of the parent folder
  appId: 789,
  metadata: {},
  accessRules: null,
  createdAt: "2025-01-10T08:00:00Z",
  updatedAt: "2025-01-10T08:00:00Z"
}
```

<p class="warning"><strong>Important:</strong> The <code>file</code> object does not include related records (folder details, app name, uploader email). To look up related data, use the <code>DataSources</code> library or match on the available IDs (<code>userId</code>, <code>mediaFolderId</code>, <code>appId</code>).</p>

For `create` operations (file upload), `file` contains the metadata available from the upload request (e.g., `name`, `contentType`). Fields like `id` and `createdAt` are not yet available.

### Restrict file types on upload

```js
if (type === 'create') {
  var allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file && allowedTypes.indexOf(file.contentType) === -1) {
    return { granted: false, message: 'Only JPEG, PNG, and PDF files are allowed' };
  }

  return { granted: true };
}

// This rule does not grant access to other operation types
```

### Reading data from other Data Sources

Custom rules can query other data sources using the `DataSources` server-side library. The API is identical to [data source custom rules](/Data-source-security#reading-data-from-other-data-sources) — refer to that page for the full `find` and `findOne` reference, supported query operators, and usage examples.

These reads run at **server level** and bypass all security rules on the target data source. Connect using the data source ID (number) or name (string):

```js
if (type === 'create') {
  if (!user) {
    return { granted: false, message: 'You must be logged in to upload files' };
  }

  var permission = await DataSources('Permissions').findOne({
    where: { Email: user.Email, CanUpload: 'Yes' }
  });

  if (permission) {
    return { granted: true };
  }

  return { granted: false, message: 'You do not have upload permissions' };
}
```

<p class="quote">Use <code>DataSources('Name')</code> (data source name) instead of <code>DataSources(123)</code> (ID) in custom scripts. Data source names are preserved during app clone, so name-based lookups continue to work without manual remapping.</p>

## REST API endpoints

To manage access rules programmatically, see the [Media access rules API](/REST-API/fliplet-media#access-rules) for endpoints to get and set rules on files, folders, and apps.
