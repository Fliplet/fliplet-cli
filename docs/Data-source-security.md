---
description: Learn how to create your own custom rules for Data Source access.
---

# Securing your Data Sources

Fliplet apps can have each of their screens and data sources secured so that they can only be accessed when certain conditions are met. Our Data Sources management UI allows you to define security rules through a easy-to-use wizard. However, depending on the case you may want to write your own security rule from scratch using JavaScript as explained further below.

![Custom security](assets/img/datasource-custom-security.png)

## Custom security rules

If you need more control on your security rules granting access to Data Sources, you can write your custom conditions using Javascript. When doing so, **these variables are available to the context of the script**:

- `type` (String) the type of operation the user is attempting to run on the Data Source (`select`, `insert`, `update`, `delete`)
- `user` (Object) the user's session with its data, when the user is logged in
- `query` (Object) the input query (when reading data) or data to write (when inserting or updating an entry)

### Granting access with a custom security rule

A rule needs to return an object with `granted: true` when access is granted to the user. The rule can also return an `exclude` array property alongside the same object with a list of columns that are not allowed to be read, written or updated.

Let's take a look at a basic example for a rule:

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

### Make changes to the input query

Rules can also make changes to the input `query` object if required:

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

### Reading data from other Data Sources

Custom rules can also read data from different Data Sources using the `find` (for finding multiple records) and `findOne` (for finding a single record) methods of the `DataSource` server-side library:

```js
if (type === 'select') {
  var entry = await DataSources(123).findOne({
    where: { Office: user.Office, Managers: { $in: user.Manager } }
  });

  // Allow reading data if the user has a manager in the same office
  if (entry) {
    return { granted: true };
  }
}

if (type === 'insert') {
  var entry = await DataSources(123).find();

  // Only allow writes as long as there are less than 10 entries in the target Data Source
  if (entry && entry.length < 10) {
    return { granted: true };
  }
}
```

As you can see, the `DataSource` function accepts the input ID of the target Data Source and exposes two interfaces for reading one or multiple records. Both `find` and `findOne` supports the following properties:

- `where` (Object) Sequelize query to run
- `limit` (Number, defaults to `1` on `findOne`)
- `offset` (Number, defaults to `0`)

---