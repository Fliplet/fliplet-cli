# Securing your apps

Fliplet apps can have each of their screens and data sources secured so that they can only be accessed when certain conditions are met. Take the following example:

> My app has 5 screens, one being a login screen with email validation based on a Fliplet data source. I want to secure the other 4 screens of the app so that they can only be accessed by logged-in users.

Such security rule can be set up as follows:

![img](https://dzwonsemrish7.cloudfront.net/items/0M0R2h3W0p1F112r3u01/Image%202018-07-02%20at%2012.50.22%20PM.png)

## Custom security rules

If you need more control on your security rules, you can also write your custom conditions using Javascript. When doing so, these variables are available to the context:

- `server` (Boolean) `true` when the security rule is being checked for a webapp
- `client` (Boolean) `true` when the security rule is being checked for a native app on iOS/Android/Windows
- `page` (Object `{ id: Number, title: String }`) the page that is running the security rule
- `session` (Object) the user's session, when available. Contains the same attributes found in the `v1/session` endpoint
- `ipRangeCheck` (Function) please check the next section on IP address whitelisting/blacklisting for usage

Here follows an example that protects all screens (aside from the `loginScreen`) from being accessed unless the user is logged in against a **dataSource** and the column `foo` of his user has value `bar`.

When those conditions are not met, an `error` is raised and the user is redirected (see `navigate`) to the `loginScreen`:

```js
var loginScreen = 123;
var hasSession = session && session.entries && session.entries.dataSource;
var isAllowed = hasSession && session.entries.dataSource.data['foo'] !== 'bar';

if (server && page.id !== loginScreen && !isAllowed) {
  error = true;
  navigate = { action: 'screen', page: loginScreen, transition: 'slide.left' };
}
```

When running your security code on mobile devices you can also make use of the Javascript variables available in the browser, like `Modernizr` and `Fliplet.Env`.

As an example, targeting an iOS or Android device can be achieved like this:

```js
// this rule only runs on mobile devices
if (client) {
  if (Modernizr.iOS) {
    // this will only run on iOS
  } else if (Modernizr.Android) {
    // this will only run on Android
  }
}
```

---

### Whitelist or Blacklist access by IP address

Using the `ipRangeCheck` function you can write a custom rule to check if the user's IP address is within a range:

```js
if (server && !ipRangeCheck(ipAddress, "170.18.0.1/24")) {
  error = 'Not in range'
  errorMessage = 'Please come to the office if you need to use this app'
}
```

Or blacklist a single IP (note the missing `!` negation in the block condition):

```js
if (server && ipRangeCheck(ipAddress, "170.18.0.1/24")) {
  error = 'You are blacklisted'
  errorMessage = 'Nothing to see here.'
}
```

Or redirect to another screen:

```js
if (server && !ipRangeCheck(ipAddress, "170.18.0.1/24")) {
  navigate = { page: 123, action: 'screen' }

  // this is optional and it's sent as a GET query to the screen
  errorMessage = 'IP is not in range, please come to the office'
}
```

Or redirect to another screen:

```js
if (server && !ipRangeCheck(ipAddress, "170.18.0.1/24")) {
  navigate = { url: 'https://fliplet.com' }
}
```

Note: `ipRangeCheck` always returns `true` when run on the `client`.

Since app hooks allow javascript code in the custom rule, you're free to declare the list of whitelisted IPs as follows:

```js
var allowed = [
  "102.1.5.2/24",
  "192.168.1.0/24",
  "106.1.180.84"
]

if (server && !ipRangeCheck(ipAddress, allowed)) {
  error = 'Can\'t view the app from there.'
  errorMessage = 'Your IP address ' + ipAddress + ' is not in range. Please come to the office!'
}
```

Note: this feature only works on webapps. Please target them using the `server` boolean flag as shown above in the examples.

Sample error page for the above code:

![img](https://user-images.githubusercontent.com/574210/48259419-2b345c80-e418-11e8-9430-c66b7ec7dfb5.png)

More docs on the `ipRangeCheck` function can be found [here](https://github.com/danielcompton/ip-range-check#ipv4)

---

### Session expiration

When your app is using the login component connected to a Data Source, you can enable two optional features to improve security for your users:

- **Require the user to reauthenticate after a certain time**
  - The user will be logged out after the defined period of time (in minutes) has past since the login date.
  - Configure this via the `sessionMaxDurationMinutes` option as per example below.
- **Log the user out when the app has not been used for a period of time**
  - The user will be logged out when the session has been idle for the defined period of time (in minutes) since the last recorded activity
  - Configure this via the `sessionIdleTimeoutMinutes` option as per example below.

These option must be set in the **Data Source definition JSON** via the "App data" section of Fliplet Studio, **in the settings of your login Data Source**.

The following setup will ensure a user is logged out 2 hours past the login date:

```json
"sessionMaxDurationMinutes": 120
```

Likewise, this setup will automatically log the user out when the app is inactive for 30 minutes:

```json
"sessionIdleTimeoutMinutes": 30
```

The two options can also be used together:

![Data Sources](https://user-images.githubusercontent.com/574210/197834498-dceeecdc-f5ac-4315-b629-dd8434c4a5b0.png)

---