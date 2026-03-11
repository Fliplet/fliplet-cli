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
| `appId` | Array of numbers | No | Restrict this rule to specific app IDs (applies to all apps if omitted) |
| `name` | String | No | Descriptive label for identifying the rule in Studio |
| `script` | String | No | Custom JavaScript code for advanced security logic. When present, overrides `allow` and `type` — see [Custom security rules](#custom-security-rules) |

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
        "Department": { "equals": "{{user.[Department]}}" }
      }
    },
    "enabled": true
  }
]
```
{% endraw %}

**Access outcomes:**

| User | Role | Department | `/public/welcome.pdf` read | `/engineering/roadmap.xlsx` read | `/engineering/` upload |
|---|---|---|---|---|---|
| Anonymous | — | — | Granted | Denied | Denied |
| Bob | User | Engineering | Granted | Granted | Denied |
| Carol | User | Marketing | Granted | Denied | Denied |
| Alice | Admin | Engineering | Granted | Granted | Granted |

Key behaviors to note:
- `/public/` uses `"allow": "all"` — no login required for reads
- `/engineering/` has two rules evaluated top to bottom: the admin rule matches first for Alice, the department rule matches for Bob
- Carol is denied because her department does not match, and no other rule grants access
- Files in `/engineering/` inherit the folder's rules — no per-file configuration needed

## Custom security rules

For advanced logic beyond what the standard rule properties support, you can write custom JavaScript security rules. This follows the same model as [custom Data Source security rules](/Data-source-security#custom-security-rules) — the script is evaluated at runtime in a sandboxed environment.

<p class="warning"><strong>Important:</strong> When a rule has a custom script, the script is the <strong>sole determinant</strong> of access. Standard rule fields like <code>allow</code> and <code>type</code> are ignored — the script runs regardless of login status or operation type. Your script must perform its own identity and operation checks (e.g., <code>if (!user) return { granted: false };</code>).</p>

When writing a custom rule, these variables are available in the script context:

- `type` (String) — the operation the user is attempting: `read`, `create`, `update`, or `delete`
- `user` (Object) — the authenticated user's session data, or `undefined` if not logged in. For data-source passport sessions (e.g., Email Verification, Fliplet Login), this contains the flat column values from the user's row in the authentication data source (e.g., `user.Email`, `user.Role`). For SAML2 sessions, it contains the assertion attributes.
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

// If none of the cases above returned, access is denied by default
```

### Granting access

Return an object with `granted: true` to grant access, or `granted: false` to deny. You can include a `message` property when denying access for debugging purposes:

```js
// Grant access
return { granted: true };

// Deny access
return { granted: false };

// Deny with a descriptive message
return { granted: false, message: 'Only managers can access report files' };
```

<p class="warning"><strong>Important:</strong> You must return an object — bare boolean values (e.g., <code>return true</code>) are not supported and will be treated as a denial. Always use <code>return { granted: true }</code> or <code>return { granted: false }</code>.</p>

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

Custom rules can read data from Data Sources using the `DataSources` server-side library, identical to [data source custom rules](/Data-source-security#reading-data-from-other-data-sources). These reads run at **server level** and bypass all security rules on the target data source.

<p class="quote">Cross-data-source lookups add a database round-trip per request and are not cached. Keep queries efficient and use <code>findOne</code> when you only need a single record. Synchronous script execution has a <strong>3-second timeout</strong>, but async operations (like <code>DataSources</code> queries) are not bounded by this limit.</p>

Connect using the data source ID (number) or name (string):

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

if (type === 'read') {
  if (!user) {
    return { granted: false };
  }

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

<p class="quote">Use <code>DataSources('Name')</code> (data source name) instead of <code>DataSources(123)</code> (ID) in custom scripts. Data source names are preserved during app clone, so name-based lookups continue to work without manual remapping.</p>
