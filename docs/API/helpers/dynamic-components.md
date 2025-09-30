# Dynamic components

<p class="warning">This feature is currently available to beta users only.</p>

Helpers can be dropped into what we refer as "dynamic components". These include the **Dynamic container** and **List Repeater** components. Such components supports reactive data binding between the source of the data and the helpers you build.

To support reactive data communication between the two, you must add the `supportsDynamicContext: true` property to your helper configuration:

```js
Fliplet.Helper({
  name: 'profile',
  supportsDynamicContext: true
});
```

When the above property is set, the `parent` property of your instance will reference the parent container that initialized your helper (unless the parent component is a helper, in which case the property will reference such helper).

## Dynamic container

### `Fliplet.DynamicContainer.get(filter, options)`

```js
Fliplet.DynamicContainer.get(filter, options)
```
Return a single Dynamic Container instance. If no `filter` is provided, the **first** available instance is returned.

**Parameters**

- **filter** `Number|String|Object` (optional)
  - If a number or string is provided, it is treated as the **container id**.
  - If an object is provided, it is used as an **exact-match** filter on instance properties (e.g. `{ id: 123 }`, `{ uuid: '...' }`).

- **options** `Object` (optional)
  Controls retry behavior when the container hasn't finished rendering.
  - **ts** `Number` – initial retry delay in milliseconds. If omitted, starts at `10` and increases by **50%** on each retry. Retries stop after `> 5000 ms` total wait; the Promise rejects with a timeout message.

**Returns**

- `Promise<Container>` — resolves with the matching container instance, or **rejects** after repeated attempts if not found.

**Example**
```js
// Find by id
Fliplet.DynamicContainer.get(123).then(container => {
  // use container...
});

// Find by filter object
Fliplet.DynamicContainer.get({ uuid: 'abc-123' }).then(container => {
  console.log('Found container:', container);
});

// With retry tuning
Fliplet.DynamicContainer.get(123, { ts: 20 }).then(c => {
  console.log('Container is ready');
}).catch(err => {
  console.error(err);
});
```

---

### `Fliplet.DynamicContainer.getAll(filter)`

```js
Fliplet.DynamicContainer.getAll(filter)
```
Return **all** Dynamic Container instances, optionally filtered.

**Parameters**

- **filter** `Any` (optional)
  If provided, instances are filtered using Lodash-style matching (e.g. `{ id: 123 }`). If omitted, **all** instances are returned.

**Returns**

- `Promise<Container[]>` — resolves with an array of container instances.

**Example**
```js
// All containers
Fliplet.DynamicContainer.getAll().then(containers => {
  console.log('Count:', containers.length);
});

// Only containers with a specific id
Fliplet.DynamicContainer.getAll({ id: 123 }).then(containers => {
  console.log(containers);
});
```

---

### Container instance API (returned by `.get()` / `.getAll()`)

A **Container** instance exposes the properties and methods below.

- **id** `Number` — Instance id.
- **uuid** `String` — Instance UUID.
- **parent** `Object|undefined` — Parent instance provided by the widget system.
- **dataSourceConnection** `Promise|undefined` — Cached Data Source connection Promise (populated after calling `.connection()`).
- **connection** `Function` — Method to connect to the configured Data Source (see below).

### Methods

#### `container.connection()`
```js
container.connection()
```
Returns (and caches) a **Data Source connection** for the container’s configured `dataSourceId`. Resolves to the standard Fliplet Data Source connection object (supports `.find()`, `.insert()`, `.update()`, `.delete()`, `.subscribe()`, etc., subject to access rules).

**Example**
```js
Fliplet.DynamicContainer.get(123).then(async container => {
  const conn = await container.connection();
  // Read the first 10 entries
  const entries = await conn.find({ limit: 10, order: [['createdAt', 'desc']] });
  console.log(entries);
});
```

---

### Practical examples

