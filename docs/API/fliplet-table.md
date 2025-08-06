# `Fliplet.UI.Table`

Fliplet.UI.Table is a powerful and flexible table component that provides features like sorting, searching, pagination, row selection, expandable rows, and custom rendering capabilities.

## Install

Add the `fliplet-table` dependency to your screen or app libraries.

## Basic Usage

```javascript
const table = new Fliplet.UI.Table({
  target: '#table-container',
  columns: [
    { name: 'ID', field: 'id' },
    { name: 'Name', field: 'name' }
  ],
  data: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]
});
```

## Configuration Options

### Main Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | String \| Element | Required | CSS selector or DOM element where the table will be rendered |
| `className` | String | `''` | Additional CSS class name(s) to add to the table |
| `columns` | Array | Required | Array of column definitions |
| `data` | Array | `[]` | Array of data objects to display in the table |
| `searchable` | Boolean | `false` | Enable global search functionality |
| `pagination` | Object \| Boolean | `false` | Enable and configure pagination. Set to `false` to disable pagination entirely |
| `selection` | Object | `undefined` | Enable and configure row selection |
| `expandable` | Object | `undefined` | Enable and configure expandable rows |

### Column Definition

Each column in the `columns` array can have the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | String | Required | Display name of the column |
| `field` | String | Required | Field name in the data object |
| `sortable` | Boolean | `false` | Enable sorting for this column |
| `searchable` | Boolean | `false` | Include this column in global search |
| `render` | Function | `undefined` | Custom render function for cell content |
| `sortFn` | Function | `undefined` | Custom sort function for this column |
| `isExpandTrigger` | Boolean | `false` | Make this column trigger row expansion when clicked |

### Row Data Properties

The library recognizes special properties in row data objects that control their behavior and appearance:

| Property | Type | Description |
|----------|------|-------------|
| `_selected` | Boolean | When set to `true`, the row will be automatically selected when the table is initialized |
| `_partiallySelected` | Boolean | When set to `true`, the row will be marked as partially selected (shows a blue minus-square icon instead of a checkbox) |

#### Example

```javascript
const data = [
  {
    id: 1,
    name: 'Documents',
    type: 'folder',
    _selected: true // This row will be selected initially
  },
  {
    id: 2,
    name: 'Projects',
    type: 'folder',
    _partiallySelected: true // This row will show as partially selected
  },
  {
    id: 3,
    name: 'file.txt',
    type: 'file'
    // This row will be unselected
  }
];

const table = new Fliplet.UI.Table({
  target: '#table',
  selection: { enabled: true, multiple: true },
  columns: [
    { name: 'Name', field: 'name' },
    { name: 'Type', field: 'type' }
  ],
  data: data
});
```

**Note**: These properties work alongside the `initialSelection` and `initialPartialSelection` configuration options. You can use either approach or combine both for maximum flexibility.

### Selection Options

```javascript
{
  selection: {
    enabled: true,         // Enable row selection
    multiple: true,        // Allow multiple row selection
    rowClickEnabled: true, // Enable row click selection
    initialSelection: [],  // Array of row IDs or row objects to select initially
    initialPartialSelection: [], // Array of row IDs or row objects to mark as partially selected initially
    // Optional validation before selection
    onBeforeSelect: function(rowData) {
      // Return true/false or a Promise that resolves to true/false
      return true; // or return Promise.resolve(true);
    }
  }
}
```

#### Selection Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | Boolean | `false` | Enable row selection functionality |
| `multiple` | Boolean | `false` | Allow multiple row selection |
| `rowClickEnabled` | Boolean | `false` | Enable row click to toggle selection (in addition to checkbox) |
| `initialSelection` | Array | `[]` | Array of row IDs or row objects to select initially |
| `initialPartialSelection` | Array | `[]` | Array of row IDs or row objects to mark as partially selected initially |
| `onBeforeSelect` | Function | `undefined` | Optional validation function called before selection. Return `true`/`false` or a Promise that resolves to `true`/`false` |

### Pagination Options

```javascript
{
  pagination: {
    pageSize: 10  // Number of rows per page
  }
}
```

#### Pagination Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pageSize` | Number | `10` | Number of rows to display per page |

**Note**: Set `pagination: false` to disable pagination entirely.

