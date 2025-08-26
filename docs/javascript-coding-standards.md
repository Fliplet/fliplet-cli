# JavaScript Coding Standards

## Purpose and Importance

ES5 standards are for maintaining compatibility with older environments or when working with legacy Fliplet apps that haven't been updated to modern JavaScript. While ES6+ is recommended for new development, understanding ES5 patterns is important for maintaining existing code.

## When to Use ES5

Use ES5 patterns when:
- Working with legacy Fliplet apps (pre-2020)
- Supporting older mobile devices or browsers
- Maintaining existing code that uses ES5 patterns
- Working in environments without ES6+ transpilation
- Specific client requirements for older browser support

> **Migration Tip:** Consider upgrading ES5 code to modern JavaScript when possible for better maintainability.

## Promise Chaining with .then()

```js
// ES5 Pattern: User authentication
function authenticateUser(email, password) {
  return Fliplet.User.login({ email: email, password: password })
    .then(function(user) {
      console.log('User authenticated:', user.email);
      return Fliplet.Storage.set('currentUser', user);
    })
    .then(function() {
      return Fliplet.Navigate.screen('dashboard');
    })
    .then(function() {
      console.log('Navigation completed');
      return true;
    })
    .catch(function(error) {
      console.error('Authentication failed:', error.message);
      throw error;
    });
}

// ES5 Pattern: Media upload
function uploadUserAvatar(file) {
  var mediaFolder;
  
  return Fliplet.Media.Folders.get()
    .then(function(folders) {
      mediaFolder = folders.find(function(folder) {
        return folder.name === 'User Avatars';
      });
      
      if (!mediaFolder) {
        throw new Error('User Avatars folder not found');
      }
      
      return Fliplet.Media.Files.upload({
        folderId: mediaFolder.id,
        file: file
      });
    })
    .then(function(uploadedFile) {
      console.log('Avatar uploaded:', uploadedFile.url);
      return uploadedFile;
    })
    .catch(function(error) {
      console.error('Upload failed:', error.message);
      throw error;
    });
}

// ES5 Pattern: Notification sending
function sendWelcomeNotification(userId) {
  return Fliplet.Communicate.sendEmail({
    to: [{ email: 'user@example.com', name: 'User Name' }],
    subject: 'Welcome to our app!',
    html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>'
  })
    .then(function(result) {
      console.log('Welcome email sent');
      return Fliplet.Notifications.create({
        title: 'Welcome!',
        message: 'Check your email for important information',
        userId: userId
      });
    })
    .then(function(notification) {
      console.log('In-app notification created');
      return notification;
    });
}
```

## Function Declarations in ES5

```js
// ES5 Pattern: Data management
function createUserProfile(userData) {
  return Fliplet.DataSources.connectByName("UserProfiles")
    .then(function(connection) {
      return connection.insert({
        Name: userData.name,
        Email: userData.email,
        Department: userData.department,
        CreatedDate: new Date().toISOString(),
        Status: 'Active'
      });
    })
    .then(function(newProfile) {
      console.log('Profile created:', newProfile.data.Name);
      return newProfile;
    });
}

function updateUserPreferences(userId, preferences) {
  var userConnection;
  
  return Fliplet.DataSources.connectByName("UserProfiles")
    .then(function(connection) {
      userConnection = connection;
      return connection.findById(userId);
    })
    .then(function(user) {
      if (!user) {
        throw new Error('User not found');
      }
      return userConnection.update(userId, {
        Preferences: JSON.stringify(preferences),
        LastModified: new Date().toISOString()
      });
    })
    .then(function(updatedUser) {
      console.log('Preferences updated for:', updatedUser.data.Name);
      return updatedUser;
    });
}
```

## ES5 to Modern JavaScript Migration Guide

```js
// ES5 → ES6+ Migration Examples

// ES5: Function declaration
function getUserData(userId) {
  return Fliplet.DataSources.connectByName("Users")
    .then(function(connection) {
      return connection.findById(userId);
    });
}

// ES6+: Arrow function with async/await
const getUserData = async (userId) => {
  const connection = await Fliplet.DataSources.connectByName("Users");
  return connection.findById(userId);
};

// ES5: Variable declarations
var userName = user.data.Name;
var userEmail = user.data.Email;

// ES6+: Destructuring
const { Name: userName, Email: userEmail } = user.data;

// ES5: String concatenation
var message = 'Hello ' + userName + ', welcome to ' + appName + '!';

// ES6+: Template literals
const message = `Hello ${userName}, welcome to ${appName}!`;
```

> **See also:** 
> - [Modern JavaScript (ES6+)](#modern-javascript-es6---recommended) for preferred patterns
> - [Code Examples and Testing](#code-examples-and-testing) for testing both ES5 and modern code

> **Next:** Learn about [Fliplet API Patterns](#fliplet-api-patterns)