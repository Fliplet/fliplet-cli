# Data Sources JS APIs

The Data Source JS APIs allows you to interact and make any sort of change to your app's Data Sources from the app itself.

## ⚠️ Important: All API Calls Are Asynchronous

**All Fliplet Data Sources API methods return Promises and must be chained using `.then()` or used with `async/await`.**

```js
// Using async/await (recommended)
async function example() {
  const connection = await Fliplet.DataSources.connect(dataSourceId);
  const records = await connection.find();
  return records;
}

// Using .then() chaining
Fliplet.DataSources.connect(dataSourceId)
  .then(connection => connection.find())
  .then(records => {
    // Process records
  })
  .catch(error => {
    // Handle errors
  });
```

---

## Core Workflow: Connect First

### Connect to a Data Source by Name

**Purpose:** Connect using the data source name instead of ID (recommended for portability)  
**Syntax:** `Fliplet.DataSources.connectByName(name)`  
**Returns:** `Promise<Connection>`  
**When to use:** Preferred method - data source names remain consistent when copying apps between environments

```js
const connection = await Fliplet.DataSources.connectByName("Users");
```

**Why use connectByName:** Data source names typically remain the same when copying apps between environments, while IDs change. This makes your code more portable and maintainable.

### Connect to a Data Source by ID

**Purpose:** Establish a connection to work with a specific data source by ID  
**Syntax:** `Fliplet.DataSources.connect(dataSourceId, options?)`  
**Returns:** `Promise<Connection>`  
**When to use:** Only when you specifically need to target a data source by ID (less portable)

```js
// Basic connection by ID (not recommended for portability)
const connection = await Fliplet.DataSources.connect(123);

// Advanced connection with options
const connection = await Fliplet.DataSources.connect(123, {
  offline: false // Force online-only queries (mobile apps default to offline)
});
```

**Note:** Fliplet apps on mobile devices attempt to connect to the **offline bundled data sources by default**. You can optionally prevent a data source from being bundled by editing its settings in Fliplet Studio, or by using the `offline: false` parameter to connect only to the live online data source.

---

## Essential Connection Methods

### 1. Find Records (Query Data)

**Purpose:** Retrieve records from the data source  
**Syntax:** `connection.find(options?)`  
**Returns:** `Promise<Record[]>`  
**When to use:** Reading/querying data (most common operation)

#### Basic Usage
```js
// Complete example: Get all user records
const connection = await Fliplet.DataSources.connectByName("Users");
const allUsers = await connection.find();
console.log(`Found ${allUsers.length} users:`, allUsers);

// Complete example: Get users from London office
const connection = await Fliplet.DataSources.connectByName("Users");
const londonUsers = await connection.find({
  where: { Office: 'London' }
});
console.log('London users:', londonUsers);

// Complete example: Get specific user data columns only
const connection = await Fliplet.DataSources.connectByName("Users");
const userNames = await connection.find({
  attributes: ['Name', 'Email', 'Department']
});
console.log('User names and emails:', userNames);
```

#### Advanced Querying
```js
// Complete example: Complex query with multiple conditions
const connection = await Fliplet.DataSources.connectByName("Users");
const seniorEngineers = await connection.find({
  where: {
    Office: 'London',
    Age: { $gte: 25 },
    Department: { $in: ['Engineering', 'Design'] },
    Status: 'Active'
  },
  order: [['Name', 'ASC']],
  limit: 50
});
console.log('Senior engineers in London:', seniorEngineers);

// Complete example: Using Fliplet's custom $filters (optimized for performance)
const connection = await Fliplet.DataSources.connectByName("Users");
const activeUsers = await connection.find({
  where: {
    $filters: [
      {
        column: 'Email',
        condition: 'contains',
        value: '@company.com'
      },
      {
        column: 'Status',
        condition: '==',
        value: 'Active'
      }
    ]
  }
});
console.log('Active company users:', activeUsers);
```

#### Query Operators Reference

**MongoDB-style Operators (Sift.js)**
```js
// Comparison operators
{ field: { $gt: 10 } }           // Greater than
{ field: { $gte: 10 } }          // Greater than or equal
{ field: { $lt: 10 } }           // Less than
{ field: { $lte: 10 } }          // Less than or equal
{ field: { $eq: 'value' } }      // Equal to
{ field: { $ne: 'value' } }      // Not equal to

// Array operators
{ field: { $in: ['a', 'b'] } }   // Value in array
{ field: { $nin: ['a', 'b'] } }  // Value not in array

// Text operators
{ field: { $iLike: 'john' } }    // Case-insensitive partial match
{ field: { $regex: /pattern/i } } // Regular expression

// Logical operators
{ $and: [{ field1: 'a' }, { field2: 'b' }] }
{ $or: [{ field1: 'a' }, { field2: 'b' }] }
{ $nor: [{ field1: 'a' }, { field2: 'b' }] }  // None of the conditions
{ field: { $not: { $lt: 18 } } }              // Logical NOT

// Other operators
{ field: { $exists: true } }     // Field exists
{ field: { $mod: [4, 0] } }      // Modulo operation
{ field: { $all: ['a', 'b'] } }  // Array contains all values
{ field: { $size: 3 } }          // Array size
{ field: { $type: 'string' } }   // Type check
{ field: { $elemMatch: { $gte: 80 } } } // Array element matching
```

