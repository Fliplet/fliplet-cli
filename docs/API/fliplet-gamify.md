# `Fliplet.Gamify`

Configure gamification logic for your apps.

---

Dependencies: `fliplet-gamify:0.1`

**This package is currently in Beta. We recommend adding the version number `:0.1` to ensure the feature continues to work in your app if and when the package is upgraded.**

## Data models and key concepts

All user data is saved and accessed via a data source. The following sections describe the models that the game data use.

### Logs

Logging looks at what the users are doing. When key actions and interactions occur, a log is generated in the data source. Here are some examples of what a log item could describe:

1. A user has logged in
1. A quiz has been completed
1. A comment has been submitted

When a log entry is created or updated, the game engine triggers the computation of variables and achievements (see below).

### Variables

Variables are used to define which aspects and statistics of the user we are interested in. These are used to keep track of the status of a user in the game at any given time. Here are some examples of what variables can be used to track:

1. Number of points colected
1. Number of articles read
1. Amount of time spent watching videos

Variables are computed when a log entry is created or updated, or when a manual computation is triggered. When variables are computed, the game engine triggers the computation of achievements (see below).

### Achievements

Achievements are used to track specific milestones that users have reached. They are computed based on the user variables. Therefore, a computation is triggered when a user variable computation is completed. Here are some examples of what could constitute an achievement:

1. User has read 10 articles
1. User has submitted 5 questions
1. User has watched 3 videos in a day

## Usage

To start setting up gamification logic for your app, add `fliplet-like:0.1` to your app/page dependencies.

Users must be logged in to use game engine and store game data.

```js
new Fliplet.Gamify(options)
```

* `options` **Required** (Object) A map of options to pass to the constructor.
  * `dataSource` **Required** (Number|String) Data source ID or name in which game data will be stored.
  * `passport` (String) Passport type for accessing user data. Valid inputs are `dataSource` and `saml2`. Leave this undefined if the game engine is used without a login. **Default**: `undefined`.
  * `primaryKey` (String) Field name for the user data that would be used as the user's key identifier. This is **required** if `passport` is defined.
  * `computed` (Object) A map of functions for computing variables and achievements.
    * `variables` (Function(`user`)) The `user` object is passed to the function for computing the variables. Function must return an object or a Promise that resolves with an object containing the key-value pair values for the variables.
    * `achievements` (Function(`user`)) The `user` object is passed to the function for computing the achievements. Function must return an array or a Promise that resolves with an array containing a collection of achievement objects. **Each achievement must contain an `id` property that is unique to the achievement.**

## Methods

The `Fliplet.Gamify()` function returns an object with the following methods.

### `.log(data)`

(Returns **`Promise`**)

Log data for the user.

The promise is resolved when the log operation is completed.

* `data` **Required** (Object) Log data to be saved.

### `.on(eventName, fn)`

Attach a handler when an event is triggered.

* `eventName` **Required** (String) Event name, such as `newAchievements`.
* `fn` **Required** (Function) A function to execute when the event is triggered.

### `.getUser(opt)`

(Returns **`Promise`**)

Retrieves the user data containing logs, variables and achievements. Data is loaded from a cached response unless `forceUpdate` is set to `true` (see below).

The promise is resolved with the user object when the data is retrieved.

* `opt` (Object) An optional map of options for the operation.
  * `forceUpdate` (Boolean) If set to `true`, user data is loaded directly from the remote data source instead of from the cached data. **Default**: `false`.

### `.updateUser(data)`

(Returns **`Promise`**)

Updates user data.

The promise is resolved when the update operation is completed.

* `data` **Required** (Object) Data object containing the user attributes to be updated.

### `.resetUser()`

(Returns **`Promise`**)

Resets user progress, including all logs, variables and achievements.

The promise is resolved when the reset operation is completed.

## Events

The following events are available for attaching using the `.on()` method.

* `variables` Triggered when variables are computed. The handler is triggered with the new `variables` object.
* `newAchievements` Triggered when new achievements have been added for the user. The handler is triggered with an array of achievement objects with unique IDs.

[Back to API documentation](../API-Documentation.md)
{: .buttons}