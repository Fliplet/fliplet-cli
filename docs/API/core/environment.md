# Env (Environment)

### Get an environment variable

```js
var appId = Fliplet.Env.get('appId');
```

These variables are usually available on app screens as long as components and providers:

- `apiUrl` - the base URL of Fliplet APIs (e.g. `https://api.fliplet.com/`)
- `appFonts` - array of fonts uploaded for the current app
- `appHooks` - array of security hooks that have been set up the current app
- `appId` - the current app id
- `appName` - the current app name
- `appPages` - array of pages for the current app
- `appSettings` - object with public settings for the current app
- `appSlug` - string with the public slug (URI) for the current app
- `appUpdatedAt` - timestamp set to the last time a change has been made via Fliplet Studio to the current app
- `appVersion` - number pointing to the app's version (when using Fliplet Viewer, its value will be `(DEV)`)
- `appTemplate` - boolean indicating whether the app is a template
- `appsUrl` - the base URL for Fliplet Apps (e.g. `https://apps.fliplet.com/`)
- `development` - `true / false` true when if developing via the Fliplet CLI
- `interact` - `true / false` true when you are in edit mode in Fliplet Studio
- `masterAppId` - when called from a live app, returns the ID of the master app seen through Fliplet Studio
- `mode`
  - `interact`: The app is running in Fliplet Studio while in edit mode
  - `preview`: The app is running in Fliplet Viewer or in Fliplet Studio while in preview mode
  - `view`: The app is running in a live environment (e.g. web app or from an app distributed via App Store / Google Play / MDM)
- `demo` - boolean indicating whether the app is running in demo mode (e.g. when browsed via app previews)
- `organizationName` - the user's organization name
- `organizationId` - the user's organization id
- `pageId` - the current page id
- `pageMasterId` - when called from a live app, returns the ID of the master page seen through Fliplet Studio
- `pageTitle` - the current page (screen) title
- `pageSettings` - object with public settings for the current page
- `platform` - either `'web'` or `'native'` (use [Fliplet.Env.is](#check-the-current-apps-environment-platform) for easier checks)
- `provider` - `true / false` whether the current component (widget) is running in provider mode
- `preview` - `true / false` true when you are in edit or preview mode in Fliplet Studio
- `user` - the current user

### Set an environment variable

Through the `set()` method you can overwrite any of the above environment variables at runtime or add new ones. Please note that they will only be available until the screen navigates away to a new screen.

```js
Fliplet.Env.set('appId', 2);
```

### Check the current app's environment (platform)

Use the `is()` method to check whether the current app is running in a `native` (e.g. iOS and Android devices) or `web` environment.

```js
if (Fliplet.Env.is('native')) {
  // this code will run on native devices (iOS and Android) only
}

if (Fliplet.Env.is('web')) {
  // this code will run on desktop browsers only
}
````