**Fliplet Custom $filters Operator**

The `$filters` operator provides optimized performance and additional conditions:

```js
{
  where: {
    $filters: [
      // Exact match (case-insensitive)
      {
        column: 'Email',
        condition: '==',
        value: 'user@email.com'
      },
      // Not equal
      {
        column: 'Status',
        condition: '!=',
        value: 'Inactive'
      },
      // Numeric comparisons
      {
        column: 'Age',
        condition: '>',    // '>', '>=', '<', '<='
        value: 25
      },
      // Contains (case-insensitive partial match)
      {
        column: 'Name',
        condition: 'contains',
        value: 'John'
      },
      // Empty/not empty checks
      {
        column: 'Notes',
        condition: 'empty'    // or 'notempty'
      },
      // Range check
      {
        column: 'Score',
        condition: 'between',
        value: { from: 80, to: 100 }
      },
      // One of multiple values
      {
        column: 'Department',
        condition: 'oneof',
        value: ['Engineering', 'Design', 'Marketing']
      },
      // Date comparisons
      {
        column: 'Birthday',
        condition: 'dateis',     // 'datebefore', 'dateafter', 'datebetween'
        value: '1990-01-01'
      }
    ]
  }
}
```

**📖 Complete Operators Reference:** [View detailed query operators documentation](datasources/query-operators.md)

---

### Count Records Only

**Purpose:** Efficiently count entries matching criteria without retrieving data
**Syntax:** `connection.find({ countOnly: true, where?: object })`
**Returns:** `Promise<number>` - The count of matching entries
**When to use:** Checking availability, preventing duplicates, analytics

#### Basic Usage

```js
// Count all entries
const connection = await Fliplet.DataSources.connectByName("Users");
const totalUsers = await connection.find({ countOnly: true });
console.log(`Total users: ${totalUsers}`);

// Count with filter
const connection = await Fliplet.DataSources.connectByName("Bookings");
const bookedSlots = await connection.find({
  where: { SessionId: 123 },
  countOnly: true
});
console.log(`Booked slots: ${bookedSlots}`);

// Check if user already registered
const connection = await Fliplet.DataSources.connectByName("Registrations");
const existingCount = await connection.find({
  where: { Email: 'user@example.com' },
  countOnly: true
});
if (existingCount > 0) {
  console.log('User already registered');
}
```

#### Security Notes

  - Requires `count` or `select` permission in security rules
  - `select` permission automatically grants `count` (backwards compatible)
  - Use `count`-only rules to allow checking availability without exposing data

#### Performance Notes

  - Simple filters (equality, `$eq`, `$gt`, `$lt`, `$and`, `$or`) use fast database `COUNT(*)`
  - Complex filters (`$regex`, `$elemMatch`, etc.) fall back to fetching + filtering, same performance as a regular query but returns only the count

---

### 2. Insert Records (Add Data)

**Purpose:** Add new records to the data source  
**Syntax:** `connection.insert(data, options?)`  
**Returns:** `Promise<Record>`  
**When to use:** Creating new entries

```js
// Complete example: Insert a single user record
const connection = await Fliplet.DataSources.connectByName("Users");
const newUser = await connection.insert({
  Name: 'John Doe',
  Email: 'john.doe@company.com',
  Department: 'Engineering',
  Office: 'London',
  Age: 28,
  Status: 'Active'
});
console.log('Created new user:', newUser);

// Complete example: Insert with acknowledgment for immediate local update
const connection = await Fliplet.DataSources.connectByName("Users");
const newUser = await connection.insert({
  Name: 'Jane Smith',
  Email: 'jane.smith@company.com',
  Department: 'Design',
  Office: 'New York',
  Age: 26,
  Status: 'Active'
}, {
  ack: true // Ensure local database updates immediately
});
console.log('Created user with immediate sync:', newUser);

// Complete example: Insert with file upload (FormData)
const connection = await Fliplet.DataSources.connectByName("Users");
const formData = new FormData();
formData.append('Name', 'Bob Johnson');
formData.append('Email', 'bob.johnson@company.com');
formData.append('Department', 'Marketing');
formData.append('Avatar', fileInput.files[0]); // File from input element

const newUserWithFile = await connection.insert(formData, {
  folderId: 123 // Specify media folder for file uploads
});
console.log('Created user with avatar:', newUserWithFile);
```

**Options:**
- `folderId` (Number): MediaFolder ID where uploaded files should be stored
- `ack` (Boolean): If true, ensures the local offline database gets updated immediately

### 3. Update Records (Modify Data)

**Purpose:** Modify existing records  
**Syntax:** `connection.update(recordId, data, options?)`  
**Returns:** `Promise<Record>`  
**When to use:** Changing existing entries

```js
// Complete example: Update a user record by ID
const connection = await Fliplet.DataSources.connectByName("Users");

// First find the user to get their ID
const users = await connection.find({
  where: { Email: 'john.doe@company.com' }
});

if (users.length > 0) {
  const updatedUser = await connection.update(users[0].id, {
    Office: 'Berlin',
    Department: 'Product Engineering'
  });
  console.log('Updated user:', updatedUser);
}

// Complete example: Update user with file upload
const connection = await Fliplet.DataSources.connectByName("Users");
const formData = new FormData();
formData.append('Office', 'San Francisco');
formData.append('Avatar', newAvatarFile);

const updatedUser = await connection.update(456, formData, {
  mediaFolderId: 789
});
console.log('Updated user with new avatar:', updatedUser);
```