### 1) Load entries from the container’s Data Source
```js
Fliplet.DynamicContainer.get().then(async container => {
  const ds = await container.connection();
  const rows = await ds.find({
    where: { Status: 'Published' },
    order: [['data.Title', 'asc']],
    limit: 20
  });
  console.log('Published rows:', rows);
});
```

### 2) Subscribe to live updates
```js
Fliplet.DynamicContainer.get().then(async container => {
  const conn = await container.connection();
  const sub = conn.subscribe({ events: ['insert', 'update', 'delete'] }, bundle => {
    console.log('Live update:', bundle);
  });

  // later...
  // sub.unsubscribe();
});
```

### 3) Insert a new record
```js
Fliplet.DynamicContainer.get().then(async container => {
  const conn = await container.connection();
  const inserted = await conn.insert({ data: { Title: 'New item', Status: 'Draft' } });
  console.log('Inserted:', inserted);
});
```

### 4) Work alongside List Repeater
```js
// Get the repeater and its parent dynamic container's connection
Fliplet.ListRepeater.get('myRepeater').then(async repeater => {
  const parent = repeater.parent; // the Dynamic Container instance
  const conn = await parent.connection();
  const page = await conn.find({ limit: 10, offset: 0 });
  console.log('Page from parent DS:', page);
});
```

---

### Data binding

You can use the Dynamic container's connection object to retrieve data from a data source:

```js
Fliplet.Helper({
  name: 'profile',
  supportsDynamicContext: true,
  render: {
    ready() => {
      // Get the connection object from the parent component
      this.parent.connection().then((connection) => {
        // Find all entries in the data source
        return connection.findWithCursor(cursorData);
      }).then((rows) => {
        // Set the data to the helper
        this.set('foo', rows);
      });
    }
  }
});
```

Here's a working example of a helper using data from the dynamic container component:

```js
Fliplet.Helper({
  name: 'question',
  displayName: 'Question',
  icon: 'fa-check',
  supportsDynamicContext: true,
  render: {
    template:
      '{! each person in context !}' +
      '<label><input type="radio" name="{! fields.title !}" class="answer" value="{! person.data.email !}" /> {! person.data.Name !}</label><br />' +
      '{! endeach !}',
    ready: function() {
      var vm = this;

      // Register a click event when the answer is clicked
      this.$el.find('.answer').click(function() {
        var currentAnswer = $(this).val();
        var answer = _.find(vm.fields.answers, { label: currentAnswer });
        var results = Fliplet.Helper.findOne({ name: 'results' });

        results.set('answer', currentAnswer);
        results.set('correct', !!answer.correct);
      });
    }
  }
});
```

---

## Repeater

# List Repeater JS API

### `Fliplet.ListRepeater.get(filter, options)`

```js
Fliplet.ListRepeater.get(filter, options)
```

- **filter** (`String|Object`)
  The criteria used to find a List Repeater instance.
  - If a `string` is provided, it is treated as the List Repeater `name`.
  - If an `object` is provided, it is used as a set of key/value filters to match against existing repeaters.
  - If omitted, the first available List Repeater instance will be returned.

- **options** (`Object`, optional)
  Additional options for controlling retries.
  - **ts** (`Number`) – Initial retry delay in milliseconds. (**Default**: `10`)

- **returns** `Promise<Object>`
  Resolves with the matching List Repeater instance, or rejects if not found after repeated attempts.

### Example

```js
// Get List Repeater by name
Fliplet.ListRepeater.get('myRepeater').then(function(repeater) {
  console.log('Found repeater:', repeater);
});

// Get List Repeater by filter object
Fliplet.ListRepeater.get({ id: 12345 }).then(function(repeater) {
  repeater.loadData();
});

// Get first available List Repeater
Fliplet.ListRepeater.get().then(function(repeater) {
  console.log('Default repeater:', repeater);
});
```

---

### `Fliplet.ListRepeater.getAll(filter)`

```js
Fliplet.ListRepeater.getAll(filter)
```

- **filter** (`String|Object`, optional)
  The criteria used to find List Repeater instances.
  - If a `string` is provided, it is treated as the List Repeater `name`.
  - If an `object` is provided, it is used as a set of key/value filters to match against existing repeaters.
  - If omitted, all available List Repeater instances will be returned.

