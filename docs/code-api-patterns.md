# Fliplet API Patterns

### Purpose and Importance

Fliplet provides multiple APIs for different aspects of app development. Understanding when and how to use each API is crucial for building effective apps. This section explains the purpose of each major API category and provides patterns for common operations.

### When to Use This Section

Reference this section when:
- Choosing which Fliplet API to use for a specific task
- Understanding the relationship between different APIs
- Building complex functionality that spans multiple APIs
- Learning Fliplet development patterns

### API Categories Overview

**Data Sources APIs** - For storing and retrieving app data
- Use for: User profiles, app content, form submissions, any structured data
- Key methods: `connectByName()`, `find()`, `insert()`, `update()`, `removeById()`

**User Management APIs** - For authentication and user sessions
- Use for: Login/logout, user profiles, session management, permissions
- Key methods: `login()`, `logout()`, `getCachedSession()`, `update()`

**Media APIs** - For file storage and management
- Use for: Images, documents, videos, any file uploads
- Key methods: `Folders.get()`, `Files.upload()`, `Files.get()`, `Files.delete()`

**Navigation APIs** - For moving between screens and URLs
- Use for: Screen transitions, deep linking, data passing between screens
- Key methods: `screen()`, `url()`, `back()`, `query()`

**Communication APIs** - For sending messages and notifications
- Use for: Email, SMS, push notifications, in-app messaging
- Key methods: `sendEmail()`, `sendSMS()`, `Notifications.create()`

### Connection and Initialization Patterns

```js
// Data Sources - Always use connectByName for portability
const initDataConnection = async (dataSourceName) => {
  try {
    const connection = await Fliplet.DataSources.connectByName(dataSourceName);
    console.log(`Connected to ${dataSourceName} data source`);
    return connection;
  } catch (error) {
    console.error(`Failed to connect to ${dataSourceName}:`, error.message);
    throw error;
  }
};

// User Session - Check and initialize user state
const initUserSession = async () => {
  try {
    const user = await Fliplet.User.getCachedSession();
    if (user) {
      console.log('User session found:', user.email);
      return user;
    } else {
      console.log('No user session - user needs to login');
      return null;
    }
  } catch (error) {
    console.error('Session check failed:', error.message);
    throw error;
  }
};

// Media Folders - Initialize media management
const initMediaFolders = async () => {
  try {
    const folders = await Fliplet.Media.Folders.get();
    console.log(`Found ${folders.length} media folders`);
    return folders;
  } catch (error) {
    console.error('Media folder initialization failed:', error.message);
    throw error;
  }
};
```

### CRUD Operation Patterns for All APIs

**Purpose:** These patterns provide consistent approaches for Create, Read, Update, and Delete operations across all Fliplet APIs. Understanding these patterns helps you build reliable data management functionality.

**When to use:** Reference these patterns whenever you need to manage data, users, media files, or any other resources in your Fliplet app.

```js
// Data Sources CRUD
const dataSourceOperations = {
  create: async (connection, data) => {
    const record = await connection.insert(data);
    console.log('Record created:', record.id);
    return record;
  },
  
  read: async (connection, criteria = {}) => {
    const records = await connection.find({
      where: criteria,
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${records.length} records`);
    return records;
  },
  
  update: async (connection, id, updates) => {
    const record = await connection.update(id, updates);
    console.log('Record updated:', id);
    return record;
  },
  
  delete: async (connection, id) => {
    await connection.removeById(id);
    console.log('Record deleted:', id);
  }
};

// User Management Operations
const userOperations = {
  login: async (credentials) => {
    const user = await Fliplet.User.login(credentials);
    console.log('User logged in:', user.email);
    return user;
  },
  
  logout: async () => {
    await Fliplet.User.logout();
    console.log('User logged out');
  },
  
  getProfile: async () => {
    const user = await Fliplet.User.getCachedSession();
    console.log('User profile retrieved');
    return user;
  },
  
  updateProfile: async (updates) => {
    const user = await Fliplet.User.update(updates);
    console.log('User profile updated');
    return user;
  }
};

// Media Operations
const mediaOperations = {
  upload: async (file, folderId) => {
    const uploadedFile = await Fliplet.Media.Files.upload({
      folderId: folderId,
      file: file
    });
    console.log('File uploaded:', uploadedFile.url);
    return uploadedFile;
  },
  
  list: async (folderId) => {
    const files = await Fliplet.Media.Files.get({ folderId });
    console.log(`Found ${files.length} files in folder`);
    return files;
  },
  
  delete: async (fileId) => {
    await Fliplet.Media.Files.delete(fileId);
    console.log('File deleted:', fileId);
  }
};
```

### Navigation Patterns

**Purpose:** Navigation is how users move through your app. These patterns cover different types of navigation and when to use each approach.

**When to use:**
- **Screen navigation** - Moving between app screens with optional data
- **URL navigation** - Opening external websites or deep links
- **Back navigation** - Returning to previous screens

```js
// Screen Navigation
const navigationPatterns = {
  // Simple navigation
  goToScreen: async (screenName) => {
    await Fliplet.Navigate.screen(screenName);
    console.log(`Navigated to ${screenName}`);
  },
  
  // Navigation with data
  goToScreenWithData: async (screenName, data) => {
    await Fliplet.Navigate.screen(screenName, data);
    console.log(`Navigated to ${screenName} with data:`, data);
  },
  
  // URL navigation
  goToUrl: async (url, options = {}) => {
    await Fliplet.Navigate.url(url, options);
    console.log(`Navigated to URL: ${url}`);
  },
  
  // Back navigation
  goBack: async () => {
    await Fliplet.Navigate.back();
    console.log('Navigated back');
  }
};

// Complete navigation example with error handling
const safeNavigation = async (destination, data = null) => {
  try {
    if (typeof destination === 'string' && destination.startsWith('http')) {
      await navigationPatterns.goToUrl(destination);
    } else if (data) {
      await navigationPatterns.goToScreenWithData(destination, data);
    } else {
      await navigationPatterns.goToScreen(destination);
    }
  } catch (error) {
    console.error('Navigation failed:', error.message);
    // Fallback navigation
    await navigationPatterns.goBack();
  }
};
```

### Communication Patterns

**Purpose:** Communication APIs enable your app to send messages to users through various channels. Understanding when to use each method helps you build effective user engagement.

**When to use:**
- **Email** - Detailed information, receipts, welcome messages, newsletters
- **SMS** - Urgent notifications, verification codes, brief alerts
- **Push notifications** - In-app alerts, reminders, real-time updates

```js
// Email Communication
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const result = await Fliplet.Communicate.sendEmail({
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      attachments: attachments
    });
    
    console.log('Email sent successfully');
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

// Push Notifications
const sendPushNotification = async ({ title, message, userId, data = {} }) => {
  try {
    const notification = await Fliplet.Notifications.create({
      title: title,
      message: message,
      userId: userId,
      data: data
    });
    
    console.log('Push notification sent');
    return notification;
  } catch (error) {
    console.error('Push notification failed:', error.message);
    throw error;
  }
};

// SMS Communication
const sendSMS = async ({ to, message }) => {
  try {
    const result = await Fliplet.Communicate.sendSMS({
      to: to,
      body: message
    });
    
    console.log('SMS sent successfully');
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    throw error;
  }
};
```