### 4. Find Single Record

**Purpose:** Get one specific record  
**Syntax:** `connection.findOne(options)` or `connection.findById(id)`  
**Returns:** `Promise<Record | undefined>`  
**When to use:** Looking for a specific entry

```js
// Complete example: Find one user by email
const connection = await Fliplet.DataSources.connectByName("Users");
const user = await connection.findOne({
  where: { Email: 'john.doe@company.com' }
});

if (user) {
  console.log('Found user:', user);
} else {
  console.log('User not found');
}

// Complete example: Find user by ID (if you know the ID)
const connection = await Fliplet.DataSources.connectByName("Users");
const user = await connection.findById(123);

if (user) {
  console.log('Found user by ID:', user);
} else {
  console.log('User with ID 123 not found');
}
```

### 5. Remove Records (Delete Data)

**Purpose:** Delete records from the data source  
**Syntax:** `connection.removeById(id)` or `connection.query({ type: 'delete', where: {...} })`  
**Returns:** `Promise<void>`  
**When to use:** Removing unwanted entries

```js
// Complete example: Remove user by ID
const connection = await Fliplet.DataSources.connectByName("Users");

// First find the user to get their ID
const users = await connection.find({
  where: { Email: 'obsolete.user@company.com' }
});

if (users.length > 0) {
  await connection.removeById(users[0].id);
  console.log('User removed successfully');
}

// Complete example: Remove multiple users matching criteria
const connection = await Fliplet.DataSources.connectByName("Users");
const deletedCount = await connection.query({
  type: 'delete',
  where: { Status: 'Inactive' }
});
console.log(`Removed ${deletedCount} inactive users`);
```

---

## Bulk Operations

### Insert Multiple Records

**Purpose:** Add many records at once (more efficient than individual inserts)  
**Syntax:** `connection.append(recordsArray, options?)`  
**Returns:** `Promise<void>`  
**When to use:** Bulk data import

```js
// Complete example: Add multiple users at once
const connection = await Fliplet.DataSources.connectByName("Users");

const newUsers = [
  { 
    Name: 'Alice Cooper', 
    Email: 'alice.cooper@company.com',
    Department: 'Engineering',
    Office: 'London',
    Age: 29,
    Status: 'Active'
  },
  { 
    Name: 'Bob Wilson', 
    Email: 'bob.wilson@company.com',
    Department: 'Design',
    Office: 'New York',
    Age: 31,
    Status: 'Active'
  },
  { 
    Name: 'Charlie Brown', 
    Email: 'charlie.brown@company.com',
    Department: 'Marketing',
    Office: 'Berlin',
    Age: 27,
    Status: 'Active'
  }
];

await connection.append(newUsers);
console.log(`Added ${newUsers.length} new users`);

// Complete example: Bulk insert with disabled hooks for better performance
const connection = await Fliplet.DataSources.connectByName("Users");
await connection.append(newUsers, { runHooks: false });
console.log('Bulk insert completed (hooks disabled for performance)');
```

### Replace All Data

**Purpose:** Replace entire data source contents with new records  
**Syntax:** `connection.replaceWith(recordsArray)`  
**Returns:** `Promise<void>`  
**When to use:** Complete data refresh

```js
// Complete example: Replace all users with new dataset
const connection = await Fliplet.DataSources.connectByName("Users");

const newUserDataset = [
  { 
    Name: 'Admin User', 
    Email: 'admin@company.com',
    Department: 'IT',
    Office: 'London',
    Age: 35,
    Status: 'Active'
  },
  { 
    Name: 'Test User', 
    Email: 'test@company.com',
    Department: 'QA',
    Office: 'London',
    Age: 28,
    Status: 'Active'
  }
];

await connection.replaceWith(newUserDataset);
console.log('Replaced all user data with new dataset');
```

### Commit Multiple Changes

**Purpose:** Insert, update, and delete in a single operation  
**Syntax:** `connection.commit(options)`  
**Returns:** `Promise<void>`  
**When to use:** Complex bulk operations

```js
// Complete example: Multiple operations in one transaction
const connection = await Fliplet.DataSources.connectByName("Users");

await connection.commit({
  entries: [
    // Insert new user
    { 
      data: { 
        Name: 'New Employee', 
        Email: 'new.employee@company.com',
        Department: 'Sales',
        Office: 'Paris',
        Age: 24,
        Status: 'Active'
      } 
    },
    
    // Update existing user (assuming ID 123 exists)
    { 
      id: 123, 
      data: { 
        Office: 'Remote',
        Department: 'Engineering - Remote'
      } 
    }
  ],
  
  // Delete users by ID (assuming these IDs exist)
  delete: [456, 789],
  
  // Keep existing entries not mentioned
  append: true,
  
  // Merge with existing data instead of replacing
  extend: true,
  
  // Don't return all entries (faster)
  returnEntries: false
});

console.log('Bulk operations completed successfully');
```

---

## Pagination and Performance

### Basic Pagination