### Expandable Rows Options

```javascript
{
  expandable: {
    enabled: true,       // Enable expandable rows
    onBeforeExpand: function(rowData) { // Optional validation before expansion
      // Return true/false or a Promise that resolves to true/false
      return true; // or return Promise.resolve(true);
    },
    onExpand: function(rowData) { // Content provider function
      // Return HTML string, DOM element, or Promise that resolves to either
      return '<div>Details for ' + rowData.name + '</div>';
    }
  }
}
```

#### Expandable Row Configuration

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | Boolean | Enable expandable rows functionality |
| `onBeforeExpand` | Function | Optional validation function called before row expansion. Return `true`/`false` or a Promise that resolves to `true`/`false` |
| `onExpand` | Function | Required content provider function. Return HTML string, DOM element, or Promise that resolves to either |

#### Expansion Triggers

There are multiple ways to trigger row expansion:

1. **Column-level triggers**: Set `isExpandTrigger: true` on any column to make the entire column clickable for expansion
2. **Custom element triggers**: Add `data-expand` attribute to any element within a cell's custom render function to make that specific element trigger expansion

```javascript
// Example: Custom expand triggers using data-expand attribute
{
  name: 'Actions',
  render: function(rowData) {
    return '<button data-expand class="btn btn-primary">View Details</button>';
  }
}
```

**Note**: Elements with the `data-expand` attribute will automatically trigger row expansion when clicked, regardless of which column they appear in.

## Events

Fliplet.UI.Table emits various events that you can listen to:

| Event | Detail | Description |
|-------|--------|-------------|
| `selection:change` | `{ selected: Array, deselected: Array, source: String }` | Fired when row selection changes. Source can be 'row-click', 'checkbox', or 'api' |
| `row:click` | `{ data: Object }` | Fired when a row is clicked |
| `sort:change` | `{ field: String, direction: String }` | Fired when sort column/direction changes |
| `search` | `{ query: String, data: Array }` | Fired when search query changes |
| `page:change` | `{ page: Number }` | Fired when current page changes |
| `expand:start` | `{ row: Object, rowEl: Element }` | Fired when row expansion starts (before content is loaded) |
| `expand:complete` | `{ row: Object, rowEl: Element, contentEl: Element }` | Fired when row expansion completes successfully |
| `expand:error` | `{ row: Object, rowEl: Element, error: Error }` | Fired when row expansion fails |
| `collapse:complete` | `{ row: Object, rowEl: Element }` | Fired when row is collapsed |
| `cell:interaction` | `{ row: Object, column: Object, event: Event, target: Element, action: String }` | Fired when a custom expand trigger is clicked |

### Event Handling

```javascript
table.on('selection:change', function(detail) {
  console.log('Selected rows:', detail.selected);
  console.log('Deselected rows:', detail.deselected);
  console.log('Selection source:', detail.source);
});
```

## API Methods

### Selection Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `getSelectedRows()` | None | Returns array of selected row data |
| `selectRow(rowData)` | Row data object | Selects a specific row. Can be a complete row data object or a partial object for matching. If multiple rows match, the first one is selected. |
| `deselectRow(rowData)` | Row data object | Deselects a specific row. Can be a complete row data object or a partial object for matching. |
| `selectAll()` | None | Selects all rows |
| `deselectAll([options])` | `options.silent`: Boolean | Deselects all rows. If `silent` is true, no event is fired |
| `selectCurrentPage()` | None | Selects all rows on the current page (when pagination is enabled) |
| `deselectCurrentPage()` | None | Deselects all rows on the current page (when pagination is enabled) |
| `setRowPartialSelection(rowData, isPartial)` | Row data object, Boolean | Sets or removes partial selection state for a specific row |
| `isRowPartiallySelected(rowData)` | Row data object | Returns true if the row is in partial selection state |
| `clearAllPartialSelection()` | None | Removes partial selection state from all rows |

### Expandable Row Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `expandRow(rowData)` | Row data object | Expands a specific row |
| `collapseRow(rowData)` | Row data object | Collapses a specific row |
| `isRowExpanded(rowData)` | Row data object | Returns true if the row is currently expanded |
| `isRowExpanding(rowData)` | Row data object | Returns true if the row is currently being expanded (async operation in progress) |

