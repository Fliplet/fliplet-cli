---
description: Secure your Data Sources with access rules, data requirements, and custom JavaScript security rules.
---

# Securing your Data Sources

## Contents

- [Security rules](#security-rules)
- [Access rule structure](#access-rule-structure)
- [Data requirements and query validation](#data-requirements-and-query-validation)
- [Custom security rules](#custom-security-rules)

## Security rules

Access to Data Sources is secured via the **Access Rules** tab of the **App Data** section in Fliplet Studio. Each rule controls who can access the data source, what operations they can perform, and what conditions must be met.

Rules are evaluated from top to bottom, and the first matching rule is applied. If no rules match, access is denied by default.

## Access rule structure

Each access rule is a JSON object with the following properties:

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | Array of strings | Yes | Operations this rule applies to: `"select"`, `"insert"`, `"update"`, `"delete"` |
| `allow` | String or Object | Yes | Who can access: `"all"`, `"loggedIn"`, `{ "user": {...} }`, or `{ "tokens": [...] }` |
| `enabled` | Boolean | No | Whether the rule is active (defaults to `true`) |
| `include` | Array of strings | No | Whitelist of accessible columns (mutually exclusive with `exclude`) |
| `exclude` | Array of strings | No | Blacklist of hidden columns (mutually exclusive with `include`) |
| `require` | Array | No | Data requirements that must be met (see [Data requirements](#data-requirements-and-query-validation)) |
| `appId` | Array of numbers | No | Restrict this rule to specific app IDs (applies to all apps if omitted) |
| `name` | String | No | Descriptive name (only used for custom rules with `script`) |
| `script` | String | No | Custom JavaScript code for advanced security logic (see [Custom security rules](#custom-security-rules)) |

### Defining who can access

The `allow` property supports four modes:

**All users** (including anonymous):

```json
{ "allow": "all" }
```

**Logged-in users only:**

```json
{ "allow": "loggedIn" }
```

**Specific users** (filtered by session data):

```json
{
  "allow": {
    "user": {
      "Role": { "equals": "Admin" }
    }
  }
}
```

User filters support three operators: `equals`, `notequals`, and `contains`. Values can reference the user's session data using Handlebars syntax (e.g., `"{{ user.[Email] }}"`). Multiple conditions in the same `user` object are combined with AND logic.

**Specific API token:**

```json
{
  "allow": {
    "tokens": [42857]
  }
}
```

### Restricting columns

Use `include` to whitelist specific columns, or `exclude` to hide specific columns. You cannot use both in the same rule. If neither is specified, all columns are accessible.

```json
{
  "type": ["select"],
  "allow": "loggedIn",
  "exclude": ["Password", "SSN", "Salary"]
}
```

<p class="warning"><strong>Security note:</strong> Always exclude privilege fields (e.g., <code>Admin</code>, <code>Role</code>, <code>Permissions</code>) from rules that allow logged-in users to insert or update records. Otherwise, users can escalate their own privileges.</p>

### Example: role-based access with protected fields

```json
[
  {
    "type": ["select", "insert", "update", "delete"],
    "allow": { "user": { "Role": { "equals": "Admin" } } },
    "enabled": true
  },
  {
    "type": ["select"],
    "allow": "loggedIn",
    "exclude": ["Password", "Salary"],
    "enabled": true
  },
  {
    "type": ["update"],
    "allow": "loggedIn",
    "require": [
      { "Email": { "equals": "{{user.[Email]}}" } }
    ],
    "exclude": ["Role", "Admin", "Permissions"],
    "enabled": true
  },
  {
    "type": ["insert"],
    "allow": "loggedIn",
    "require": [
      "Email",
      "First Name",
      { "Email": { "equals": "{{user.[Email]}}" } },
      { "Role": { "equals": "User" } }
    ],
    "exclude": ["Admin", "Permissions"],
    "enabled": true
  }
]
```

## Data requirements and query validation

The `require` property defines conditions that incoming queries must satisfy. This is not the same as querying data — it controls how queries are **assessed against the rule's data requirements**.

<p class="info">If you add data requirements to your rules, querying your Data Sources through Fliplet core components may stop working unless you write custom queries that satisfy the requirements.</p>

The behavior of `require` varies by operation type:

- **For `select` and `delete` operations:** Acts as an additional filter — users can only read or delete records matching these conditions.
- **For `insert` and `update` operations:** Validates that the submitted data contains the required fields and values.

### Data requirement types

`require` accepts an array of strings (required field names) and objects (field conditions). Four requirement types are available:

| Requirement type | Description | Query patterns that satisfy this requirement |
|---|---|---|
| Field is required | The query must include the specified column | Any query that provides the column as a key |
| Field equals | The query value for the column must match exactly | `{ Field: value }` or `{ Field: { $eq: value } }` |
| Field not equals | The query value for the column must not match the specified value | `{ Field: { $ne: value } }` or any query where the field's value differs from the specified value |
| Field contains | The query value for the column must contain the specified substring | `{ Field: value }` or `{ Field: { $iLike: value } }` or `{ Field: { $like: value } }` |

<p class="quote">These requirement types (<code>equals</code>, <code>notequals</code>, <code>contains</code>) are <strong>not</strong> query operators — they define how the security rule validates incoming queries. For the full list of query operators you can use when reading and writing data, see the <a href="API/datasources/query-operators.html">query operators reference</a>.</p>

### Require syntax

**Required fields** (string):

```json
"require": ["Email", "FirstName", "Department"]
```

**Field conditions** (object with operator):

```json
"require": [
  { "Email": { "equals": "{{ user.[Email] }}" } },
  { "Status": { "notequals": "Archived" } },
  { "Department": { "contains": "Engineering" } }
]
```

You can mix both formats in the same array:

```json
"require": [
  "Title",
  "Description",
  { "CreatedBy": { "equals": "{{ user.[Email] }}" } },
  { "Status": { "equals": "Draft" } }
]
```

### Sample query satisfying a "contains" requirement

If a rule has `{ "Email": { "contains": "@fliplet.com" } }` as a requirement, the following query satisfies it:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  return connection.find({
    where: { Email: { $iLike: '@fliplet.com' } }
  });
});
```

## Custom security rules

For advanced logic beyond what the standard rule properties support, you can write custom JavaScript security rules.

![Custom security](assets/img/datasource-custom-security.png)

When writing a custom rule, these variables are available in the script context:

- `type` (String) — the operation the user is attempting: `select`, `insert`, `update`, or `delete`
- `user` (Object) — the user's session data, when the user is logged in
- `query` (Object or Array) — the input query (for reads) or data being written (for inserts and updates). When using the commit endpoint, this is the array of entries being inserted or updated.
- `entry` (Object) — the existing entry being updated, if applicable

The `query` parameter changes shape depending on the operation, so your code should handle all relevant scenarios. Here is an example covering all operation types:

```js
switch (type) {
  case 'select':
    // Check scenario when selecting records
    // "query" here is the input query from the API request
    return { granted: query.foo !== 'bar' };

  case 'insert':
    // Check scenario when inserting records.
    // "query" here is the input data being inserted.
    // It can also be an array when committing multiple records at once.
    if (Array.isArray(query)) {
      // Check each object in the input data
      return { granted: query.every(data => data.foo === 'bar') };
    }

    // Check the input data
    return { granted: query.foo === 'bar' };

  case 'update':
    // Check scenario when updating records.
    // "query" here is the input data being updated.
    // It can also be an array when committing multiple records at once.
    // You will also receive the input "entry" object when applicable.
    if (Array.isArray(query)) {
      // Check each object in the input data
      return { granted: query.every(data => data.foo === 'bar') };
    }

    // Check the input data to update and the existing entry
    return { granted: query.foo === 'bar' && entry.data.foobar === true };

  case 'delete':
    // Check scenario when deleting records.
    // "query" here is the input data being updated.
    // It can also be an array when deleting multiple records at once.
    if (Array.isArray(query)) {
      // Check each object in the input data
      return { granted: query.every(data => data.foo === 'bar') };
    }

    // Check the input data
    return { granted: query.foo === 'bar' };
}
```

### Granting access

Return an object with `granted: true` to grant access. You can also return an `exclude` array to restrict which columns the user can read, write, or update:

```js
if (type === 'select') {
  // Grant access to admin users
  if (user.Admin === 'Yes') {
    return { granted: true };
  }

  // Grant access to any other user, but don't allow reading the "Phone" and "NextOfKin" columns
  return { granted: true, exclude: ['Phone', 'NextOfKin'] };
}

// No further access is granted by this rule to other type of operations
```

### Handling different operation types

The `query` parameter contains different data depending on the operation:

- Reading data (selects): the input query to filter the data
- Writing data (inserts and updates): the data being written to the entry
- Deleting data (deletes): the data of the entry being deleted

When using the "commit" JS API or REST API, the `query` contains the payload from the request body. For example, if you delete a list of entries by ID using the commit endpoint, the `query` parameter includes the `delete` key with the array of IDs.

### Modifying the input query

Rules can modify the `query` object to enforce constraints:

```js
if (type === 'select') {
  // Only allow reading records for the same office as the user's
  query.Office = user.Office;

  return { granted: true };
}

if (type === 'insert') {
  // Forces writes to have the office field same as the user's
  query.Office = user.Office;

  // Also generate a "CreatedAt" datetime field for all records added
  query.CreatedAt = Date.now();

  return { granted: true };
}
```

### Checking data when committing changes

When a data source is updated via the `commit` endpoint (or JS API), the `query` contains the array of entries being inserted or updated. The security rule runs **twice** — once for inserts and once for updates.

```js
if (type === 'insert') {
  // This code block runs when evaluating entries to be inserted
  // "query" here is the array of entries to insert
} else if (type === 'update') {
  // This code block runs when evaluating entries to be updated
  // "query" here is the array of entries to update
}
```

### Reading data from other Data Sources

Custom rules can read data from other Data Sources using the `find` (multiple records) and `findOne` (single record) methods of the `DataSources` server-side library.

Connect using the data source ID (number) or name (string):

```js
if (type === 'select') {
  var entry = await DataSources(123).findOne({
    where: {
      Office: user.Office,
      Managers: { $in: user.Manager },
      Country: { $like: '%United Kingdom%' }
    }
  });

  // Allow reading data if the user has a manager in the same office
  if (entry) {
    return { granted: true };
  }
}

if (type === 'insert') {
  var entries = await DataSources('Users').find();

  // Only allow writes as long as there are less than 10 entries in the target Data Source
  if (entries && entries.length < 10) {
    return { granted: true };
  }
}
```

Both `find` and `findOne` accept the following properties:

- `where` (Object) — query filter supporting [standard query operators](API/datasources/query-operators.html) such as `$eq`, `$ne`, `$like`, `$iLike`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`
- `limit` (Number, defaults to `100`)
- `offset` (Number, defaults to `0`)