```js
// Complete example: Paginated user retrieval
const connection = await Fliplet.DataSources.connectByName("Users");

// Get first 10 users
const page1 = await connection.find({
  limit: 10,
  offset: 0,
  order: [['Name', 'ASC']]
});
console.log('Page 1 users:', page1);

// Get next 10 users
const page2 = await connection.find({
  limit: 10,
  offset: 10,
  order: [['Name', 'ASC']]
});
console.log('Page 2 users:', page2);

// Complete example: Get pagination info
const connection = await Fliplet.DataSources.connectByName("Users");
const result = await connection.find({
  limit: 10,
  offset: 0,
  includePagination: true,
  order: [['Name', 'ASC']]
});

console.log(`Users: ${result.entries.length}`);
console.log(`Total users: ${result.pagination.total}`);
console.log(`Page: ${(result.pagination.offset / result.pagination.limit) + 1}`);
```

### Advanced Pagination with Cursor

**Purpose:** Navigate through large datasets efficiently  
**Syntax:** `connection.findWithCursor(options)`  
**Returns:** `Promise<Cursor>`  
**When to use:** Building paginated interfaces

```js
// Complete example: Using cursor for pagination
const connection = await Fliplet.DataSources.connectByName("Users");

const cursor = await connection.findWithCursor({
  where: { Status: 'Active' },
  limit: 5,
  order: [['Name', 'ASC']]
});

console.log(`Page ${cursor.currentPage + 1} users:`, cursor);
console.log(`Total users on page: ${cursor.length}`);
console.log(`Is first page: ${cursor.isFirstPage}`);
console.log(`Is last page: ${cursor.isLastPage}`);

// Navigate to next page
if (!cursor.isLastPage) {
  const nextPage = await cursor.next().update();
  console.log('Next page users:', nextPage);
}

// Navigate to previous page
if (!cursor.isFirstPage) {
  const prevPage = await cursor.prev().update();
  console.log('Previous page users:', prevPage);
}

// Jump to specific page
const page3 = await cursor.setPage(2).update(); // 0-indexed, so 2 = page 3
console.log('Page 3 users:', page3);
```

**Cursor Properties:**
- `limit`: The page size (number of records per page)
- `offset`: Current offset from first page
- `currentPage`: Current page number (0-based)
- `isFirstPage`: Whether current page is first
- `isLastPage`: Whether current page is last
- `query`: Options used for the cursor

**Cursor Methods:**
- `next()`: Move to next page
- `prev()`: Move to previous page
- `setPage(n)`: Go to specific page
- `update()`: Refresh current page data

---

## Sorting and Ordering

**Purpose:** Control the order of returned records  
**Syntax:** Use `order` array in find options  
**When to use:** When you need specific sorting

```js
// Complete example: Sort users by creation date (newest first)
const connection = await Fliplet.DataSources.connectByName("Users");
const recentUsers = await connection.find({
  order: [['createdAt', 'DESC']],
  limit: 10
});
console.log('Most recent users:', recentUsers);

// Complete example: Sort by multiple columns
const connection = await Fliplet.DataSources.connectByName("Users");
const sortedUsers = await connection.find({
  order: [
    ['data.Department', 'ASC'],  // Sort by department first
    ['data.Name', 'ASC']         // Then by name
  ]
});
console.log('Users sorted by department then name:', sortedUsers);

// Available sort columns:
// - Fliplet columns: 'id', 'order', 'createdAt', 'deletedAt', 'updatedAt'
// - Entry columns: 'data.ColumnName'
// - Sort directions: 'ASC' (ascending), 'DESC' (descending)
```

---

## Real-time Data Subscriptions

**Purpose:** Listen to real-time updates on data source changes  
**Syntax:** `connection.subscribe(options, callback)`  
**Returns:** `Subscription`  
**When to use:** Building collaborative or live-updating interfaces

```js
// Complete example: Real-time user updates
const connection = await Fliplet.DataSources.connectByName("Users");

const subscription = connection.subscribe({
  events: ['insert', 'update', 'delete'] // Which events to listen for
}, (changes) => {
  if (changes.inserted.length) {
    console.log('New users added:', changes.inserted);
    // Update your UI to show new users
  }
  
  if (changes.updated.length) {
    console.log('Users updated:', changes.updated);
    // Update your UI to reflect changes
  }
  
  if (changes.deleted.length) {
    console.log('Users deleted:', changes.deleted);
    // Remove users from your UI
  }
});

// Subscription management
console.log('Subscription status:', subscription.status()); // 'active' or 'paused'

// Pause subscription temporarily
subscription.pause();
console.log('Subscription paused');

// Resume subscription
subscription.resume();
console.log('Subscription resumed');

// Clean up - always unsubscribe when done
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Subscription ended');
}, 30000); // Unsubscribe after 30 seconds
```

---

## Utility Methods

### Get Unique Values

**Purpose:** Get distinct values from columns  
**When to use:** Building filters, dropdowns, or analytics

```js
// Complete example: Get unique office locations
const connection = await Fliplet.DataSources.connectByName("Users");
const offices = await connection.getIndex('Office');
console.log('Available offices:', offices);
// Returns: ['London', 'New York', 'Berlin', 'Paris']

// Complete example: Get unique values for multiple columns
const connection = await Fliplet.DataSources.connectByName("Users");
const indexes = await connection.getIndexes(['Office', 'Department']);
console.log('Unique values:', indexes);
// Returns: { 
//   Office: ['London', 'New York', 'Berlin'], 
//   Department: ['Engineering', 'Design', 'Marketing'] 
// }

// Use for building dynamic filters
const { Office: availableOffices, Department: availableDepartments } = indexes;
console.log('Build office filter with:', availableOffices);
console.log('Build department filter with:', availableDepartments);
```

