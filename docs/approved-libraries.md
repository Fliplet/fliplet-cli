## Approved Libraries

### Purpose and Importance

Fliplet includes several pre-approved JavaScript libraries that are optimized for the platform and guaranteed to work across all supported devices and browsers. Using these libraries ensures compatibility, reduces app size, and provides consistent functionality across different environments.

> **Important:** Only use approved libraries to ensure compatibility and optimal performance. Custom libraries may cause conflicts or performance issues.

### When to Use This Section

Reference this section when:
- Adding external functionality to your app
- Choosing between different library options
- Ensuring compatibility across devices
- Optimizing app performance
- Looking for alternatives to custom implementations

### Available Libraries

#### Moment.js - Date and Time Manipulation
**Purpose:** Comprehensive date and time handling  
**Use for:** Date formatting, time calculations, timezone handling, relative time display  
**Documentation:** [momentjs.com](https://momentjs.com/)

```js
// Common Moment.js patterns in Fliplet
const formatUserDate = (dateString) => {
  return moment(dateString).format('MMMM Do YYYY, h:mm:ss a');
};

const getRelativeTime = (dateString) => {
  return moment(dateString).fromNow(); // "2 hours ago"
};

const isWithinBusinessHours = () => {
  const now = moment();
  const hour = now.hour();
  return hour >= 9 && hour < 17; // 9 AM to 5 PM
};

// Timezone handling
const convertToUserTimezone = (utcDate, timezone) => {
  return moment.utc(utcDate).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
};
```

#### Lodash - Utility Functions
**Purpose:** Utility functions for JavaScript data manipulation  
**Use for:** Array/object manipulation, data transformation, utility functions  
**Documentation:** [lodash.com](https://lodash.com/)

```js
// Common Lodash patterns in Fliplet
const processUserData = (users) => {
  // Group users by department
  const byDepartment = _.groupBy(users, 'Department');
  
  // Get unique departments
  const departments = _.uniq(_.map(users, 'Department'));
  
  // Find user by email
  const findUser = (email) => _.find(users, { Email: email });
  
  // Sort users by name
  const sortedUsers = _.sortBy(users, 'Name');
  
  return { byDepartment, departments, findUser, sortedUsers };
};

// Deep clone objects safely
const cloneUserPreferences = (preferences) => {
  return _.cloneDeep(preferences);
};

// Debounce search function
const debouncedSearch = _.debounce(async (query) => {
  const connection = await Fliplet.DataSources.connectByName("Users");
  return connection.find({
    where: { Name: { $iLike: `%${query}%` } }
  });
}, 300);
```

#### jQuery - DOM Manipulation (Legacy Support)
**Purpose:** DOM manipulation and AJAX operations  
**Use for:** Legacy component compatibility, simple DOM operations  
**Note:** Modern JavaScript is preferred for new development  
**Documentation:** [jquery.com](https://jquery.com/)

```js
// jQuery patterns for legacy compatibility
const setupLegacyComponent = () => {
  // Event handling
  $('#user-form').on('submit', function(e) {
    e.preventDefault();
    const formData = $(this).serialize();
    submitUserData(formData);
  });
  
  // DOM manipulation
  $('.loading-spinner').show();
  $('#user-list').empty();
  
  // AJAX (prefer Fliplet APIs when possible)
  $.ajax({
    url: '/api/legacy-endpoint',
    method: 'GET',
    success: function(data) {
      displayLegacyData(data);
    }
  });
};

// Migration from jQuery to modern JavaScript
// jQuery: $('#element').addClass('active');
// Modern: document.getElementById('element').classList.add('active');
```

### Library Usage Guidelines

#### Best Practices

1. **Use Sparingly** - Only include libraries when necessary
2. **Prefer Native APIs** - Use Fliplet APIs over external libraries when possible
3. **Check Compatibility** - Ensure libraries work in both Studio and App environments
4. **Optimize Performance** - Import only needed functions from large libraries

#### Performance Considerations

```js
// Good: Import specific functions
const { groupBy, sortBy, uniq } = _;
const users = sortBy(groupBy(data, 'department'), 'name');

// Avoid: Using entire library for simple operations
// Instead of: _.map(array, item => item.name)
// Use: array.map(item => item.name)

// Good: Use Fliplet APIs when available
const formatDate = (date) => {
  // Use Moment.js for complex formatting
  return moment(date).format('MMMM Do YYYY');
};

// Better: Use native APIs for simple operations
const formatSimpleDate = (date) => {
  return new Date(date).toLocaleDateString();
};
```

#### Library Alternatives

| Need | Approved Library | Native Alternative |
|------|------------------|-------------------|
| Date formatting | Moment.js | `Intl.DateTimeFormat` |
| Array manipulation | Lodash | Native array methods |
| DOM manipulation | jQuery | Native DOM APIs |
| HTTP requests | jQuery.ajax | `fetch()` or Fliplet APIs |
| String manipulation | Lodash | Native string methods |

### Custom Library Integration

If you need functionality not provided by approved libraries:

```js
// 1. Check if Fliplet provides the functionality
const useFlipletFirst = async () => {
  // Prefer Fliplet APIs
  const data = await Fliplet.DataSources.connectByName("MyData");
  const files = await Fliplet.Media.Files.get();
  const user = await Fliplet.User.getCachedSession();
};

// 2. Use approved libraries
const useApprovedLibraries = () => {
  const formattedDate = moment().format('YYYY-MM-DD');
  const groupedData = _.groupBy(data, 'category');
};

// 3. Implement custom functionality only if necessary
const customUtility = (data) => {
  // Custom implementation as last resort
  return data.reduce((acc, item) => {
    // Custom logic here
    return acc;
  }, {});
};
```