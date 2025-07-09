# Data Sources Query Operators Reference

This document provides a comprehensive reference for all query operators available in Fliplet Data Sources. These operators are used in the `where` clause of `connection.find()` and related methods.

## MongoDB-style Operators (Sift.js)

Fliplet Data Sources uses [Sift.js](https://github.com/Fliplet/sift.js) which provides MongoDB-compatible query operators.

### Comparison Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$eq` | Equal to | `{ age: { $eq: 25 } }` | Can be simplified to `{ age: 25 }` |
| `$ne` | Not equal to | `{ status: { $ne: 'inactive' } }` | |
| `$gt` | Greater than | `{ score: { $gt: 80 } }` | Optimized for performance |
| `$gte` | Greater than or equal | `{ score: { $gte: 80 } }` | Optimized for performance |
| `$lt` | Less than | `{ age: { $lt: 30 } }` | Optimized for performance |
| `$lte` | Less than or equal | `{ age: { $lte: 30 } }` | Optimized for performance |

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
| `$in` | Value in array | `{ category: { $in: ['tech', 'science'] } }` | Optimized for performance |
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
| `$and` | Logical AND | `{ $and: [{ age: { $gte: 18 } }, { status: 'active' }] }` | Optimized for performance |
| `$or` | Logical OR | `{ $or: [{ role: 'admin' }, { role: 'moderator' }] }` | Optimized for performance |
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
| `$regex` | Regular expression | `{ email: { $regex: /@company\.com$/i } }` | Case-insensitive with `i` flag |
| `$iLike` | Case-insensitive partial match | `{ name: { $iLike: 'john' } }` | Fliplet-specific, optimized |

```js
// Example
  where: { email: { $regex: /@(company|organization)\.com$/i } }
});

const johnUsers = await connection.find({
  where: { name: { $iLike: 'john' } } // Matches John, JOHN, johnny, etc.
});
```

### Existence and Type Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$exists` | Field exists | `{ phone: { $exists: true } }` | Checks if field is present |
| `$type` | Field type check | `{ score: { $type: 'number' } }` | Types: string, number, boolean, array, object |

```js
// Examples
const usersWithPhone = await connection.find({
  where: { phone: { $exists: true } }
});

const numericScores = await connection.find({
  where: { score: { $type: 'number' } }
});
```

### Mathematical Operators

| Operator | Description | Example | Notes |
|----------|-------------|---------|-------|
| `$mod` | Modulo operation | `{ id: { $mod: [2, 0] } }` | `[divisor, remainder]` |

```js
// Examples - find even IDs
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

Fliplet provides a custom `$filters` operator that offers optimized performance and additional conditions not available in standard MongoDB operators.

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
{
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
const { length: userCount, ...users } = await getFilteredUsers({
  minAge: 25,
  departments: ['Engineering', 'Design']
});

console.log(`Found ${userCount} users matching criteria`);
```

---

## Performance Optimization

### Optimized Operators

The following operators are optimized for better performance with Fliplet's database:

**MongoDB-style (optimized):**
- `$or`, `$and`, `$gte`, `$lte`, `$gt`, `$lt`, `$eq`, `$in`

**Fliplet $filters (optimized):**
- `==`, `contains` (especially optimized)

**Optimized Value Types:**
- Strings and numbers perform better than complex objects

### Best Practices

1. **Use $filters for complex conditions** - Better performance than equivalent MongoDB operators
2. **Prefer optimized operators** - Use `$gte` instead of `$not: { $lt: value }`
3. **Index-friendly queries** - Simple equality and range queries perform best
4. **Combine efficiently** - Use `$and` for multiple conditions on different fields

```js
// Good - optimized query
const optimized = await connection.find({
  where: {
    $filters: [
      { column: 'Status', condition: '==', value: 'Active' },
      { column: 'Score', condition: '>=', value: 80 }
    ]
  }
});

// Also good - using optimized MongoDB operators
const mongoOptimized = await connection.find({
  where: {
    Status: 'Active',
    Score: { $gte: 80 }
  }
});
```

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

---

[Back to Data Sources Documentation](../fliplet-datasources.md)
{: .buttons} 