### Import Data from File

**Purpose:** Import data from CSV or other file formats  
**Syntax:** `connection.import(FormData)`  
**Returns:** `Promise<void>`  
**When to use:** Bulk data import from files

```js
// Complete example: Import users from CSV file
const connection = await Fliplet.DataSources.connectByName("Users");

// Assuming you have a file input element
const fileInput = document.getElementById('csvFileInput');
const csvFile = fileInput.files[0];

if (csvFile) {
  const formData = new FormData();
  formData.append('file', csvFile);

  try {
    await connection.import(formData);
    console.log('User data imported successfully from CSV');
  } catch (error) {
    console.error('Import failed:', error);
  }
} else {
  console.log('No file selected');
}
```

---

## Data Source Management

### Get Available Data Sources

**Purpose:** List data sources you can work with  
**Syntax:** `Fliplet.DataSources.get(options?)`  
**Returns:** `Promise<DataSource[]>`  
**When to use:** Discovery, building dynamic interfaces

```js
// Complete example: Get all data sources for organization
const dataSources = await Fliplet.DataSources.get({
  attributes: ['id', 'name', 'columns']
});
console.log('Available data sources:', dataSources);

// Find the Users data source
const usersDataSource = dataSources.find(ds => ds.name === 'Users');
if (usersDataSource) {
  console.log('Users data source found:', usersDataSource);
  console.log('Available columns:', usersDataSource.columns);
}

// Complete example: Get data sources used by current app
const appDataSources = await Fliplet.DataSources.get({
  appId: Fliplet.Env.get('masterAppId'),
  includeInUse: true
});
console.log('App data sources:', appDataSources);

// Complete example: Get specific data source details by ID
const dataSource = await Fliplet.DataSources.getById(123, {
  attributes: ['name', 'hooks', 'columns']
});
console.log('Data source details:', dataSource);
```

### Create New Data Source

**Purpose:** Programmatically create data sources  
**Syntax:** `Fliplet.DataSources.create(options)`  
**Returns:** `Promise<DataSource>`  
**When to use:** Dynamic app setup, automated workflows

```js
// Complete example: Create a new Users data source
const newDataSource = await Fliplet.DataSources.create({
  name: 'Users',
  
  // Attach to current app
  appId: Fliplet.Env.get('appId'),
  organizationId: Fliplet.Env.get('organizationId'),
  
  // Define structure
  columns: ['Name', 'Email', 'Department', 'Office', 'Age', 'Status'],
  
  // Add initial test data
  entries: [
    {
      Name: 'John Smith',
      Email: 'john.smith@company.com',
      Department: 'Engineering',
      Office: 'London',
      Age: 30,
      Status: 'Active'
    },
    {
      Name: 'Sarah Jones',
      Email: 'sarah.jones@company.com',
      Department: 'Design',
      Office: 'New York',
      Age: 28,
      Status: 'Active'
    }
  ],
  
  // Set permissions
  accessRules: [
    { type: ['select', 'insert', 'update', 'delete'], allow: 'all' }
  ]
});

console.log('Created Users data source:', newDataSource);

// Now you can connect to it by name
const connection = await Fliplet.DataSources.connectByName("Users");
console.log('Connected to new Users data source');
```

---

## Advanced Features

### Aggregation Queries

**Purpose:** Run complex data analysis using MongoDB-style aggregation  
**Syntax:** Use `aggregate` option in find method  
**When to use:** Analytics, reporting, data transformation

```js
// Complete example: Group users by department and calculate average age
const connection = await Fliplet.DataSources.connectByName("Users");

const departmentStats = await connection.find({
  aggregate: [
    {
      $project: {
        department: '$data.Department',
        numericAge: { $convertToNumber: '$data.Age' }
      }
    },
    {
      $group: {
        _id: '$department',
        avgAge: { $avg: '$numericAge' },
        userCount: { $sum: 1 }
      }
    }
  ]
});

console.log('Department statistics:', departmentStats);
// Example output: [
//   { _id: 'Engineering', avgAge: 29.5, userCount: 4 },
//   { _id: 'Design', avgAge: 27.2, userCount: 3 }
// ]
```

**Note:** Use the custom `$convertToNumber` operator to convert strings to numbers before aggregation.

### Joining Data from Other Data Sources

For complex queries involving multiple data sources, see the [joins documentation](datasources/joins.md).

### Data Source Views

For filtering data sources with predefined views, see the [views documentation](datasources/views.md).

---

## Common Usage Patterns

