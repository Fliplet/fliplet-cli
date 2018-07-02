# Securing your screens

Fliplet apps can have each of their screens secured so that they can only be accessed when certain conditions are met. Take the following example:

> My app has 5 screens, one being a login screen with email validation based on a Fliplet data source. I want to secure the other 4 screens of the app so thay they can only be accessed by logged-in users.

Such security rule can be set up as follows:

![img](https://dzwonsemrish7.cloudfront.net/items/0M0R2h3W0p1F112r3u01/Image%202018-07-02%20at%2012.50.22%20PM.png)

## Custom security rules

If you need more control on your security rules, you can also write your custom conditions using Javascript. When doing so, these variables are available to the context:

- `server` (Boolean) `true` when the security rule is being checked for a webapp
- `client` (Boolean) `true` when the security rule is being checked for a native app on iOS/Android/Windows
- `page` (Object `{ id: Number }`) the page that is running the security rule
- `session` (Object) the user's session, when available. Contains the same attributes found in the `v1/session` endpoint

Here follows an example that protects all pages (aside from the `loginScreen`) from being accessed unless the user is logged in against a **dataSource** and the column `foo` of his user has value `bar`.

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