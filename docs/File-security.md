---
description: Learn how to secure files and folders in your Fliplet apps with access rules.
---

# Securing your files and folders

## Overview

File security rules control who can access, upload, update and delete files and folders in your Fliplet apps. Rules are enforced **server-side** for all app token requests — Studio tokens with app editing access bypass file security rules entirely.

The rule system follows the same conventions as [Data Source security rules](/Data-source-security), with the same `allow` schema, condition evaluation, and session handling.

### Key concepts

- **Denied by default** — if a file or folder has no access rules (directly or inherited), access is denied
- **Folder inheritance** — rules set on a folder apply to all files and subfolders beneath it
- **Most specific wins** — a file's own rules override its folder's rules; a subfolder's rules override its parent's
- **Action-based** — rules specify which operations they permit: `read`, `create`, `update`, `delete`

---

## How rules are resolved

When a request is made for a file or folder:

1. If the **file** has rules assigned directly → use them
2. Otherwise, walk up the **folder hierarchy** (child → parent → grandparent → root) → use the first set of rules found
3. If **no rules found** anywhere in the chain → **deny** the action

```
/app-root/                             → [public read, logged-in create]
  logo.png                             → (inherits: public read)
  /dashboard/                          → [logged-in read]
    report.js                          → (inherits: logged-in read)
    company-logo.png                   → [public read]  ← file override
    /reports/                          → [manager full access]
      quarterly-report.pdf             → (inherits: manager full access)
```

Setting rules on the **root folder** secures everything beneath it in one action. A subfolder or file can override inherited rules for its own scope without affecting siblings.

---

## Declarative access rules

Each access rule has four dimensions: **who** can perform **what actions**, from **which apps**, and whether the rule is **enabled**.

### Rule structure