### Pattern 1: Complete User Management System
```js
// Initialize user management with connection
const initUserManager = async () => {
  const connection = await Fliplet.DataSources.connectByName("Users");
  console.log('UserManager initialized');
  return connection;
};

// Create new user
const createUser = async (connection, { name, email, department, office, age }) => {
  const newUser = await connection.insert({
    Name: name,
    Email: email,
    Department: department,
    Office: office,
    Age: age,
    Status: 'Active',
    CreatedDate: new Date().toISOString().split('T')[0]
  });
  
  console.log(`Created user: ${newUser.data.Name}`);
  return newUser;
};

// Get all active users
const getActiveUsers = async (connection) => {
  const users = await connection.find({
    where: { Status: 'Active' },
    order: [['data.Name', 'ASC']]
  });
  
  console.log(`Found ${users.length} active users`);
  return users;
};

// Update user information
const updateUser = async (connection, email, updates) => {
  const users = await connection.find({
    where: { Email: email }
  });
  
  if (users.length > 0) {
    const updatedUser = await connection.update(users[0].id, updates);
    console.log(`Updated user: ${email}`);
    return updatedUser;
  } else {
    throw new Error(`User with email ${email} not found`);
  }
};

// Deactivate user (soft delete)
const deactivateUser = async (connection, email) => {
  return updateUser(connection, email, { Status: 'Inactive' });
};

// Usage example
const manageUsers = async () => {
  const connection = await initUserManager();
  
  // Create a new user
  const newUser = await createUser(connection, {
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    department: 'Marketing',
    office: 'Berlin',
    age: 26
  });
  
  // Get all active users
  const activeUsers = await getActiveUsers(connection);
  
  // Update user
  await updateUser(connection, 'alice.johnson@company.com', {
    Office: 'Remote',
    Department: 'Digital Marketing'
  });
  
  // Deactivate user
  await deactivateUser(connection, 'alice.johnson@company.com');
};

// Run the user management example
manageUsers().catch(console.error);
```

### Pattern 2: Advanced Search and Filtering
```js
// Initialize search functionality
const initUserSearch = async () => {
  const connection = await Fliplet.DataSources.connectByName("Users");
  console.log('User search initialized');
  return connection;
};

// Search users with multiple criteria
const searchUsers = async (connection, { 
  searchTerm = '', 
  departments = [], 
  offices = [], 
  minAge = 0, 
  maxAge = 100,
  status = 'Active'
} = {}) => {
  
  const whereConditions = {
    $and: [
      { Status: status },
      { Age: { $gte: minAge, $lte: maxAge } }
    ]
  };

  // Add text search if provided
  if (searchTerm) {
    whereConditions.$and.push({
      $or: [
        { Name: { $iLike: searchTerm } },
        { Email: { $iLike: searchTerm } }
      ]
    });
  }

  // Add department filter if provided
  if (departments.length > 0) {
    whereConditions.$and.push({
      Department: { $in: departments }
    });
  }

  // Add office filter if provided
  if (offices.length > 0) {
    whereConditions.$and.push({
      Office: { $in: offices }
    });
  }

  const results = await connection.find({
    where: whereConditions,
    order: [['data.Name', 'ASC']],
    limit: 100
  });

  console.log(`Search found ${results.length} users`);
  return results;
};

// Get filter options for building UI
const getFilterOptions = async (connection) => {
  const [departments, offices] = await Promise.all([
    connection.getIndex('Department'),
    connection.getIndex('Office')
  ]);

  return { departments, offices };
};

// Advanced search using $filters for better performance
const searchUsersOptimized = async (connection, filters = {}) => {
  const { 
    emailDomain = '@company.com',
    department,
    office,
    ageRange = { min: 18, max: 65 }
  } = filters;

  const results = await connection.find({
    where: {
      $filters: [
        {
          column: 'Status',
          condition: '==',
          value: 'Active'
        },
        {
          column: 'Email',
          condition: 'contains',
          value: emailDomain
        },
        {
          column: 'Age',
          condition: 'between',
          value: { from: ageRange.min, to: ageRange.max }
        },
        ...(department ? [{
          column: 'Department',
          condition: '==',
          value: department
        }] : []),
        ...(office ? [{
          column: 'Office',
          condition: '==',
          value: office
        }] : [])
      ]
    }
  });

  return results;
};

// Usage example
const demonstrateSearch = async () => {
  const connection = await initUserSearch();
  
  // Get filter options for UI
  const { departments, offices } = await getFilterOptions(connection);
  console.log('Available departments:', departments);
  console.log('Available offices:', offices);
  
  // Search with multiple criteria
  const searchResults = await searchUsers(connection, {
    searchTerm: 'john',
    departments: ['Engineering', 'Design'],
    offices: ['London', 'Berlin'],
    minAge: 25,
    maxAge: 40
  });
  console.log('Search results:', searchResults);
  
  // Optimized search
  const optimizedResults = await searchUsersOptimized(connection, {
    department: 'Engineering',
    office: 'London',
    ageRange: { min: 25, max: 35 }
  });
  console.log('Optimized search results:', optimizedResults);
};

// Run the search example
demonstrateSearch().catch(console.error);
```

