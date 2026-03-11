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
| `name` | String | No | Descriptive label shown in Studio for identifying the rule (only used with `script`) |
| `script` | String | No | Custom JavaScript code for advanced security logic. When present, overrides `allow` and `type` — see [Custom security rules](#custom-security-rules) |

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

User filters support three operators: `equals`, `notequals`, and `contains`. Values can reference the user's session data using Handlebars syntax (e.g., {% raw %}`"{{ user.[Email] }}"`{% endraw %}). Multiple conditions in the same `user` object are combined with AND logic. For OR logic, create separate rules instead.

{% raw %}
```json
{
  "allow": {
    "user": {
      "Department": { "contains": "{{user.[Department]}}" },
      "Status": { "notequals": "Inactive" }
    }
  }
}
```
{% endraw %}

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

{% raw %}
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
{% endraw %}

### Example: department-scoped access

In this example, managers see records for their department while regular users only see their own records:

{% raw %}
```json
[
  {
    "type": ["select"],
    "allow": {
      "user": {
        "Role": { "equals": "Manager" },
        "Department": { "contains": "{{user.[Department]}}" }
      }
    },
    "exclude": ["Salary"],
    "enabled": true
  },
  {
    "type": ["select", "update"],
    "allow": "loggedIn",
    "require": [
      { "Email": { "equals": "{{user.[Email]}}" } }
    ],
    "exclude": ["Salary", "ManagerNotes"],
    "enabled": true
  },
  {
    "type": ["insert"],
    "allow": "loggedIn",
    "require": [
      "Name",
      { "Department": { "contains": "{{user.[Department]}}" } },
      { "CreatedBy": { "equals": "{{user.[Email]}}" } }
    ],
    "exclude": ["Role", "Admin"],
    "enabled": true
  }
]
```
{% endraw %}

## Data requirements and query validation

The `require` property defines conditions that incoming queries must satisfy. This is not the same as querying data — it controls how queries are **assessed against the rule's data requirements**.

<p class="info">If you add data requirements to your rules, querying your Data Sources through Fliplet core components may stop working unless you write custom queries that satisfy the requirements.</p>

The behavior of `require` varies by operation type:

- **For `select` and `delete` operations:** The client's query must include a `where` clause that satisfies all requirements, or the rule does not match. For example, if a rule requires `{ "Email": { "equals": "{{user.[Email]}}" } }`, every `find()` call must include `where: { Email: user.Email }` (or the equivalent `$eq` operator) for that rule to grant access. If no `where` clause is provided, or the clause does not satisfy the requirements, the rule is skipped and evaluation continues to the next rule.
- **For `insert` and `update` operations:** Validates that the submitted data contains the required fields and values. If the data does not match, the write is rejected.

### Data requirement types

`require` accepts an array of strings (required field names) and objects (field conditions). Four requirement types are available:

| Requirement type | Description | Query patterns that satisfy this requirement |
|---|---|---|
| Field is required | The query must include the specified column | Any query that provides the column as a key |
| Field equals | The query value for the column must match exactly | `{ Field: value }` or `{ Field: { $eq: value } }` |
| Field not equals | The query value for the column must not match the specified value | `{ Field: { $ne: value } }` or any query where the field's value differs from the specified value |
| Field contains | The query value for the column must contain the specified substring | `{ Field: value }` or `{ Field: { $iLike: value } }` or `{ Field: { $like: value } }` |

<p class="quote">These requirement types (<code>equals</code>, <code>notequals</code>, <code>contains</code>) are <strong>not</strong> query operators — they define how the security rule validates incoming queries. For the full list of query operators you can use when reading and writing data, see the <a href="API/datasources/query-operators.html">query operators reference</a>.</p>

### Handlebars templating

Condition values can reference the logged-in user's session data using Handlebars syntax. This enables dynamic, per-user filtering:

- {% raw %}`{{user.[Email]}}`{% endraw %} — the user's email address
- {% raw %}`{{user.[Department]}}`{% endraw %} — the user's department
- {% raw %}`{{user.[Role]}}`{% endraw %} — the user's role
- {% raw %}`{{user.[ID]}}`{% endraw %} — the user's data source entry ID

### Require syntax

**Required fields** (string) — the query must include these columns:

```json
"require": ["Email", "FirstName", "Department"]
```

**Field conditions** (object with operator) — the query must match these conditions:

{% raw %}
```json
"require": [
  { "Email": { "equals": "{{user.[Email]}}" } },
  { "Status": { "notequals": "Archived" } },
  { "Department": { "contains": "{{user.[Department]}}" } }
]
```
{% endraw %}

You can mix both formats in the same array:

{% raw %}
```json
"require": [
  "Title",
  "Description",
  { "CreatedBy": { "equals": "{{user.[Email]}}" } },
  { "Status": { "equals": "Draft" } }
]
```
{% endraw %}

### Full example: user profiles with self-service access

This example shows a "Users" data source where admins have full access, but regular users can only read and update their own record — and cannot modify privilege fields.

**Data source columns:**

| Email | Name | Role | Department | Salary |
|---|---|---|---|---|
| alice@acme.com | Alice | Admin | Engineering | 120000 |
| bob@acme.com | Bob | User | Marketing | 85000 |
| carol@acme.com | Carol | User | Engineering | 95000 |

**Security rules:**

{% raw %}
```json
[
  {
    "type": ["select", "insert", "update", "delete"],
    "allow": { "user": { "Role": { "equals": "Admin" } } },
    "enabled": true
  },
  {
    "type": ["select", "update"],
    "allow": "loggedIn",
    "require": [
      { "Email": { "equals": "{{user.[Email]}}" } }
    ],
    "exclude": ["Salary", "Role"],
    "enabled": true
  }
]
```
{% endraw %}

**Queries that satisfy the rules:**

When Bob (bob@acme.com) is logged in, his queries must include his email in the `where` clause to match the second rule:

```js
// Reading own profile — works
connection.find({
  where: { Email: 'bob@acme.com' }
});

// Updating own profile — works (Salary and Role are excluded from the response and cannot be written)
connection.update(123, {
  Email: 'bob@acme.com',
  Name: 'Robert'
});
```

**Queries that fail:**

```js
// Reading all records — fails (no where clause, so the require condition is not met
// and the rule is skipped; no other rule grants Bob access)
connection.find();

// Reading another user's record — fails (Email does not match Bob's session)
connection.find({
  where: { Email: 'carol@acme.com' }
});
```

When Alice (admin) is logged in, the first rule matches — she has full access to all records without needing a `where` clause.

### Full example: department-scoped task tracker

This example shows a "Tasks" data source where users can only see and create tasks within their own department.

**Data source columns:**

| Title | AssignedTo | Department | Status | CreatedBy |
|---|---|---|---|---|
| Fix login bug | bob@acme.com | Engineering | Open | carol@acme.com |
| Update branding | dave@acme.com | Marketing | Open | dave@acme.com |
| Deploy v2.1 | carol@acme.com | Engineering | Done | alice@acme.com |

**Security rules:**

{% raw %}
```json
[
  {
    "type": ["select"],
    "allow": "loggedIn",
    "require": [
      { "Department": { "equals": "{{user.[Department]}}" } }
    ],
    "enabled": true
  },
  {
    "type": ["insert"],
    "allow": "loggedIn",
    "require": [
      "Title",
      { "Department": { "equals": "{{user.[Department]}}" } },
      { "CreatedBy": { "equals": "{{user.[Email]}}" } }
    ],
    "exclude": ["Status"],
    "enabled": true
  }
]
```
{% endraw %}

**Queries that satisfy the rules:**

When Carol (Engineering department) is logged in:

```js
// Reading tasks in own department — works
connection.find({
  where: { Department: 'Engineering' }
});

// Creating a task in own department — works
connection.insert({
  Title: 'Write tests',
  Department: 'Engineering',
  AssignedTo: 'bob@acme.com',
  CreatedBy: 'carol@acme.com'
});
```

**Queries that fail:**

```js
// Reading all tasks without filtering by department — fails
// (the require condition is not met, so the rule is skipped)
connection.find();

// Reading tasks from another department — fails
// (Department does not match Carol's session department)
connection.find({
  where: { Department: 'Marketing' }
});

// Creating a task with a different CreatedBy — fails
connection.insert({
  Title: 'Sneak task',
  Department: 'Engineering',
  CreatedBy: 'alice@acme.com'
});
```

## Custom security rules

For advanced logic beyond what the standard rule properties support, you can write custom JavaScript security rules.

![Custom security](assets/img/datasource-custom-security.png)

<p class="warning"><strong>Important:</strong> When a rule has a <code>script</code>, the script is the <strong>sole determinant</strong> of access. Standard rule fields like <code>allow</code> and <code>type</code> are ignored — the script runs regardless of login status or operation type. Your script must perform its own identity and operation checks (e.g., <code>if (!user) return { granted: false };</code>).</p>

When writing a custom rule, these variables are available in the script context:

- `type` (String) — the operation the user is attempting: `select`, `insert`, `update`, or `delete`
- `user` (Object) — the authenticated user's session data, or `undefined` if not logged in. For data-source passport sessions (e.g., Email Verification, Fliplet Login), this contains the flat column values from the user's row in the authentication data source (e.g., `user.Email`, `user.Role`). For SAML2 sessions, it contains the assertion attributes.
- `query` (Object or Array) — the input data, whose shape varies by operation:
  - **`select`**: the unwrapped `where` object from the request (e.g., if the client sends `find({ where: { Email: "a@b.com" } })`, the rule receives `{ Email: "a@b.com" }`)
  - **`insert`** / **`update`**: the data being written to the entry
  - **`delete`**: the data of the entry being deleted
  - **`commit`**: an array of entries — see [Checking data when committing changes](#checking-data-when-committing-changes)
- `entry` (Object) — the existing entry being updated, if applicable

Your code should handle all relevant operation types. Here is an example:

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

Return an object with `granted: true` to grant access. You can also return an `exclude` or `include` array to restrict which columns the user can access:

```js
if (type === 'select') {
  // Grant access to admin users
  if (user && user.Admin === 'Yes') {
    return { granted: true };
  }

  // Grant access to any other user, but don't allow reading the "Phone" and "NextOfKin" columns
  return { granted: true, exclude: ['Phone', 'NextOfKin'] };
}

// No further access is granted by this rule to other type of operations
```

<p class="warning"><strong>Important:</strong> You must return an object — bare boolean values (e.g., <code>return true</code>) are not supported and will be treated as a denial. Always use <code>return { granted: true }</code> or <code>return { granted: false }</code>.</p>

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

Custom rules can read data from other Data Sources using the `find` (multiple records) and `findOne` (single record) methods of the `DataSources` server-side library. These reads run at **server level** and bypass all security rules on the target data source.

<p class="quote">Cross-data-source lookups add a database round-trip per request and are not cached. Keep queries efficient and use <code>findOne</code> when you only need a single record. Synchronous script execution has a <strong>3-second timeout</strong>, but async operations (like <code>DataSources</code> queries) are not bounded by this limit.</p>

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