```json
{
  "allow": "all",
  "type": ["read"],
  "appId": null,
  "enabled": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `allow` | String or Object | **Who** the rule grants access to (see conditions below) |
| `type` | Array of strings | **What** actions are permitted: `"read"`, `"create"`, `"update"`, `"delete"` |
| `appId` | Array or null | **Which apps** the rule applies to. `null` or omitted = all apps. `[123]` = only app 123. |
| `enabled` | Boolean | Optional, defaults to `true`. Set `false` to deactivate without deleting. |

### Action types

#### File actions

| Value | Description |
|-------|-------------|
| `"read"` | Download, view, get thumbnail, or get signed URL |
| `"update"` | Rename or modify file metadata |
| `"delete"` | Soft delete the file |

#### Folder actions

| Value | Description |
|-------|-------------|
| `"create"` | Upload files into or create subfolders within the folder |
| `"read"` | Browse and list folder contents |
| `"update"` | Rename the folder |
| `"delete"` | Soft delete the folder |

<p class="warning"><strong>Note:</strong> Permanent deletion, restoring file versions, and updating security rules are <strong>always denied</strong> for app tokens — these are Studio-only operations.</p>

---

### Who: the `allow` condition

#### `allow: "all"` — Public access

No authentication required.

```json
{ "allow": "all", "type": ["read"] }
```

#### `allow: "loggedIn"` — Authenticated users

Any user with a valid session, regardless of login method (data source login, SAML, SSO, etc.).

```json
{ "allow": "loggedIn", "type": ["read", "create"] }
```

#### `allow: { tokens: [...] }` — Specific app tokens

Restricted to specific app token IDs.

```json
{ "allow": { "tokens": [12345, 67890] }, "type": ["read"] }
```

#### `allow: { user: { ... } }` — User property matching

Access granted when the user's session properties match conditions. Uses the same operators as data source rules: `equals` (case-insensitive), `notequals`, `contains`.

```json
{
  "allow": {
    "user": {
      "Role": { "equals": "Manager" }
    }
  },
  "type": ["read", "update", "delete"]
}
```

Template variables (e.g., `{% raw %}{{user.[Email]}}{% endraw %}`) are resolved against the logged-in user's session data.

#### `allow: { dataSource: { ... } }` — Data source entry matching

Grants access based on whether the user matches a condition on a data source entry that references the file. Only applies to **files** — folder-level data source matching is not supported.

```json
{
  "allow": {
    "dataSource": {
      "id": 456,
      "fileColumn": "Receipt",
      "where": {
        "Email": { "equals": "{% raw %}{{user.[Email]}}{% endraw %}" }
      }
    }
  },
  "type": ["read"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | The data source ID to query |
| `fileColumn` | String | Column that references the file (locates the entry that "owns" this file) |
| `where` | Object | Condition evaluated against each matching entry. Supports Handlebars session variables. |

**How it works:**

1. Query data source `id` for entries whose `fileColumn` references the current file
2. Evaluate `where` condition against each matching entry
3. Grant access if at least one entry passes

**Example use cases:** Users can only access files they uploaded (expense receipts), files linked to their own records (patient files), or files associated with their team.

---

## Custom security rules

For cases where declarative rules are insufficient, you can write your own file and folder security rules using JavaScript. This follows the same model as [custom data source security rules](/Data-source-security#custom-security-rules) — a JavaScript script is evaluated at runtime in a sandboxed environment.

Custom rules coexist with declarative rules in the same `accessRules` array. A custom rule is identified by the presence of a `script` field instead of the `allow` field.

### Custom rule structure

```json
{
  "name": "Only managers can access reports",
  "script": "...",
  "enabled": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Human-readable label for the rule |
| `script` | String | JavaScript code evaluated at runtime |
| `enabled` | Boolean | Optional, defaults to `true` |

Custom rules do **not** use the `allow`, `type`, or `appId` fields — the script handles all condition logic.

### Runtime variables

The following variables are available in the script's execution context:

#### `type` — The action being performed

| Value | Context |
|-------|---------|
| `"read"` | File download/view, folder listing |
| `"create"` | File upload or subfolder creation |
| `"update"` | File or folder rename/modification |
| `"delete"` | File or folder soft deletion |

#### `user` — The current user's session data

The logged-in user's passport data. `null` if the user is not authenticated.

```js
// Example user object
{
  Email: "jane@example.com",
  "First name": "Jane",
  "Last name": "Smith",
  Role: "Manager",
  Office: "London"
}
```

#### `file` — The file being accessed (file context only)

Available when the rule is evaluated for a file. Contains file metadata with enriched related objects so you don't need additional queries:

```js
{
  id: 456,
  name: "quarterly-report.pdf",
  contentType: "application/pdf",
  size: [1048576],
  mediaFolderId: 12,
  appId: 789,
  userId: 42,
  isEncrypted: false,
  metadata: {},
  createdAt: "2025-06-15T10:30:00Z",
  updatedAt: "2025-06-15T10:30:00Z",
  fullPath: "/reports/2025/quarterly-report.pdf",

  // Enriched related objects
  folder: { id: 12, name: "2025" },
  app: { id: 789, name: "Finance App" },
  user: { id: 42, email: "john@example.com", firstName: "John", lastName: "Doe" }
}
```

For `create` operations (file upload), `file` contains the metadata available from the upload request (e.g., `name`, `contentType`, `size`). Fields like `id` and `createdAt` are not yet available.

#### `folder` — The folder being accessed (folder context only)

Available when the rule is evaluated for a folder:

```js
{
  id: 12,
  name: "2025",
  parentId: 5,
  appId: 789,
  metadata: {},
  createdAt: "2025-01-10T08:00:00Z",
  updatedAt: "2025-01-10T08:00:00Z",
  fullPath: "/reports/2025",

  // Enriched related objects
  parent: { id: 5, name: "reports" },
  app: { id: 789, name: "Finance App" }
}
```

For `create` operations (subfolder creation), `folder` contains the metadata from the request (e.g., `name`, `parentId`).

#### `DataSources(idOrName)` — Cross-data-source lookup

Query data source entries from within the script. Accepts a data source **ID** (number) or **name** (string):

```js
// By ID
var entry = await DataSources(123).findOne({
  where: { Email: user.Email }
});

// By name — recommended for portability across app clones
var entries = await DataSources('Permissions').find({
  where: { Office: user.Office }
});
```

Both `find` and `findOne` support:

- `where` (Object) — query filter (supports `$like`, `$iLike`, `$eq`, `$in`, `$lt`, `$gt`, `$lte`, `$gte`)
- `limit` (Number, defaults to `100`, max `100`)
- `offset` (Number, defaults to `0`)

### Return value

The script must return an object with a `granted` boolean:

```js
// Grant access
return { granted: true };

// Deny with default message
return { granted: false };

// Deny with a custom error message
return { granted: false, message: "Only managers can access report files" };
```

| Field | Type | Description |
|-------|------|-------------|
| `granted` | Boolean | **Required.** `true` to allow, `false` to deny. |
| `message` | String | Optional. Custom message returned in the 401 response when denied. |

When a custom `message` is provided, the error response includes it:

```json
{
  "error": "file.access",
  "message": "Only managers can access report files"
}
```

### Execution environment

Custom scripts run in a sandboxed VM with the following constraints:

| Constraint | Value |
|------------|-------|
| Timeout | 3000ms |
| `eval()` | Disabled |
| WebAssembly | Disabled |
| Console | Disabled in production |

If the script throws an error or times out, the rule is treated as non-matching (access denied).

### Examples

#### Restrict by file path and user role

```js
if (type === 'read' && file.fullPath.startsWith('/reports/')) {
  if (user && user.Role === 'Manager') {
    return { granted: true };
  }

  return { granted: false, message: 'Reports are restricted to managers' };
}

// Allow public read for everything else
if (type === 'read') {
  return { granted: true };
}

return { granted: false };
```

#### Allow uploads based on a permissions data source

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

return { granted: false };
```

#### Only allow users to access their own uploaded files

```js
if (type === 'read') {
  // Public files are accessible to everyone
  if (file.fullPath.startsWith('/public/')) {
    return { granted: true };
  }

  // Other files: only the uploader can access them
  if (user && file.user && file.user.email === user.Email) {
    return { granted: true };
  }

  return { granted: false, message: 'You can only access files you uploaded' };
}

return { granted: false };
```

#### Restrict file types on upload

```js
if (type === 'create') {
  var allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file && allowedTypes.indexOf(file.contentType) === -1) {
    return { granted: false, message: 'Only JPEG, PNG, and PDF files are allowed' };
  }

  return { granted: true };
}

return { granted: false };
```

<p class="warning"><strong>Tip:</strong> Use <code>DataSources('Name')</code> (data source name) instead of <code>DataSources(123)</code> (ID) in custom scripts. Data source names are preserved during app clone, so name-based lookups continue to work without manual remapping.</p>

---

## Managing access rules via the API

Access rules are managed through dedicated endpoints. Only **Studio tokens** with app editing access can read or modify access rules.

### Get access rules for a file

#### `GET v1/media/files/<fileId>/accessRules`

Returns the file's direct rules, effective rules (after inheritance), and where they were inherited from.

Response when the file has its own rules:

```json
{
  "accessRules": [
    { "allow": "loggedIn", "type": ["read"], "enabled": true }
  ],
  "effectiveRules": [
    { "allow": "loggedIn", "type": ["read"], "enabled": true }
  ],
  "inheritedFrom": null
}
```

Response when the file inherits from a parent folder:

```json
{
  "accessRules": [],
  "effectiveRules": [
    { "allow": "all", "type": ["read"], "enabled": true },
    { "allow": "loggedIn", "type": ["create"], "enabled": true }
  ],
  "inheritedFrom": { "folderId": 123, "folderName": "app-root" }
}
```

---

### Get access rules for a folder

#### `GET v1/media/folders/<folderId>/accessRules`

Same response shape as files. For the root folder, use the root folder ID.

---

### Set access rules on a file

#### `PUT v1/media/files/<fileId>/accessRules`

Request body:

```json
{
  "accessRules": [
    { "allow": "loggedIn", "type": ["read"] },
    { "allow": { "user": { "Role": { "equals": "Manager" } } }, "type": ["read", "update", "delete"] }
  ]
}
```

To include a custom rule alongside declarative rules:

```json
{
  "accessRules": [
    { "allow": "all", "type": ["read"] },
    {
      "name": "Upload restriction",
      "script": "if (type === 'create') { return { granted: user && user.Role === 'Editor' }; } return { granted: false };",
      "enabled": true
    }
  ]
}
```

Response: returns the updated state including resolved effective rules (same shape as GET).

Setting `accessRules` to `[]` removes all direct rules — the file will inherit from its parent folder.

---

### Set access rules on a folder

#### `PUT v1/media/folders/<folderId>/accessRules`

Same request and response shape as files.

---

### Include access rules in existing endpoints

For Studio tokens, existing media endpoints accept an optional query parameter to include effective rules:

```
GET v1/media/files/<fileId>?includeAccessRules=true
GET v1/media/folders/<folderId>?includeAccessRules=true
GET v1/media?includeAccessRules=true
```

When `includeAccessRules=true`, responses include `accessRules`, `effectiveRules`, and `inheritedFrom` fields. This parameter is **ignored for app tokens**.

---

## Existing endpoint behaviour changes

All media endpoints enforce access rules for app tokens. Rules are evaluated as middleware before route handlers execute.

| Endpoint | Action checked | Behaviour |
|----------|---------------|-----------|
| `GET v1/media` | `read` on folder | Inaccessible items omitted from response |
| `GET v1/media/files/:id` | `read` on file | 401 if denied |
| `GET v1/media/files/:id/contents` | `read` on file | 401 if denied |
| `GET v1/media/files/:id/thumb` | `read` on file | 401 if denied |
| `GET v1/media/files/:id/sign` | `read` on file | 401 if denied |
| `GET v1/media/files/:id/pdf` | `read` on file | 401 if denied |
| `GET v1/media/zip` | `read` on each file | Inaccessible files omitted |
| `GET v1/media/search` | `read` | Inaccessible results omitted |
| `POST v1/media/files` | `create` on target folder | 401 if denied |
| `POST v1/media/folders` | `create` on parent folder | 401 if denied |
| `PUT v1/media/files/:id` | `update` on file | 401 if denied |
| `PUT v1/media/folders/:id` | `update` on folder | 401 if denied |
| `DELETE v1/media/files/:id` | `delete` on file | 401 if denied |
| `DELETE v1/media/folders/:id` | `delete` on folder | 401 if denied |

When access is denied, the API returns:

```json
{
  "error": "file.access",
  "message": "You do not have permission to access this file"
}
```

For custom rules that return a `message`, that message is used instead of the default.

---

## Migration for existing apps

Existing apps will be migrated with a **public read and create rule on the root folder**, ensuring backward compatibility:

```json
[
  { "allow": "all", "type": ["read"] },
  { "allow": "loggedIn", "type": ["create"] }
]
```

This is a one-time migration. New apps can be configured with restrictive rules from the start.

---
