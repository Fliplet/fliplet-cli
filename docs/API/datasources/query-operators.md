---
title: Data Sources query operators
description: "Filter Data Source queries with MongoDB/Sift operators ($eq, $gt, $in, $regex, $and, $or) inside connection.find() where clauses."
type: api-reference
tags: [js-api, datasources, query, operators]
v3_relevant: true
deprecated: false
---
# Data Sources query operators

Filter Data Source queries with MongoDB/Sift operators (`$eq`, `$gt`, `$in`, `$regex`, `$and`, `$or`, and others) inside `connection.find()` `where` clauses.

## MongoDB-style Operators (Sift.js)

Fliplet Data Sources uses [Sift.js](https://github.com/Fliplet/sift.js) which provides MongoDB-compatible query operators.

### Comparison Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$eq` | Equal to | `{ age: { $eq: 25 } }` | Can be simplified to `{ age: 25 }` |
| `$ne` | Not equal to | `{ status: { $ne: 'inactive' } }` | |
| `$gt` | Greater than | `{ score: { $gt: 80 } }` | |
| `$gte` | Greater than or equal | `{ score: { $gte: 80 } }` | |
| `$lt` | Less than | `{ age: { $lt: 30 } }` | |
| `$lte` | Less than or equal | `{ age: { $lte: 30 } }` | |

```js
// Examples
const adults = await connection.find({
  where: { age: { $gte: 18 } }
});

const highScores = await connection.find({
  where: { 
    score: { $gt: 90 },
    status: { $ne: 'disqualified' }
  }
});
```

### Array Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$in` | Value in array | `{ category: { $in: ['tech', 'science'] } }` | |
| `$nin` | Value not in array | `{ status: { $nin: ['banned', 'suspended'] } }` | |
| `$all` | Array contains all values | `{ tags: { $all: ['urgent', 'review'] } }` | For array fields |
| `$size` | Array size equals | `{ items: { $size: 3 } }` | For array fields |

```js
// Examples
const techPosts = await connection.find({
  where: { category: { $in: ['technology', 'programming', 'ai'] } }
});

const completeTasks = await connection.find({
  where: { 
    tags: { $all: ['completed', 'verified'] },
    assignees: { $size: 2 }
  }
});
```

### Logical Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$and` | Logical AND | `{ $and: [{ age: { $gte: 18 } }, { status: 'active' }] }` | |
| `$or` | Logical OR | `{ $or: [{ role: 'admin' }, { role: 'moderator' }] }` | |
| `$nor` | Logical NOR | `{ $nor: [{ status: 'banned' }, { status: 'suspended' }] }` | None of the conditions |
| `$not` | Logical NOT | `{ age: { $not: { $lt: 18 } } }` | Negates the condition |

```js
// Examples
const eligibleUsers = await connection.find({
  where: {
    $and: [
      { age: { $gte: 18 } },
      { status: 'verified' },
      { $or: [{ role: 'premium' }, { credits: { $gt: 100 } }] }
    ]
  }
});

const activeUsers = await connection.find({
  where: {
    $nor: [
      { status: 'banned' },
      { status: 'suspended' },
      { status: 'deleted' }
    ]
  }
});
```

### Text and Pattern Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$regex` | Regular expression | `{ email: { $regex: '@company\\.com$', $options: 'i' } }` | Case-insensitive with `i` flag |
| `$iLike` | Case-insensitive partial match | `{ name: { $iLike: 'john' } }` | Fliplet-specific |

```js
// Example

const johnUsers = await connection.find({
  where: { name: { $iLike: 'john' } } // Matches John, JOHN, johnny, etc.
});
```

### Existence and Type Operators

Online queries use JSON. A JavaScript `RegExp` object becomes `{}` during serialization; use a string `$regex` and `$options` instead. The bundled `$type` implementation expects constructors, which are not JSON-safe, rather than strings such as `number`.

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$exists` | Field exists | `{ phone: { $exists: true } }` | Checks if field is present |
| `$type` | Not supported as an online JSON type-name filter | — | Do not pass string type names or constructors in online queries. |

```js
// Examples
const usersWithPhone = await connection.find({
  where: { phone: { $exists: true } }
});

// Validate field types in application code; $type is not a JSON type-name filter.
```

### Mathematical Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$mod` | Modulo operation | `{ id: { $mod: [2, 0] } }` | `[divisor, remainder]` |

```js
// Find even values in the data column named id (not record metadata IDs)
const evenIds = await connection.find({
  where: { id: { $mod: [2, 0] } }
});
```

### Array Element Matching

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$elemMatch` | Array element matches condition | `{ scores: { $elemMatch: { $gte: 80, $lt: 90 } } }` | For complex array queries |

```js
// Examples
const studentsWithGoodGrades = await connection.find({
  where: {
    grades: {
      $elemMatch: {
        subject: 'Math',
        score: { $gte: 85 }
      }
    }
  }
});
```

---

## Fliplet Custom $filters Operator

Fliplet provides a custom `$filters` operator for named filter conditions. Filters are combined with AND. Online database optimization depends on the expression and input values; nested filters may be evaluated in memory.

### Syntax

```js
{
  where: {
    $filters: [
      {
        column: 'ColumnName',
        condition: 'operator',
        value: 'value'
      }
      // ... more filters
    ]
  }
}
```

### Available Conditions

| Condition | Description | Value Type | Example |
|-----------|-------------|------------|---------|
| `==` | Case-insensitive exact match | String/Number | `{ column: 'Status', condition: '==', value: 'Active' }` |
| `!=` | Not equal | String/Number | `{ column: 'Status', condition: '!=', value: 'Inactive' }` |
| `>` | Greater than | Number | `{ column: 'Age', condition: '>', value: 18 }` |
| `>=` | Greater than or equal | Number | `{ column: 'Score', condition: '>=', value: 80 }` |
| `<` | Less than | Number | `{ column: 'Price', condition: '<', value: 100 }` |
| `<=` | Less than or equal | Number | `{ column: 'Quantity', condition: '<=', value: 50 }` |
| `contains` | Case-insensitive partial match | String | `{ column: 'Email', condition: 'contains', value: '@company.com' }` |
| `notcontain`, `notcontains` | Excludes matching text; missing values do not count as a negative match | String | `{ column: 'Email', condition: 'notcontains', value: '@example.com' }` |
| `regex` | Regular-expression string | String | `{ column: 'Email', condition: 'regex', value: '@example[.]com$' }` |
| `notoneof`, `notin` | Excludes values from a list | Array/String | `{ column: 'Status', condition: 'notin', value: ['Archived'] }` |
| `none` | Inactive filter; matches all rows | None | `{ column: 'Status', condition: 'none' }` |
| `empty` | Field is empty | None | `{ column: 'Notes', condition: 'empty' }` |
| `notempty` | Field is not empty | None | `{ column: 'Description', condition: 'notempty' }` |
| `between` | Numeric range (inclusive) | Object | `{ column: 'Age', condition: 'between', value: { from: 18, to: 65 } }` |
| `oneof` | Value in list | Array/String | `{ column: 'Category', condition: 'oneof', value: ['Tech', 'Science'] }` |

### Date and Time Conditions

| Condition | Description | Value Format | Example |
|-----------|-------------|--------------|---------|
| `dateis` | Date equals | YYYY-MM-DD | `{ column: 'Birthday', condition: 'dateis', value: '1990-01-01' }` |
| `datebefore` | Date/time before | YYYY-MM-DD or HH:mm | `{ column: 'Deadline', condition: 'datebefore', value: '2024-12-31' }` |
| `dateafter` | Date/time after | YYYY-MM-DD HH:mm | `{ column: 'CreatedAt', condition: 'dateafter', value: '2024-01-01 09:00' }` |
| `datebetween` | Date range | Object | `{ column: 'EventDate', condition: 'datebetween', from: { value: '2024-01-01' }, to: { value: '2024-12-31' } }` |

### Date Unit Comparison

For date conditions, you can optionally specify a unit of comparison:

```js
const birthdayFilter = {
  column: 'Birthday',
  condition: 'dateis',
  value: '1990-01-01',
  unit: 'month' // year, quarter, month, week, day, hour, minute, second
}
```

### Complete $filters Examples

```js
// Complex filtering example with ES6+ features
const getFilteredUsers = async (filters = {}) => {
  const { 
    status = 'Active',
    minAge = 18,
    emailDomain = '@company.com',
    scoreRange = { from: 80, to: 100 },
    departments = ['Engineering', 'Design', 'Product']
  } = filters;

  const results = await connection.find({
    where: {
      $filters: [
        // Active users only
        {
          column: 'Status',
          condition: '==',
          value: status
        },
        // Adults only
        {
          column: 'Age',
          condition: '>=',
          value: minAge
        },
        // Company email addresses
        {
          column: 'Email',
          condition: 'contains',
          value: emailDomain
        },
        // Score in range
        {
          column: 'Score',
          condition: 'between',
          value: scoreRange
        },
        // Specific departments
        {
          column: 'Department',
          condition: 'oneof',
          value: departments
        },
        // Has notes
        {
          column: 'Notes',
          condition: 'notempty'
        },
        // Born in 1990s
        {
          column: 'Birthday',
          condition: 'datebetween',
          from: { value: '1990-01-01' },
          to: { value: '1999-12-31' }
        }
      ]
    }
  });

  return results;
};

// Usage with destructuring
const users = await getFilteredUsers({
  minAge: 25,
  departments: ['Engineering', 'Design']
});

console.log(`Found ${users.length} users matching criteria`);
```

---

## Performance Optimization

### Optimized Operators

Some simple `$or`, `$and`, comparison and `$in` expressions can be evaluated by the online database. Supported `$filters` conditions can also be promoted when their structure and values permit. Other expressions use in-memory filtering. Operator choice alone does not guarantee a particular execution plan or faster query.

### Best Practices

Use the operator that expresses the required result. Add a positive `limit` for bounded reads and verify representative data and result counts. Combining filters does not turn a caller-controlled query into an access rule.

---

## Combining Operators

You can combine different operator types for complex queries:

```js
const getComplexUserData = async ({ department, role, experience, email }) => {
  const complexQuery = await connection.find({
    where: {
      // MongoDB-style operators
      $and: [
        { Department: { $in: department || ['Engineering', 'Design'] } },
        { 
          $or: [
            { Role: role || 'Senior' },
            { Experience: { $gte: experience || 5 } }
          ]
        }
      ],
      // Combined with Fliplet $filters
      $filters: [
        {
          column: 'Email',
          condition: 'contains',
          value: email || '@company.com'
        },
        {
          column: 'LastLogin',
          condition: 'dateafter',
          value: '2024-01-01'
        }
      ]
    }
  });

  return complexQuery;
};

// Usage with object destructuring and default parameters
const userData = await getComplexUserData({
  department: ['Engineering'],
  experience: 3
});
```

## Using operators in custom security rules

The `DataSources(idOrName)` library inside [custom security scripts](security-rules#custom-scripts) has a separate lookup contract. Its `find(options?)` returns flat data objects, not SDK `{ id, data }` records; `findOne(options?)` returns one flat object or `undefined`.

| Property | Type / default | Behavior |
|---|---|---|
| `where` | Object; omitted | Filters data fields. Scalar operator operands are restricted to `$or`, `$and`, `$gt`, `$gte`, `$lt`, `$lte`, `$ne`, `$not`, `$like`, `$iLike`, `$notLike`, `$notILike`, `$eq`, `$contains`. Do not assume the app Sift operators or `$filters` work here. |
| `limit` | Number; at most `100` | Maximum lookup records; `findOne` sets it to `1`. |
| `offset` | Number; omitted | Skip records. |

```js
// Security script: user is a flat login record and may be absent.
if (user && user.Office && user.Email) {
  const manager = await DataSources(123).findOne({
    where: { Office: user.Office, Email: user.Email, Status: 'Active' }
  });
  if (manager) { return { granted: true }; }
}
return { granted: false };
```

Array operands and complex nested expressions must be checked against this lookup contract independently; the whitelist is not a promise of full MongoDB compatibility. A missing or inaccessible source can throw. The rule `require` property uses requirement types such as `equals`, `notequals` and `contains`, described in [security rules](security-rules); it does not use this query operator table.

[Back to Data Sources Documentation](../fliplet-datasources)
{: .buttons}