#### Example of selecting a row with partial data

```javascript
// This will find the first row with id === 1 and select it
table.selectRow({ id: 1 });

// You can also use multiple properties
table.selectRow({ name: 'Apple', type: 'Fruit' });
```

### Data Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `getData()` | None | Returns current table data |
| `destroy()` | None | Destroys the table instance and cleanup |

### Event Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `on(eventName, handler)` | `eventName`: String, `handler`: Function | Adds an event listener |
| `off(eventName, handler)` | `eventName`: String, `handler`: Function | Removes an event listener |

## Custom Rendering

You can customize cell rendering using the `render` function in column definition:

```javascript
{
  name: 'Status',
  field: 'status',
  render: function(data) {
    return '<span class="badge ' + data.status + '">' + data.status + '</span>';
  }
}
```

## Custom Sorting

Define custom sort logic using the `sortFn` in column definition:

```javascript
{
  name: 'Name',
  field: 'name',
  sortable: true,
  sortFn: function(a, b, direction) {
    var aLen = a.name.length;
    var bLen = b.name.length;
    return direction === 'asc' ? aLen - bLen : bLen - aLen;
  }
}
```

## Complete Example

```javascript
const table = new Fliplet.UI.Table({
  target: '#table-container',
  className: 'my-table',
  searchable: true,
  pagination: {
    pageSize: 4
  },
  selection: {
    enabled: true,
    multiple: true,
    rowClickEnabled: true,
    initialSelection: [1, 2],
    onBeforeSelect: function(rowData) {
      // Example validation
      return rowData.isSelectable;
    }
  },
  columns: [
    {
      name: '',
      field: 'expand',
      isExpandTrigger: true,
      width: '30px'
    },
    {
      name: 'Name',
      field: 'name',
      sortable: true,
      searchable: true
    },
    {
      name: 'Type',
      field: 'type',
      sortable: true,
      render: function(data) {
        return '<span class="type-badge">' + data.type + '</span>';
      }
    },
    {
      name: 'Price',
      field: 'price',
      sortable: true,
      render: function(data) {
        return '$' + data.price.toFixed(2);
      }
    }
  ],
  expandable: {
    enabled: true,
    onExpand: function(rowData) {
      return '<div style="padding: 10px; background: #f0f8ff;">' +
             '<h4>Details for ' + rowData.name + '</h4>' +
             '<p>Type: ' + rowData.type + '</p>' +
             '<p>Price: $' + rowData.price + '</p>' +
             '</div>';
    }
  },
  data: [
    { id: 1, name: 'Item 1', type: 'Type A', price: 10.99, isSelectable: true },
    { id: 2, name: 'Item 2', type: 'Type B', price: 20.50, isSelectable: false }
  ]
});

// Event handling
table.on('selection:change', function(detail) {
  console.log('Selection changed:', detail.selected);
  console.log('Deselected:', detail.deselected);
  console.log('Source:', detail.source);
});

table.on('sort:change', function(detail) {
  console.log('Sort changed:', detail.field, detail.direction);
});

table.on('search', function(detail) {
  console.log('Search query:', detail.query);
  console.log('Filtered data:', detail.data);
});

table.on('expand:complete', function(detail) {
  console.log('Row expanded:', detail.row.name);
  console.log('Expanded content element:', detail.contentEl);
});
```

## Expandable Rows

Fliplet.UI.Table supports expandable rows that can display additional content when expansion triggers are clicked. This feature supports both synchronous and asynchronous content loading, with built-in race condition prevention for rapid clicking scenarios.

### Basic Expandable Rows

Fliplet.UI.Table supports two approaches for expandable rows:

#### 1. Dedicated Trigger Column
```javascript
const table = new Fliplet.UI.Table({
  target: '#table',
  columns: [
    { name: '', field: 'expand', isExpandTrigger: true, width: '40px' },
    { name: 'Name', field: 'name' },
    { name: 'Email', field: 'email' }
  ],
  data: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  expandable: {
    enabled: true,
    onExpand: function(rowData) {
      return '<div class="user-details">' +
             '<h4>Details for ' + rowData.name + '</h4>' +
             '<p>Email: ' + rowData.email + '</p>' +
             '<p>ID: ' + rowData.id + '</p>' +
             '</div>';
    }
  }
});
```