- **returns** `Promise<Array<Object>>`
  Resolves with an array of List Repeater instances.

### Example

```js
// Get all repeaters
Fliplet.ListRepeater.getAll().then(function(repeaters) {
  console.log('Repeaters:', repeaters);
});

// Get all repeaters with a filter
Fliplet.ListRepeater.getAll({ direction: 'vertical' }).then(function(repeaters) {
  console.log('Vertical repeaters:', repeaters);
});
```

---

### List Repeater Instance Methods

Once you have a repeater instance (via `.get()` or `.getAll()`), you can use the following methods:

### `repeater.loadData()`

Reloads data into the repeater from its configured Data Container.

```js
repeater.loadData().then(function() {
  console.log('Data reloaded');
});
```

---

### `repeater.loadMore()`

Fetches the next page of data (used in infinite scroll).

```js
repeater.loadMore().then(function() {
  console.log('Loaded more data');
});
```

---

### `repeater.applyUpdates()`

Applies any pending live updates (inserted, updated, deleted rows).

```js
repeater.applyUpdates();
```

---

### `repeater.hasPendingUpdates()`

Checks if there are pending updates waiting to be applied.

- **returns** `Boolean`

```js
if (repeater.hasPendingUpdates()) {
  repeater.applyUpdates();
}
```

---

### `repeater.destroy()`

Destroys the repeater instance and cleans up resources (subscriptions, observers, rows).

```js
repeater.destroy();
```

---

### Row-level Methods

Each row in the repeater is represented by a `ListRepeaterRow` instance.
You can access rows via `repeater.rowComponents`.

- **`row.update(newRowData)`** → Updates a row with new data.
- **`row.destroy()`** → Removes the row and its DOM element.
- **`row.render()`** → Renders or re-renders the row.

```js
const firstRow = repeater.rowComponents[0];

// Update row
firstRow.update({ id: 1, data: { Name: 'Updated!' } });

// Destroy row
firstRow.destroy();
```

---

### Events and Hooks

The List Repeater also emits hooks that can be listened to:

- `listRepeaterRowReady` – Fired when a row is first rendered.
- `listRepeaterRowUpdated` – Fired when a row is updated.
- `repeaterDataRetrieved` – Fired after data has been loaded.
- `repeaterDataRetrieveError` – Fired if data loading fails.

### Example

```js
Fliplet.Hooks.on('listRepeaterRowReady', function(event) {
  console.log('Row ready:', event.row);
});
```







### Data binding

The repeater component declares its own context under the `row` attribute. The example below demonstrates a helper that renders data from the `Name` column of a Data Source Entry. The helper reads the `row` context data from the repeater component, which loops through an array of records.

```js
Fliplet.Helper({
  name: 'person',
  displayName: 'Person',
  icon: 'fa-check',
  supportsDynamicContext: true,
  render: {
    template: '<li>Name: {! row.data.Name !}</li>'
  }
});
```

---

## Data Record Container

---

### `Fliplet.RecordContainer.get(filter, options)`

```js
Fliplet.RecordContainer.get(filter, options)
```
Return a single **Record Container** instance. If no `filter` is provided, the **first** instance is returned.

**Parameters**

- **filter** `String|Object` (optional)
  - If a string is provided, it's treated as the container **name**.
  - If an object is provided, it is used as a **match** object on instance properties (e.g., `{ id: 123 }`, `{ name: 'Profile' }`).

- **options** `Object` (optional)
  Controls retry behavior if the container hasn't finished rendering.
  - **ts** `Number` – initial retry delay in milliseconds. Starts at `10` and increases by **50%** each retry. If it grows **> 5000 ms**, the Promise **rejects**.

**Returns**

- `Promise<RecordContainer>` — resolves with the matching instance, or **rejects** on timeout.