### Pattern 3: Paginated User Directory with Real-time Updates
```js
// Initialize paginated directory
const initUserDirectory = async (pageSize = 10) => {
  const connection = await Fliplet.DataSources.connectByName("Users");
  
  const currentCursor = await connection.findWithCursor({
    where: { Status: 'Active' },
    limit: pageSize,
    order: [['data.Name', 'ASC']]
  });

  console.log('User directory initialized');
  return { connection, currentCursor };
};

// Display current page
const displayCurrentPage = (cursor) => {
  const { currentPage, isFirstPage, isLastPage, length } = cursor;
  
  console.log(`\n=== User Directory - Page ${currentPage + 1} ===`);
  console.log(`Showing ${length} users:`);
  
  cursor.forEach((user, index) => {
    const { Name, Email, Department, Office } = user.data;
    console.log(`${index + 1}. ${Name} (${Email}) - ${Department}, ${Office}`);
  });

  console.log(`\nNavigation: First Page: ${isFirstPage}, Last Page: ${isLastPage}`);
};

// Navigate to next page
const nextPage = async (cursor) => {
  if (!cursor.isLastPage) {
    const updatedCursor = await cursor.next().update();
    displayCurrentPage(updatedCursor);
    return updatedCursor;
  } else {
    console.log('Already on last page');
    return cursor;
  }
};

// Navigate to previous page
const previousPage = async (cursor) => {
  if (!cursor.isFirstPage) {
    const updatedCursor = await cursor.prev().update();
    displayCurrentPage(updatedCursor);
    return updatedCursor;
  } else {
    console.log('Already on first page');
    return cursor;
  }
};

// Go to specific page
const goToPage = async (cursor, pageNumber) => {
  const updatedCursor = await cursor.setPage(pageNumber - 1).update();
  displayCurrentPage(updatedCursor);
  return updatedCursor;
};

// Setup real-time updates
const setupRealTimeUpdates = (connection, cursor) => {
  const subscription = connection.subscribe({
    events: ['insert', 'update', 'delete']
  }, (changes) => {
    const { inserted, updated, deleted } = changes;
    
    if (inserted.length) {
      console.log(`\n🆕 ${inserted.length} new user(s) added:`);
      inserted.forEach(user => {
        console.log(`  + ${user.data.Name} (${user.data.Email})`);
      });
    }
    
    if (updated.length) {
      console.log(`\n✏️  ${updated.length} user(s) updated:`);
      updated.forEach(user => {
        console.log(`  ~ ${user.data.Name} (${user.data.Email})`);
      });
    }
    
    if (deleted.length) {
      console.log(`\n🗑️  ${deleted.length} user(s) deleted`);
    }

    // Refresh current page to show changes
    refreshCurrentPage(cursor);
  });

  return subscription;
};

// Refresh current page
const refreshCurrentPage = async (cursor) => {
  const updatedCursor = await cursor.update();
  console.log('\n--- Refreshed current page ---');
  displayCurrentPage(updatedCursor);
  return updatedCursor;
};

// Cleanup function
const cleanup = (subscription) => {
  if (subscription) {
    subscription.unsubscribe();
    console.log('Real-time updates stopped');
  }
};

// Usage example
const demonstrateDirectory = async () => {
  const { connection, currentCursor } = await initUserDirectory(5); // 5 users per page
  let cursor = currentCursor;
  
  // Display initial page
  displayCurrentPage(cursor);
  
  // Setup real-time updates
  const subscription = setupRealTimeUpdates(connection, cursor);
  
  // Simulate navigation after delays
  setTimeout(async () => {
    cursor = await nextPage(cursor);
  }, 2000);
  
  setTimeout(async () => {
    cursor = await previousPage(cursor);
  }, 4000);
  
  setTimeout(async () => {
    cursor = await goToPage(cursor, 3);
  }, 6000);
  
  // Cleanup after 30 seconds
  setTimeout(() => {
    cleanup(subscription);
  }, 30000);
};

// Run the directory example
demonstrateDirectory().catch(console.error);
```

### Pattern 4: Comprehensive Error Handling and Recovery
```js
// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Connect with retry logic
const connectWithRetry = async (maxRetries = 3, retryDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await Fliplet.DataSources.connectByName("Users");
    } catch (error) {
      console.warn(`Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect after ${maxRetries} attempts`);
      }
      
      await delay(retryDelay * attempt);
    }
  }
};

// Safe operation wrapper with error handling
const safeOperation = async (operation, operationName) => {
  try {
    const result = await operation();
    console.log(`✅ ${operationName} completed successfully`);
    return result;
  } catch (error) {
    const { status, message } = error;
    
    console.error(`❌ ${operationName} failed:`, message);
    
    switch (status) {
      case 404:
        throw new Error(`${operationName} failed: Data source or record not found`);
      case 403:
        throw new Error(`${operationName} failed: Access denied. Check permissions.`);
      case 429:
        console.log('Rate limit hit, waiting before retry...');
        await delay(5000);
        return safeOperation(operation, operationName);
      case 500:
        throw new Error(`${operationName} failed: Server error. Please try again later.`);
      default:
        throw new Error(`${operationName} failed: ${message}`);
    }
  }
};

// Initialize robust user service
const initRobustUserService = async () => {
  try {
    const connection = await connectWithRetry();
    console.log('✅ UserService initialized successfully');
    return connection;
  } catch (error) {
    console.error('❌ Failed to initialize UserService:', error.message);
    throw error;
  }
};

// Get user safely with error handling
const getUserSafely = async (connection, email) => {
  return safeOperation(async () => {
    const users = await connection.find({
      where: { Email: email }
    });
    
    if (users.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }
    
    return users[0];
  }, `Get user ${email}`);
};

// Create user safely with validation
const createUserSafely = async (connection, userData) => {
  return safeOperation(async () => {
    // Validate required fields
    const requiredFields = ['Name', 'Email', 'Department'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if user already exists
    const existingUsers = await connection.find({
      where: { Email: userData.Email }
    });
    
    if (existingUsers.length > 0) {
      throw new Error(`User with email ${userData.Email} already exists`);
    }

    // Create user with defaults
    const userToCreate = {
      Status: 'Active',
      CreatedDate: new Date().toISOString().split('T')[0],
      ...userData
    };

    return await connection.insert(userToCreate);
  }, `Create user ${userData.Email}`);
};

// Update user safely with validation
const updateUserSafely = async (connection, email, updates) => {
  return safeOperation(async () => {
    const user = await getUserSafely(connection, email);
    
    // Prevent email changes for data integrity
    if (updates.Email && updates.Email !== email) {
      throw new Error('Email address cannot be changed');
    }

    const updatedUser = await connection.update(user.id, {
      ...updates,
      LastModified: new Date().toISOString().split('T')[0]
    });

    return updatedUser;
  }, `Update user ${email}`);
};

// Get all users with fallback handling
const getAllUsersWithFallback = async (connection) => {
  return safeOperation(async () => {
    const users = await connection.find({
      where: { Status: 'Active' },
      order: [['data.Name', 'ASC']]
    });

    if (users.length === 0) {
      console.warn('⚠️  No active users found');
    }

    return users;
  }, 'Get all users');
};

// Usage example with comprehensive error handling
const demonstrateRobustOperations = async () => {
  try {
    const connection = await initRobustUserService();
    
    // Safe operations
    const newUser = await createUserSafely(connection, {
      Name: 'Jane Doe',
      Email: 'jane.doe@company.com',
      Department: 'Engineering',
      Office: 'London',
      Age: 29
    });
    
    const user = await getUserSafely(connection, 'jane.doe@company.com');
    
    const updatedUser = await updateUserSafely(connection, 'jane.doe@company.com', {
      Office: 'Remote',
      Age: 30
    });
    
    const allUsers = await getAllUsersWithFallback(connection);
    
    console.log('All operations completed successfully');
    
  } catch (error) {
    console.error('Application error:', error.message);
    // Handle error appropriately in your app
  }
};

// Run the robust operations example
demonstrateRobustOperations().catch(console.error);
```