#### 2. Custom Triggers Within Any Cell
```javascript
const table = new Fliplet.UI.Table({
  target: '#table',
  columns: [
    {
      name: 'Name',
      field: 'name',
      render: function(rowData) {
        // Any element with data-expand attribute becomes a trigger
        return rowData.name + ' <span data-expand style="cursor: pointer; color: #007bff;">▶️</span>';
      }
    },
    { name: 'Email', field: 'email' },
    {
      name: 'Actions',
      render: function(rowData) {
        return '<button data-expand class="details-btn">View Details</button>';
      }
    }
  ],
  data: [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ],
  expandable: {
    enabled: true,
    onExpand: function(rowData) {
      return '<div class="user-details">' +
             '<h4>Details for ' + rowData.name + '</h4>' +
             '<p>Email: ' + rowData.email + '</p>' +
             '<p>ID: ' + rowData.id + '</p>' +
             '</div>';
    }
  }
});
```

### Async Content Loading

```javascript
const table = new Fliplet.UI.Table({
  // ... other config
  expandable: {
    enabled: true,
    onExpand: function(rowData) {
      return new Promise((resolve, reject) => {
        // Simulate API call
        setTimeout(() => {
          if (rowData.id === 999) {
            reject(new Error('User details not found'));
          } else {
            const details = '<div>Async loaded details for ' + rowData.name + '</div>';
            resolve(details);
          }
        }, 1000);
      });
    }
  }
});
```

### Preventing Expansion

```javascript
const table = new Fliplet.UI.Table({
  // ... other config
  expandable: {
    enabled: true,
    onBeforeExpand: function(rowData) {
      // Prevent expansion for inactive users
      return rowData.status === 'active';
    },
    onExpand: function(rowData) {
      return generateUserDetails(rowData);
    }
  }
});
```

### Expandable Row Events

```javascript
// Listen for expansion lifecycle events
table.on('expand:start', function(detail) {
  console.log('Started expanding:', detail.row.name);
  // You can show loading indicators here
});

table.on('expand:complete', function(detail) {
  console.log('Expansion completed:', detail.row.name);
  console.log('Content element:', detail.contentEl);
  // Initialize any interactive elements in the expanded content
});

table.on('expand:error', function(detail) {
  console.log('Expansion failed:', detail.row.name, detail.error.message);
  // Handle error state
});

table.on('collapse:complete', function(detail) {
  console.log('Row collapsed:', detail.row.name);
});

// Listen for custom trigger interactions
table.on('cell:interaction', function(detail) {
  console.log('Custom trigger clicked:', detail.target);
  console.log('Row data:', detail.row);
  console.log('Column:', detail.column.name);
  console.log('Action:', detail.action); // 'expand'
});
```

### Programmatic Control

```javascript
// Expand a specific row
table.expandRow(rowData);

// Collapse a specific row
table.collapseRow(rowData);

// Check if a row is expanded
if (table.isRowExpanded(rowData)) {
  console.log('Row is currently expanded');
}

// Check if a row is being expanded (useful for showing loading states)
if (table.isRowExpanding(rowData)) {
  console.log('Row is currently being expanded');
}
```

### Nested Tables

Fliplet.UI.Table supports creating tables within expanded rows, perfect for hierarchical data displays with multi-level selection:

```javascript
const departmentTable = new Fliplet.UI.Table({
  target: '#departments',
  selection: { enabled: true, multiple: true }, // Enable department selection
  columns: [
    { name: 'Department', field: 'name' },
    { name: 'Manager', field: 'manager' },
    { name: 'Employee Count', field: 'count' }
  ],
  expandable: {
    enabled: true,
    onExpand: function(dept) {
      // Create a container for the nested table
      const container = document.createElement('div');
      container.innerHTML = '<div id="employees-' + dept.id + '"></div>';

      // Load employee data asynchronously
      loadEmployees(dept.id).then(employees => {
        // Create nested table with its own selection
        const employeeTable = new Fliplet.UI.Table({
          target: '#employees-' + dept.id,
          selection: { enabled: true, multiple: true },
          columns: [
            { name: 'Name', field: 'name', sortable: true },
            { name: 'Position', field: 'position', sortable: true },
            { name: 'Email', field: 'email' }
          ],
          data: employees
        });
      });

      return container;
    }
  },
  data: departments
});

// Get selections at both levels
const selectedDepartments = departmentTable.getSelectedRows();
// Track nested table instances to get their selections
```

