# Fliplet Documentation and Coding Standards

This document outlines the coding standards and documentation guidelines for Fliplet development, ensuring consistency across all APIs, components, and examples. These standards help developers write maintainable code and create documentation that both humans and AI systems can easily understand and implement.

## Table of Contents

1. [Documentation Standards](#documentation-standards)
2. [Development Environment Guidelines](#development-environment-guidelines)
3. [JavaScript Coding Standards](javascript-coding-standards.md)
   - 3.1. [Modern JavaScript (ES6+) - Recommended](javascript-coding-standards.md#modern-javascript-es6---recommended)
   - 3.2. [Legacy JavaScript (ES5) - Compatibility](javascript-coding-standards.md#legacy-javascript-es5---compatibility)
4. [Fliplet API Patterns](code-api-patterns.md)
   - 4.1. [API Categories Overview](code-api-patterns.md#api-categories-overview)
   - 4.2. [Connection and Initialization Patterns](code-api-patterns.md#connection-and-initialization-patterns)
   - 4.3. [CRUD Operation Patterns](code-api-patterns.md#crud-operation-patterns-for-all-apis)
   - 4.4. [Navigation Patterns](code-api-patterns.md#navigation-patterns)
   - 4.5. [Communication Patterns](code-api-patterns.md#communication-patterns)
5. [Quick Reference Guide](#quick-reference-guide)
6. [Code Examples and Testing](#code-examples-and-testing)
   - 6.1. [Complete Example Requirements](#complete-example-requirements)
   - 6.2. [Asset Provision Standards](#asset-provision-standards)
   - 6.3. [Test Templates and Setup](#test-templates-and-setup)
7. [Approved Libraries](approved-libraries.md)
   - 7.1. [Available Libraries](approved-libraries.md#available-libraries)
   - 7.2. [Library Usage Guidelines](approved-libraries.md#library-usage-guidelines)
   - 7.3. [Performance Considerations](approved-libraries.md#performance-considerations)
   - 7.4. [Custom Library Integration](approved-libraries.md#custom-library-integration)


## Documentation Standards

### Purpose and Importance

Documentation standards ensure that all Fliplet APIs are documented consistently, making it easier for developers to understand, implement, and maintain code. Good documentation serves multiple audiences: human developers learning the platform, experienced developers looking for quick reference, and AI systems that need to understand API functionality.

These standards prioritize **immediate usability** - every example should work when copied directly into an app, and every API should be clearly explained with its specific use cases.

### When to Use This Section

Use these documentation standards when:
- Writing API documentation for any Fliplet namespace
- Creating examples for components or helpers
- Documenting new features or updates
- Reviewing existing documentation for consistency

### Structure Requirements

All Fliplet API documentation must include:

1. **Clear Purpose Statement** - What the API does and when to use it
2. **Syntax Documentation** - Exact method signatures with parameter types
3. **Return Value Information** - What the method returns and in what format
4. **Complete Examples** - Working code that can be copied and tested immediately
5. **Required Assets** - Any files, data sources, or setup needed for examples
6. **Error Handling** - Common errors and how to handle them
7. **Environment Notes** - Differences between Studio and deployed app behavior

> **See also:** [Code Examples and Testing](#code-examples-and-testing) for detailed example requirements

### Standard Documentation Template

```markdown
### API Method Name

**Purpose:** Brief description of what this API method does  
**Syntax:** `Fliplet.Namespace.methodName(param1, param2, options?)`  
**Returns:** `Promise<ReturnType>` or `ReturnType`  
**When to use:** Specific scenarios where this method is appropriate  
**Environment:** Studio ✓ | App ✓ (or note restrictions)

#### Required Setup
- Data source: "ExampleData" with columns: Name, Email, Status
- Media folder: "TestAssets" 
- Screen: "TestScreen" (if navigation examples)

#### Complete Example
```js
// Complete example with all setup and error handling
const demonstrateMethod = async () => {
  try {
    // 1. Setup (if needed)
    const connection = await Fliplet.DataSources.connectByName("ExampleData");
    
    // 2. Main operation
    const result = await Fliplet.Namespace.methodName(param1, param2, {
      option: 'value'
    });
    
    // 3. Handle result
    console.log('Success:', result);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

// Run example
demonstrateMethod().catch(console.error);
```

#### Test Data
```json
// Sample data for "ExampleData" data source
[
  {
    "Name": "John Smith",
    "Email": "john@example.com", 
    "Status": "Active"
  },
  {
    "Name": "Jane Doe",
    "Email": "jane@example.com",
    "Status": "Active"
  }
]
```

**Parameters:**
- `param1` (Type): Description of parameter
- `param2` (Type): Description of parameter  
- `options` (Object, optional): Configuration options

**Options:**
- `option` (String): Description of option

**Common Errors:**
- `404`: Resource not found - Check data source exists
- `403`: Access denied - Verify permissions

**See also:** [Error Handling Patterns](#error-handling-patterns)

# Documentation Principles

1. **Complete & Testable** - Every example must work immediately when copied
2. **Asset Provision** - Provide all required files, data, and setup instructions
3. **Environment Aware** - Note differences between Studio and deployed apps
4. **AI-Optimized** - Structure content for easy parsing by LLMs and AI tools
5. **Progressive Complexity** - Start simple, build to advanced patterns
6. **Real-World Focus** - Examples should reflect actual use cases
7. **Cross-Reference** - Link related methods and concepts
8. **Error Complete** - Include comprehensive error handling

> **Next:** Learn about [Development Environment Guidelines](#development-environment-guidelines)


## Development Environment Guidelines

### Purpose and Importance

Fliplet development happens in two distinct environments: **Fliplet Studio** (for building and configuring components) and **deployed apps** (for end-user functionality). Understanding these environments is crucial because different APIs are available in each context, and code behavior can vary significantly.

> **Key Concept:** Environment-aware development is essential for creating components that work correctly in both Studio configuration and app runtime contexts.

### When to Use This Section

Reference this section when:
- Writing code that needs to work in both Studio and apps
- Creating components that have configuration interfaces
- Building apps with user-facing functionality
- Debugging environment-specific issues
- Choosing appropriate APIs for your use case

> **See also:** [Fliplet API Patterns](#fliplet-api-patterns) for API-specific environment considerations

### Environment Comparison

| Aspect | Studio Environment | App Environment |
|--------|-------------------|-----------------|
| **Purpose** | Component configuration | User functionality |
| **APIs Available** | Widget, Studio, Helper | User, DataSources, Navigate, Device |
| **Context** | Development/Configuration | Runtime/Production |
| **User Type** | Developers/Admins | End Users |

### Fliplet Studio Development

**Environment:** Code running within Fliplet Studio interface

**Purpose:** Studio development is for creating and configuring components, themes, and app structure. This is where developers build the tools that end-users will interact with in the published app.

**When to use Studio APIs:**
- Building component configuration interfaces
- Creating data source selectors
- Setting up screen navigation options
- Configuring app themes and layouts

**Characteristics:**
- Full access to Studio APIs
- Live preview capabilities
- Component configuration interface
- Limited to Studio context

**Example - Studio Component Code:**
```js
// Studio component initialization
Fliplet.Widget.onSaveRequest(() => {
  // Get configuration from UI
  const config = {
    dataSource: $('#select-datasource').val(),
    template: $('#select-template').val(),
    options: {
      showHeader: $('#show-header').is(':checked'),
      itemsPerPage: parseInt($('#items-per-page').val()) || 10
    }
  };
  
  // Save configuration
  Fliplet.Widget.save(config).then(() => {
    console.log('Component configured successfully');
    Fliplet.Widget.complete();
  });
});
```

**Studio-Only APIs:**
- `Fliplet.Widget.*` - Component lifecycle management
- `Fliplet.Studio.*` - Studio interface interactions
- `Fliplet.Helper.*` - Helper development tools

### Deployed App Development

**Environment:** Code running in published Fliplet apps

**Purpose:** App development is for creating end-user functionality - the actual features that users interact with when using your published app. This includes user authentication, data management, navigation, and device features.

**When to use App APIs:**
- User login and authentication
- Reading and writing app data
- Navigating between screens
- Sending notifications
- Accessing device features (camera, GPS, etc.)

**Characteristics:**
- Full runtime API access
- User interaction capabilities
- Data persistence
- Device-specific features

**Example - App Runtime Code:**
```js
// App initialization code
Fliplet.Hooks.on('flAppReady', async () => {
  try {
    // Initialize app features
    await initializeUserSession();
    await loadUserPreferences();
    await setupNotifications();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('App initialization failed:', error);
  }
});

const initializeUserSession = async () => {
  // Check if user is logged in
  const user = await Fliplet.User.getCachedSession();
  
  if (user) {
    console.log('User logged in:', user.email);
    await loadUserData(user.id);
  } else {
    console.log('No user session found');
    // Redirect to login if required
  }
};

// App-specific APIs available:
// - Fliplet.User.*
// - Fliplet.DataSources.*
// - Fliplet.Navigate.*
// - Device APIs (Camera, GPS, etc.)
```

**App-Only APIs:**
- `Fliplet.User.*` - User authentication and management
- `Fliplet.Device.*` - Device-specific functionality
- `Fliplet.Cache.*` - Local data caching
- `Fliplet.Hooks.*` - App lifecycle events

### Environment-Specific Code Examples

> **Note:** These examples demonstrate the key differences between Studio and App development patterns.

#### Data Source Access
```js
// STUDIO: Component configuration
Fliplet.Widget.onSaveRequest(() => {
  const selectedDataSource = $('#datasource-selector').val();
  Fliplet.Widget.save({ dataSourceId: selectedDataSource });
});

// APP: Runtime data access  
const loadAppData = async () => {
  const connection = await Fliplet.DataSources.connectByName("AppData");
  const records = await connection.find();
  return records;
};
```

#### Navigation Handling
```js
// STUDIO: Configure navigation target
const configureNavigation = () => {
  const targetScreen = $('#screen-selector').val();
  return { action: 'screen', page: targetScreen };
};

// APP: Execute navigation
const navigateToScreen = async (screenName) => {
  await Fliplet.Navigate.screen(screenName);
  console.log(`Navigated to ${screenName}`);
};
```

#### User Management
```js
// STUDIO: Not available - user management is app-only

// APP: User authentication
const handleUserLogin = async (email, password) => {
  try {
    const user = await Fliplet.User.login({ email, password });
    console.log('User logged in:', user);
    return user;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};
```

### Environment Detection

```js
// Detect current environment
const detectEnvironment = () => {
  const isStudio = typeof Fliplet.Widget !== 'undefined';
  const isApp = typeof Fliplet.User !== 'undefined';
  
  return {
    isStudio,
    isApp,
    environment: isStudio ? 'studio' : 'app'
  };
};

// Use environment-specific code
const initializeBasedOnEnvironment = async () => {
  const { isStudio, isApp } = detectEnvironment();
  
  if (isStudio) {
    // Studio-specific initialization
    console.log('Running in Studio environment');
    setupComponentConfiguration();
  } else if (isApp) {
    // App-specific initialization
    console.log('Running in App environment');
    await initializeAppFeatures();
  }
};
```

## Quick Reference Guide

### Purpose and Importance

This quick reference provides immediate access to the most commonly used Fliplet patterns, APIs, and code snippets. Use this section for fast lookup during development.

### Common API Patterns

#### Data Sources
```js
// Connect and query
const connection = await Fliplet.DataSources.connectByName("DataSourceName");
const records = await connection.find({ where: { Status: 'Active' }, limit: 50 });

// Insert record
const newRecord = await connection.insert({ Name: 'John', Email: 'john@example.com' });

// Update record
const updated = await connection.update(recordId, { Status: 'Updated' });

// Delete record
await connection.removeById(recordId);
```

#### User Management
```js
// Login
const user = await Fliplet.User.login({ email: 'user@example.com', password: 'password' });

// Get current user
const currentUser = await Fliplet.User.getCachedSession();

// Logout
await Fliplet.User.logout();

// Update profile
const updatedUser = await Fliplet.User.update({ firstName: 'John' });
```

#### Navigation
```js
// Navigate to screen
await Fliplet.Navigate.screen('ScreenName');

// Navigate with data
await Fliplet.Navigate.screen('ScreenName', { userId: 123 });

// Navigate to URL
await Fliplet.Navigate.url('https://example.com');

// Go back
await Fliplet.Navigate.back();
```

#### Media Management
```js
// Get folders
const folders = await Fliplet.Media.Folders.get();

// Upload file
const uploadedFile = await Fliplet.Media.Files.upload({
  folderId: folderId,
  file: fileObject,
  fileName: 'example.jpg'
});

// Get files
const files = await Fliplet.Media.Files.get({ folderId: folderId });
```

#### Communication
```js
// Send email
await Fliplet.Communicate.sendEmail({
  to: [{ email: 'user@example.com', name: 'User Name' }],
  subject: 'Subject',
  html: '<p>Message content</p>'
});

// Create notification
await Fliplet.Notifications.create({
  title: 'Notification Title',
  message: 'Notification message',
  userId: userId
});
```

### Error Handling Patterns

```js
// Basic try-catch
try {
  const result = await someFlipletAPI();
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
}

// With retry logic
const withRetry = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

### Environment Detection

```js
// Detect environment
const isStudio = typeof Fliplet.Widget !== 'undefined';
const isApp = typeof Fliplet.User !== 'undefined';

// Environment-specific code
if (isStudio) {
  // Studio-specific logic
  Fliplet.Widget.onSaveRequest(() => {
    // Component configuration
  });
} else {
  // App-specific logic
  Fliplet.Hooks.on('flAppReady', () => {
    // App initialization
  });
}
```

### Common Utility Functions

```js
// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Format date
const formatDate = (date) => moment(date).format('YYYY-MM-DD');

// Group array by property
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
```

### Performance Optimization

```js
// Efficient queries
const optimizedQuery = await connection.find({
  where: {
    $filters: [
      { column: 'Status', condition: '==', value: 'Active' },
      { column: 'Department', condition: '==', value: 'Engineering' }
    ]
  },
  attributes: ['Name', 'Email'], // Limit returned fields
  limit: 50,
  order: [['Name', 'ASC']]
});

// Pagination
const loadPage = async (page = 0, pageSize = 20) => {
  return connection.find({
    limit: pageSize,
    offset: page * pageSize,
    includePagination: true
  });
};
```

## Code Examples and Testing

### Purpose and Importance

Complete examples and comprehensive testing are the foundation of good documentation and reliable code. They eliminate guesswork, reduce support requests, and enable developers to quickly prototype and test functionality. Every code example should be a working demonstration that developers can immediately run in their apps.

> **Key Principle:** Every example must work immediately when copied - no missing dependencies, no undefined variables, no incomplete setup.

### When to Use This Section

Reference this section when:
- Writing any code example in documentation
- Creating tutorial content
- Building component examples
- Testing API functionality
- Setting up development environments
- Creating reusable code templates

> **See also:** [Documentation Standards](#documentation-standards) for documentation structure requirements


### Complete Example Requirements

Every code example in Fliplet documentation must include:

1. **Full Setup Code** - All initialization and connection code
2. **Error Handling** - Try/catch blocks with meaningful error messages
3. **Console Output** - Logging for debugging and verification
4. **Asset References** - Clear identification of required resources
5. **Usage Instructions** - How to run the example
6. **Expected Results** - What the output should look like
7. **Environment Notes** - Studio vs App compatibility

#### Example Structure Template

```js
// Complete example template
const completeExampleTemplate = async () => {
  try {
    // 1. Environment check
    console.log('Environment:', typeof Fliplet.Widget !== 'undefined' ? 'Studio' : 'App');
    
    // 2. Setup phase
    console.log('Setting up...');
    const connection = await Fliplet.DataSources.connectByName("ExampleData");
    
    // 3. Main operation
    console.log('Performing operation...');
    const result = await connection.find({ limit: 10 });
    
    // 4. Results
    console.log('Operation completed:', result.length, 'records found');
    return result;
    
  } catch (error) {
    // 5. Error handling
    console.error('Example failed:', error.message);
    throw error;
  }
};

// Usage
completeExampleTemplate()
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Failed:', error));
```


### Asset Provision Standards

When examples require assets, provide complete setup instructions and code:

#### Data Sources

```js
// Create test data source programmatically
const createTestDataSource = async () => {
  const dataSource = await Fliplet.DataSources.create({
    name: 'TestUsers',
    columns: ['Name', 'Email', 'Department', 'Status'],
    entries: [
      {
        Name: 'John Smith',
        Email: 'john@company.com',
        Department: 'Engineering',
        Status: 'Active'
      },
      {
        Name: 'Sarah Jones', 
        Email: 'sarah@company.com',
        Department: 'Design',
        Status: 'Active'
      }
    ]
  });
  
  console.log('Test data source created:', dataSource.name);
  return dataSource;
};

// Alternative: Manual setup instructions
const setupDataSourceManually = () => {
  console.log(`
    Manual Data Source Setup:
    1. Go to Data Sources in Fliplet Studio
    2. Create new data source named "TestUsers"
    3. Add columns: Name, Email, Department, Status
    4. Import the provided CSV data
  `);
};
```

#### Media Files

```js
// Provide sample files or creation instructions
const createSampleImage = () => {
  // For testing, create a simple canvas image
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('TEST', 30, 55);
  
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
};

// Usage in examples
const uploadTestImage = async () => {
  const testFile = await createSampleImage();
  const folders = await Fliplet.Media.Folders.get();
  const testFolder = folders.find(f => f.name === 'TestAssets');
  
  return Fliplet.Media.Files.upload({
    folderId: testFolder.id,
    file: testFile,
    fileName: 'test-image.png'
  });
};
```

#### Screen Navigation Setup

```js
// Provide screen setup for navigation examples
const setupTestScreens = () => {
  // Note: In Studio, create screens manually
  const requiredScreens = [
    'Home',      // Main landing screen
    'Profile',   // User profile screen
    'Settings',  // App settings screen
    'Dashboard'  // Data dashboard screen
  ];
  
  console.log('Required screens for navigation examples:');
  requiredScreens.forEach(screen => {
    console.log(`- ${screen}: Create in Fliplet Studio`);
  });
  
  return requiredScreens;
};

// Navigation example with screen validation
const safeNavigateToScreen = async (screenName) => {
  try {
    await Fliplet.Navigate.screen(screenName);
    console.log(`Successfully navigated to ${screenName}`);
  } catch (error) {
    console.error(`Navigation failed to ${screenName}:`, error.message);
    console.log('Ensure the screen exists in your app');
    throw error;
  }
};
```

#### Test Data Templates

```js
// Sample data templates for different use cases

// User profiles test data
const userProfilesTestData = [
  {
    Name: 'John Smith',
    Email: 'john@company.com',
    Department: 'Engineering',
    Office: 'London',
    Status: 'Active',
    JoinDate: '2023-01-15',
    Preferences: JSON.stringify({ theme: 'dark', notifications: true })
  },
  {
    Name: 'Sarah Johnson',
    Email: 'sarah@company.com',
    Department: 'Design',
    Office: 'New York',
    Status: 'Active',
    JoinDate: '2023-02-20',
    Preferences: JSON.stringify({ theme: 'light', notifications: false })
  },
  {
    Name: 'Mike Wilson',
    Email: 'mike@company.com',
    Department: 'Marketing',
    Office: 'Berlin',
    Status: 'Inactive',
    JoinDate: '2023-03-10',
    Preferences: JSON.stringify({ theme: 'auto', notifications: true })
  }
];

// App configuration test data
const appConfigTestData = {
  appName: 'Test Application',
  version: '1.0.0',
  theme: {
    primaryColor: '#4CAF50',
    secondaryColor: '#2196F3',
    fontFamily: 'Arial, sans-serif'
  },
  features: {
    userManagement: true,
    notifications: true,
    dataSync: true,
    offline: false
  }
};

// Sample CSV data for import testing
const sampleCSVData = `Name,Email,Department,Office,Status,JoinDate
John Smith,john@company.com,Engineering,London,Active,2023-01-15
Sarah Johnson,sarah@company.com,Design,New York,Active,2023-02-20
Mike Wilson,mike@company.com,Marketing,Berlin,Active,2023-03-10
Lisa Garcia,lisa@company.com,Sales,Paris,Active,2023-04-05
Tom Anderson,tom@company.com,Engineering,Remote,Inactive,2023-05-12`;
```

## Conclusion

These updated standards ensure consistency, maintainability, and optimal performance across all Fliplet development. The reorganized structure provides better navigation and reduces duplication while maintaining comprehensive coverage.

### Development Principles

When developing with Fliplet, remember to:

1. **Prioritize Modern JavaScript** - Use ES6+ features unless legacy support is required
2. **Include Complete Examples** - Every code sample should work immediately when copied
3. **Handle Errors Gracefully** - Implement comprehensive error handling with meaningful messages
4. **Consider Environment Context** - Write appropriate code for Studio vs App environments
5. **Follow Performance Best Practices** - Optimize queries, implement pagination, and minimize data transfer
6. **Use Cross-References** - Link related concepts and provide navigation aids
7. **Test Thoroughly** - Validate functionality across different environments and use cases

### Quick Navigation

- **Getting Started:** [Documentation Standards](#documentation-standards)
- **Environment Setup:** [Development Environment Guidelines](#development-environment-guidelines)
- **Coding Patterns:** [JavaScript Coding Standards](javascript-coding-standards.md)
- **API Usage:** [Fliplet API Patterns](code-api-patterns.md)
- **Quick Lookup:** [Quick Reference Guide](#quick-reference-guide)
- **Testing:** [Code Examples and Testing](#code-examples-and-testing)
- **Libraries:** [Approved Libraries](approved-libraries.md)

For questions or clarifications, refer to the [Fliplet Developer Documentation](https://developers.fliplet.com/) or contact the development team.


*Document Version: 2.0 - Reorganized and Enhanced*  
*Last Updated: 2024* 