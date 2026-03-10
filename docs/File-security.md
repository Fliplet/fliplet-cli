---
description: Learn how to secure files and folders in your Fliplet apps with access rules.
---

# Securing your files and folders

## Security rules

Access to files and folders can be secured via the **File Security** section in Fliplet Studio. Rules control who can read, upload, update, and delete files — enforced server-side for all app token requests.

File security rules follow the same conventions as [Data Source security rules](/Data-source-security), using the same `allow` schema, condition types, and session handling. Rules can be configured through the Studio UI wizard without writing any code.

Key behaviours:

- **Denied by default** — files and folders without rules (directly or inherited) are inaccessible
- **Folder inheritance** — rules on a folder apply to all files and subfolders beneath it; a file or subfolder can override with its own rules
- **Action-based** — rules specify which operations they permit: `read`, `create`, `update`, `delete`

---

## Custom security rules

If you need more control on your file security rules, you can write custom conditions using JavaScript. This follows the same model as [custom data source security rules](/Data-source-security#custom-security-rules) — a script is evaluated at runtime in a sandboxed environment.

When writing a custom rule, **these variables are available to the context of the script**:

- `type` (String) the type of operation: `read`, `create`, `update`, `delete`
- `user` (Object) the user's session with its data, when the user is logged in
- `file` (Object) the file being accessed, when the rule is evaluated for a file action (see below)
- `folder` (Object) the folder being accessed, when the rule is evaluated for a folder action (see below)

Here's a full example of a custom rule handling multiple scenarios:

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

### Granting access with a custom security rule

A rule must return an object with `granted: true` when access is granted. You can also return a custom `message` when denying access — this message is included in the 401 error response sent to the client:

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

When connecting to a Data Source, you can use the ID by passing a number or the name by passing a string. For example, `DataSources('Permissions')` connects by name.

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

Both `find` and `findOne` support the following properties:

- `where` (Object) query to run (supports `$like`, `$iLike`, `$lt`, `$gt`, `$lte`, `$gte`, `$eq`, `$in`)
- `limit` (Number, defaults to `100`)
- `offset` (Number, defaults to `0`)

<p class="warning"><strong>Tip:</strong> Use <code>DataSources('Name')</code> (data source name) instead of <code>DataSources(123)</code> (ID) in custom scripts. Data source names are preserved during app clone, so name-based lookups continue to work without manual remapping.</p>

---