---

## Test Data Source Structure

To test all the examples above, you can create a "Users" data source with the following structure:

### Data Source: "Users"

**Columns:**
- `Name` (Text) - Full name of the user
- `Email` (Text) - Email address (should be unique)
- `Department` (Text) - Department name
- `Office` (Text) - Office location
- `Age` (Number) - Age in years
- `Status` (Text) - Active/Inactive status

**Sample Test Data:**
```json
[
  {
    "Name": "John Smith",
    "Email": "john.smith@company.com",
    "Department": "Engineering",
    "Office": "London",
    "Age": 30,
    "Status": "Active"
  },
  {
    "Name": "Sarah Johnson",
    "Email": "sarah.johnson@company.com",
    "Department": "Design",
    "Office": "New York",
    "Age": 28,
    "Status": "Active"
  },
  {
    "Name": "Mike Wilson",
    "Email": "mike.wilson@company.com",
    "Department": "Engineering",
    "Office": "London",
    "Age": 32,
    "Status": "Active"
  },
  {
    "Name": "Emily Davis",
    "Email": "emily.davis@company.com",
    "Department": "Marketing",
    "Office": "Berlin",
    "Age": 26,
    "Status": "Active"
  },
  {
    "Name": "David Brown",
    "Email": "david.brown@company.com",
    "Department": "Sales",
    "Office": "Paris",
    "Age": 29,
    "Status": "Active"
  },
  {
    "Name": "Lisa Garcia",
    "Email": "lisa.garcia@company.com",
    "Department": "Design",
    "Office": "New York",
    "Age": 31,
    "Status": "Active"
  },
  {
    "Name": "Tom Anderson",
    "Email": "tom.anderson@company.com",
    "Department": "Engineering",
    "Office": "Berlin",
    "Age": 27,
    "Status": "Inactive"
  },
  {
    "Name": "Anna Martinez",
    "Email": "anna.martinez@company.com",
    "Department": "HR",
    "Office": "London",
    "Age": 33,
    "Status": "Active"
  },
  {
    "Name": "Chris Taylor",
    "Email": "chris.taylor@company.com",
    "Department": "Marketing",
    "Office": "Remote",
    "Age": 25,
    "Status": "Active"
  },
  {
    "Name": "Jennifer Lee",
    "Email": "jennifer.lee@company.com",
    "Department": "Finance",
    "Office": "New York",
    "Age": 34,
    "Status": "Active"
  }
]
```

### Creating the Test Data Source

You can create this data source programmatically using the API:

```js
// Create the Users data source with test data
const testDataSource = await Fliplet.DataSources.create({
  name: 'Users',
  appId: Fliplet.Env.get('appId'),
  organizationId: Fliplet.Env.get('organizationId'),
  columns: ['Name', 'Email', 'Department', 'Office', 'Age', 'Status'],
  entries: [
    // ... paste the sample test data above
  ],
  accessRules: [
    { type: ['select', 'insert', 'update', 'delete'], allow: 'all' }
  ]
});

console.log('Test Users data source created:', testDataSource);
```

This test data provides:
- **Variety**: Multiple departments, offices, and age ranges
- **Real scenarios**: Active/inactive users, different locations
- **Search testing**: Names and emails for text search testing
- **Filter testing**: Multiple values for department and office filters
- **Pagination testing**: 10 records for testing pagination features
- **Age ranges**: Different ages for numeric filtering tests

All examples in this documentation use this data structure and will work with this test data.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