Key features:
- **Multi-level selection**: Select items at parent and child levels independently
- **Async data loading**: Load nested data on-demand
- **Independent state**: Each table maintains its own selection, sort, and pagination state

## Partial Selection UI

Fliplet.UI.Table provides a sophisticated partial selection UI for multiple row selection scenarios. Instead of using traditional HTML checkboxes, the component uses FontAwesome icons to display three distinct states in the header select-all checkbox.

### Selection States

The select-all checkbox in the header shows three different visual states:

- **Empty (fa-square-o)**: No rows are selected - displayed in gray
- **Partial (fa-minus-square)**: Some but not all visible rows are selected - displayed in blue
- **Full (fa-check-square)**: All visible rows are selected - displayed in blue

### Visual Indicators

```css
/* CSS classes for different states */
.fl-table-select-all-checkbox {
  font-size: 16px;
  color: #007bff;
  transition: color 0.2s ease;
}

.fl-table-header-checkbox-partial {
  color: #007bff !important; /* Blue for partial state */
}
```

### How It Works

The partial selection UI automatically updates based on the current selection state:

1. **With Pagination**: The header checkbox reflects only the selection state of rows visible on the current page
2. **With Search**: The header checkbox reflects only the selection state of filtered/visible rows
3. **Dynamic Updates**: The state changes immediately when rows are selected or deselected

### Example Implementation

```javascript
const table = new Fliplet.UI.Table({
  target: '#table',
  selection: {
    enabled: true,
    multiple: true
  },
  pagination: {
    pageSize: 10
  },
  columns: [
    { name: 'Name', field: 'name' },
    { name: 'Department', field: 'department' }
  ],
  data: userData
});

// Listen for selection changes to handle custom UI updates
table.on('selection:change', function(detail) {
  console.log('Selection changed:', detail.selected.length, 'rows selected');
});
```

### Behavior with Pagination and Search

- **Pagination**: When navigating between pages, the header checkbox shows the state for the current page only
- **Search**: When filtering data, the header checkbox shows the state for visible/filtered rows only
- **Cross-page Selection**: You can select rows across different pages, and the header checkbox will reflect the current page state

### Custom Partial Selection for Individual Rows

For file manager scenarios where a file or folder might have some of its content selected (but not all), Fliplet.UI.Table supports setting individual rows to a partial selection state. This is particularly useful for hierarchical data where a folder might contain both selected and unselected items.

#### API Methods for Custom Partial Selection

```javascript
// Set a row to partial selection state
table.setRowPartialSelection(rowData, true);

// Remove partial selection state from a row
table.setRowPartialSelection(rowData, false);

// Check if a row is in partial selection state
const isPartial = table.isRowPartiallySelected(rowData);

// Clear all partial selection states
table.clearAllPartialSelection();
```

#### Example Usage

```javascript
const table = new Fliplet.UI.Table({
  target: '#file-manager-table',
  selection: { enabled: true, multiple: true },
  columns: [
    { name: 'Name', field: 'name' },
    { name: 'Type', field: 'type' },
    { name: 'Size', field: 'size' }
  ],
  data: fileData
});

// Mark a folder as partially selected when some of its contents are selected
table.setRowPartialSelection({ name: 'Documents', type: 'folder' }, true);

// Listen for selection changes
table.on('selection:change', function(detail) {
  // Update parent folders' partial selection state based on child selection
  updateFolderStates();
});
```

#### Visual Behavior

- **Partial rows**: Display a blue minus-square icon (fa-minus-square) instead of a checkbox
- **Header checkbox**: Shows partial state (blue minus-square) when any partial selections exist on the current page
- **Click behavior**: Follows standard UI conventions:
  - **Individual row**: Partial → Selected → Unselected → Selected (cycles)
  - **Select-all**: Empty → Partial (when some selected) → All Selected → Empty (cycles)

### Initializing Selection States

There are three convenient ways to initialize selection states when creating a table:

#### 1. Configuration-based Initialization

