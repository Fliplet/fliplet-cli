---
description: Secure files and folders in your Fliplet apps with access rules and custom JavaScript security rules.
---

# Securing your files and folders

## Contents

- [Security rules](#security-rules)
- [Access rule structure](#access-rule-structure)
- [Custom security rules](#custom-security-rules)

## Security rules

Access to files and folders is secured via the **File Security** section in Fliplet Studio. Rules control who can read, upload, update, and delete files — enforced server-side for all app token requests. Rules can be configured through the Studio UI wizard without writing any code.

Key behaviors:

- **Denied by default** — files and folders without rules (directly or inherited) are inaccessible
- **Folder inheritance** — rules on a folder apply to all files and subfolders beneath it; a file or subfolder can override with its own rules
- **Action-based** — rules specify which operations they permit: `read`, `create`, `update`, `delete`

## Access rule structure

File security rules follow the same conventions as [Data Source security rules](/Data-source-security#access-rule-structure), using the same `allow` schema, condition operators, and session handling. Each rule specifies who can access files and what operations they can perform.

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | Array of strings | Yes | Operations this rule applies to: `"read"`, `"create"`, `"update"`, `"delete"` |
| `allow` | String or Object | Yes | Who can access: `"all"`, `"loggedIn"`, `{ "user": {...} }`, or `{ "tokens": [...] }` |
| `enabled` | Boolean | No | Whether the rule is active (defaults to `true`) |

### Defining who can access

The `allow` property supports the same four modes as Data Source rules. User filters support three operators (`equals`, `notequals`, `contains`) and can reference session data using Handlebars syntax:

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
        "Department": { "contains": "{{user.[Department]}}" },
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

For the full `allow` reference and Handlebars templating details, see [Data Source security rules](/Data-source-security#defining-who-can-access).

## Custom security rules

For advanced logic beyond what the standard rule properties support, you can write custom JavaScript security rules. This follows the same model as [custom Data Source security rules](/Data-source-security#custom-security-rules) — the script is evaluated at runtime in a sandboxed environment.

When writing a custom rule, these variables are available in the script context:

- `type` (String) — the operation the user is attempting: `read`, `create`, `update`, or `delete`
- `user` (Object) — the user's session data, when the user is logged in
- `file` (Object) — the file being accessed (see [The `file` object](#the-file-object))
- `folder` (Object) — the folder being accessed (see [The `folder` object](#the-folder-object))

Here is an example covering multiple scenarios:

```js
switch (type) {
  case 'read':
    // Public files are accessible to everyone
    if (file.fullPath.startsWith('/public/')) {
      return { granted: true };
    }

    // Reports restricted to managers
    if (file.fullPath.startsWith('/reports/')) {
      if (user && user.Role === 'Manager') {
        return { granted: true };
      }

      return { granted: false, message: 'Reports are restricted to managers' };
    }

    // All other files require login
    if (user) {
      return { granted: true };
    }

    return { granted: false, message: 'You must be logged in to access this file' };

  case 'create':
    // Only editors can upload
    if (user && user.Role === 'Editor') {
      return { granted: true };
    }

    return { granted: false, message: 'Only editors can upload files' };

  case 'update':
  case 'delete':
    // Only the original uploader can modify or delete
    if (user && file.user && file.user.email === user.Email) {
      return { granted: true };
    }

    return { granted: false, message: 'You can only modify files you uploaded' };
}
```

### Granting access

Return an object with `granted: true` to grant access. You can also return a custom `message` when denying access — this message is included in the error response sent to the client:

```js
// Grant access
return { granted: true };

// Deny with default error message
return { granted: false };

// Deny with a custom error message
return { granted: false, message: 'Only managers can access report files' };
```

### The `file` object

When the rule is evaluated for a file, the `file` variable contains metadata with enriched related objects:

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

### The `folder` object

When the rule is evaluated for a folder, the `folder` variable contains:

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

### Restrict file types on upload

```js
if (type === 'create') {
  var allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file && allowedTypes.indexOf(file.contentType) === -1) {
    return { granted: false, message: 'Only JPEG, PNG, and PDF files are allowed' };
  }

  return { granted: true };
}

// No further access is granted by this rule to other type of operations
```

### Reading data from other Data Sources

Custom rules can read data from Data Sources using the `DataSources` server-side library, identical to [data source custom rules](/Data-source-security#reading-data-from-other-data-sources).

Connect using the data source ID (number) or name (string):

```js
if (type === 'create') {
  var permission = await DataSources('Permissions').findOne({
    where: { Email: user.Email, CanUpload: 'Yes' }
  });

  if (permission) {
    return { granted: true };
  }

  return { granted: false, message: 'You do not have upload permissions' };
}

if (type === 'read') {
  var entries = await DataSources(123).find({
    where: {
      Department: user.Department,
      AccessLevel: { $gte: 3 }
    }
  });

  if (entries && entries.length) {
    return { granted: true };
  }

  return { granted: false };
}
```

Both `find` and `findOne` accept the following properties:

- `where` (Object) — query filter supporting [standard query operators](API/datasources/query-operators.html) such as `$eq`, `$ne`, `$like`, `$iLike`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`
- `limit` (Number, defaults to `100`)
- `offset` (Number, defaults to `0`)

<p class="warning"><strong>Tip:</strong> Use <code>DataSources('Name')</code> (data source name) instead of <code>DataSources(123)</code> (ID) in custom scripts. Data source names are preserved during app clone, so name-based lookups continue to work without manual remapping.</p>