**Example**
```js
// Get by name
Fliplet.RecordContainer.get('UserRecord').then(recordContainer => {
  console.log('Got record container', recordContainer);
});

// Get by filter
Fliplet.RecordContainer.get({ id: 12345 }).then(recordContainer => {
  // use recordContainer...
});
```

---

### `Fliplet.RecordContainer.getAll()`

```js
Fliplet.RecordContainer.getAll(filter)
```
Return **all** Record Container instances, optionally filtered.

**Parameters**

- **filter** `String|Object` (optional) — if omitted, returns **all** instances.

**Returns**

- `Promise<RecordContainer[]>` — array of instances.

**Example**
```js
Fliplet.RecordContainer.getAll({ name: 'UserRecord' }).then(all => {
  console.log('Count', all.length);
});
```

---

### Record Container instance API (returned by `.get()` / `.getAll()`)

- **id** `Number` — Instance id.
- **name** `String` — Instance name.
- **parent** `DynamicContainer` — Parent Dynamic Container instance. Use `parent.connection()` to access the Data Source.
- **entry** `Object|undefined` — The currently loaded data entry (e.g., `{ id, data, ... }`).
- **dataSourceId** `Number|undefined` — Data Source id (set after init).
- **isLoading** `Boolean` — Loading state.
- **error** `Any|undefined` — Last load error (if any).

### Methods

#### `recordContainer.showLoading()`
```js
recordContainer.showLoading()
```
Set loading state and re-render.

#### `recordContainer.hideLoading()`
```js
recordContainer.hideLoading()
```
Unset loading state and re-render.

#### `recordContainer.hasPendingUpdates()`
```js
recordContainer.hasPendingUpdates()
```
Returns `true` if there are updates queued (`updated` / `deleted`).

#### `recordContainer.applyUpdates()`
```js
recordContainer.applyUpdates()
```
Applies queued updates to the current `entry`, clears the queue, and re-renders.
If the current entry was deleted, it unsubscribes and navigates **back** (when available).

#### `recordContainer.retrieveEntryData(connection, dataSourceEntryId?)`
```js
recordContainer.retrieveEntryData(connection, dataSourceEntryId)
```
Populate `recordContainer.entry` from the Data Source.
- Runs the `recordContainerBeforeRetrieveData` hook first.
- Falls back to `.findById(id)` when an id is available.
- In test mode, loads the first entry.

#### `recordContainer.render()`
```js
recordContainer.render() -> void
```
Re-renders the UI from current state (`entry`, `isLoading`, `error`).

---

### Hooks

- **`recordContainerBeforeRetrieveData`** — Modify the query used to fetch the entry.
- **`recordContainerDataRetrieved`** — Fired after the entry is loaded.
- **`recordContainerDataRetrieveError`** — Fired if fetching fails.

**Example**
```js
Fliplet.Hooks.on('recordContainerBeforeRetrieveData', recordContainer => {
  return { where: { 'data.Status': 'Published' } };
});
```

---

### Practical examples

### 1) Load a specific entry id
```js
Fliplet.RecordContainer.get().then(async recordContainer => {
  const conn = await recordContainer.parent.connection();
  await recordContainer.retrieveEntryData(conn, 123456);
  recordContainer.render();
});
```

### 2) Subscribe to live updates for the current entry
```js
Fliplet.RecordContainer.get('UserRecord').then(async recordContainer => {
  const conn = await recordContainer.parent.connection();
  recordContainer.setupDataSubscription(conn);
});
```

### 3) Handle pending updates (manual refresh UX)
```js
Fliplet.RecordContainer.get().then(recordContainer => {
  if (recordContainer.hasPendingUpdates()) {
    recordContainer.applyUpdates();
  }
});
```

### 4) Access the parent Data Source to perform DS-level operations
```js
Fliplet.RecordContainer.get().then(async recordContainer => {
  const conn = await recordContainer.parent.connection();
  const recent = await conn.find({
    order: [['createdAt', 'desc']],
    limit: 5
  });
  console.log(recent);
});
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="views.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Views</h4>
      <p>Learn more about how to add rich-content views to your helper.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>