```javascript
const table = new Fliplet.UI.Table({
  target: '#table',
  selection: {
    enabled: true,
    multiple: true,
    // Pre-select specific rows
    initialSelection: [
      { id: 1 }, // Select by partial object match
      { name: 'Documents', type: 'folder' }, // Select by multiple fields
      5 // Select by ID (assumes row has id: 5)
    ],
    // Mark specific rows as partially selected
    initialPartialSelection: [
      { name: 'Projects', type: 'folder' },
      { id: 3 }
    ]
  },
  columns: [...],
  data: fileData
});
```

#### 2. Data-driven Initialization

```javascript
const fileData = [
  {
    id: 1,
    name: 'Documents',
    type: 'folder',
    _selected: true // This row will be selected
  },
  {
    id: 2,
    name: 'Projects',
    type: 'folder',
    _partiallySelected: true // This row will show as partially selected
  },
  {
    id: 3,
    name: 'file.txt',
    type: 'file'
    // This row will be unselected
  }
];

const table = new Fliplet.UI.Table({
  target: '#table',
  selection: { enabled: true, multiple: true },
  columns: [...],
  data: fileData
});
```

#### 3. Hybrid Approach

```javascript
// Combine both approaches for maximum flexibility
const table = new Fliplet.UI.Table({
  target: '#table',
  selection: {
    enabled: true,
    multiple: true,
    initialSelection: [{ id: 1 }], // Select Documents folder
    initialPartialSelection: [{ id: 2 }] // Mark Projects as partial
  },
  columns: [...],
  data: [
    { id: 1, name: 'Documents', type: 'folder' },
    { id: 2, name: 'Projects', type: 'folder' },
    { id: 3, name: 'file.txt', type: 'file', _selected: true }, // Also selected
    { id: 4, name: 'image.jpg', type: 'file', _partiallySelected: true } // Also partial
  ]
});
```

#### File Manager Example

Perfect for file/folder hierarchies where selection states need to be preserved:

```javascript
const fileManagerData = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    size: '1.2 GB',
    _partiallySelected: true // Some files inside are selected
  },
  {
    id: 'folder-2',
    name: 'Images',
    type: 'folder',
    size: '850 MB',
    _selected: true // All files inside are selected
  },
  {
    id: 'file-1',
    name: 'report.pdf',
    type: 'file',
    size: '2.3 MB'
    // Not selected
  }
];

const fileManager = new Fliplet.UI.Table({
  target: '#file-manager',
  selection: { enabled: true, multiple: true },
  columns: [
    { name: 'Name', field: 'name' },
    { name: 'Type', field: 'type' },
    { name: 'Size', field: 'size' }
  ],
  data: fileManagerData
});

// All selection states are automatically applied on initialization!
```

## CSS Customization

Fliplet.UI.Table provides several CSS classes for styling:

| Class | Description |
|-------|-------------|
| `.fl-table` | Main table container |
| `.fl-table-header` | Table header row |
| `.fl-table-row` | Table data row |
| `.fl-table-selected` | Selected row |
| `.fl-table-sortable` | Sortable column header |
| `.fl-table-sorted-asc` | Column sorted in ascending order |
| `.fl-table-sorted-desc` | Column sorted in descending order |
| `.fl-table-search` | Search input container |
| `.fl-table-pagination` | Pagination container |
| `.fl-table-cell` | Table cell |
| `.fl-table-checkbox` | Checkbox cell for selection |
| `.fl-table-select-all-checkbox` | Header select-all checkbox (FontAwesome icon) |
| `.fl-table-header-checkbox-partial` | Partial selection state styling for header checkbox |
| `.fl-table-header-checkbox-selected` | Selected state styling for header checkbox |
| `.fl-table-row-checkbox-partial` | Partial selection state styling for individual row checkboxes |
| `.fl-table-expand-trigger` | Cell that triggers row expansion |
| `.fl-table-row-expanded` | Container for expanded row content |

### Default Styling

The component comes with a default theme that includes:

- Clean, modern appearance
- Hover effects on rows
- Light blue background for selected rows
- Subtle borders and spacing
- Responsive layout with flexbox
- Sort direction indicators
- Styled checkboxes for selection
- Pagination controls

You can override these styles by targeting the CSS classes in your own stylesheet.
