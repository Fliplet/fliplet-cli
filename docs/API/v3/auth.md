---
description: V3 authentication patterns for email/password login, session management, logout, and protected routes. Use these patterns when building authentication flows in V3 apps.
---

# V3 Authentication Patterns

Authentication in V3 apps uses the `Fliplet.Session` API to authenticate users against a Data Source. This page covers email/password login, session checks, logout, forgot-password, and protected route patterns specific to V3 single-page apps.

For SAML2/SSO configuration, use the SAML2 tab in App Settings (not code). For email verification (passwordless), see the [Email Verification docs](../components/email-verification.md). For the full Session API reference, see [Session JS APIs](../fliplet-session.md).

## Prerequisites

- A Data Source containing user records with at least `Email` and `Password` columns
- Security rules configured on the Data Source (see [Data Source Security](../../Data-source-security.md))
- The `fliplet-datasources` dependency added to your app

## Email/Password Login

### Basic Login

Authenticate a user against a Data Source using `Fliplet.Session.authorize()`. This creates a server-side session that persists across page navigations.

```js
async function loginUser(email, password, dataSourceId) {
  try {
    const session = await Fliplet.Session.authorize({
      passport: 'dataSource',
      dataSourceId: dataSourceId,
      where: {
        Email: email,
        Password: password
      }
    });

    // session.entries.dataSource.data contains the matched user record
    // e.g., { Email: 'user@company.com', Name: 'Jane Smith', Role: 'Editor' }
    const user = session.entries.dataSource.data;

    console.log('Logged in as:', user.Email);

    return session;
  } catch (error) {
    // Common errors:
    // - "Unauthorized" — email or password does not match any record
    // - Network errors — device is offline
    console.error('Login failed:', error.message || error);
    throw error;
  }
}
```

**Parameters for `Fliplet.Session.authorize()`:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `passport` | String | Yes | Must be `'dataSource'` for email/password login |
| `dataSourceId` | Number | Yes | The ID of the Data Source containing user records |
| `where` | Object | Yes | Field-value pairs to match. Typically `{ Email, Password }` |

**Returns:** `Promise<Session>` — the session object with `entries.dataSource.data` containing the matched user record.

**Errors:** Throws if credentials don't match or if the network request fails. The error does NOT reveal whether the email or password was wrong (security best practice).

### Login Screen Vue Component

A complete login screen as a Vue SFC for V3 apps:

```html
<template>
  <div class="login-screen">
    <div class="login-card">
      <h1>Sign In</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@company.com"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      <p class="forgot-link">
        <a href="#" @click.prevent="$router.push('/forgot-password')">Forgot password?</a>
      </p>
    </div>
  </div>
</template>

<script>
// Replace with the actual Data Source ID for your users table
var USERS_DATA_SOURCE_ID = 123456;

export default {
  data: function() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false
    };
  },
  methods: {
    handleLogin: async function() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        await Fliplet.Session.authorize({
          passport: 'dataSource',
          dataSourceId: USERS_DATA_SOURCE_ID,
          where: {
            Email: this.email,
            Password: this.password
          }
        });

        // Login successful — navigate to the home screen
        this.$router.push('/home');
      } catch (error) {
        this.errorMessage = 'Invalid email or password. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 400px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}
.error-text {
  color: #dc3545;
  font-size: 14px;
}
button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: #4A90D9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.forgot-link {
  text-align: center;
  margin-top: 16px;
}
</style>
```

## Session Check

Check whether the user is logged in. Use this in your App shell component or route guards to protect screens.

```js
async function isLoggedIn() {
  try {
    var session = await Fliplet.User.getCachedSession();

    // getCachedSession returns the locally cached session (works offline).
    // session.entries.dataSource exists if the user logged in via email/password.
    return !!(session && session.entries && session.entries.dataSource);
  } catch (error) {
    return false;
  }
}
```

`Fliplet.User.getCachedSession()` is fast and works offline because it reads from local storage. Use it for UI decisions (show/hide content). For server-verified session checks, use `Fliplet.Session.get()` instead (requires network).

### Get the Logged-In User's Data

```js
async function getCurrentUser() {
  var session = await Fliplet.User.getCachedSession();

  if (!session || !session.entries || !session.entries.dataSource) {
    return null; // Not logged in
  }

  // Returns all columns from the user's Data Source record
  // e.g., { Email: 'jane@company.com', Name: 'Jane Smith', Role: 'Editor' }
  return session.entries.dataSource.data;
}
```

## Logout

Clear the session and redirect to the login screen. V3 uses History API routing on every platform, so redirect via your router (or `history.pushState` + `Fliplet.Router.getBasePath()`) — never `window.location.hash`. See [V3 Routing](routing.md) for the full contract.

```js
// Called from a component that has a router instance in scope.
async function logout(router) {
  await Fliplet.Session.logout('dataSource');

  router.push('/login');
}
```

If you don't have a router handy (e.g., a framework-agnostic helper), use the History API directly:

```js
async function logout() {
  await Fliplet.Session.logout('dataSource');

  history.pushState({}, '', Fliplet.Router.getBasePath() + '/login');
  // Trigger your router's re-render. In vanilla setups, dispatch a popstate.
  window.dispatchEvent(new PopStateEvent('popstate'));
}
```

`Fliplet.Session.logout('dataSource')` clears the dataSource passport. To log out from all passport types (dataSource, saml2, flipletLogin), call `Fliplet.Session.logout()` with no arguments.

## Protected Routes with Vue Router Guards

In V3 apps using Vue Router, protect routes by checking the session before navigation. This section assumes the router was built per the canonical V3 pattern (History API, base path from `Fliplet.Router.getBasePath()`, routes from `Fliplet.Router.getRouteManifest()`). See the [Canonical snippet (Vue Router 4)](routing.md#canonical-snippet-vue-router-4) in the V3 Routing doc before wiring the guard below.

### In the App Shell (App.vue)

Add a `beforeEach` guard to the router in your boot template's `initVueApp()` function. This does NOT go inside an SFC file. It goes in the boot HTML:

```js
// Inside initVueApp(), after creating the router:
router.beforeEach(function(to, from, next) {
  // Define which routes are public (accessible without login)
  var publicRoutes = ['/login', '/forgot-password', '/reset-password'];

  if (publicRoutes.indexOf(to.path) !== -1) {
    return next(); // Public route — allow
  }

  // Check session for protected routes
  Fliplet.User.getCachedSession().then(function(session) {
    if (session && session.entries && session.entries.dataSource) {
      next(); // Logged in — allow
    } else {
      next('/login'); // Not logged in — redirect to login
    }
  }).catch(function() {
    next('/login'); // Error checking session — redirect to login
  });
});
```

### Route Configuration

Define your routes so the login screen is accessible without authentication:

```js
routes: [
  { path: '/', redirect: '/home' },
  { path: '/login', name: 'Login', component: function() { return loadComponent(COMPONENT_FILES.Login); } },
  { path: '/forgot-password', name: 'ForgotPassword', component: function() { return loadComponent(COMPONENT_FILES.ForgotPassword); } },
  { path: '/home', name: 'Home', component: function() { return loadComponent(COMPONENT_FILES.Home); } },
  { path: '/settings', name: 'Settings', component: function() { return loadComponent(COMPONENT_FILES.Settings); } }
]
```

## Forgot Password

Password reset uses the existing Data Source validation APIs. Code generation, storage, email delivery, and verification all happen server-side. The client orchestrates the UI steps.

The flow uses three existing APIs:
1. `dataSource.sendValidation()` — server generates a code, stores it, sends it via email
2. `dataSource.validate()` — server verifies the code, marks the user as needing a password reset
3. `Fliplet.Session.updateUserPassword()` — server updates the password

**Do NOT build custom password reset logic.** These APIs handle code generation, expiry, and verification server-side. The client never sees the reset code.

### Forgot Password Screen (Vue SFC)

```html
<template>
  <div class="forgot-password-screen">
    <div class="form-card">
      <h1>Reset Password</h1>

      <!-- Step 1: Enter email -->
      <div v-if="step === 'email'">
        <p>Enter your email address and we'll send you a verification code.</p>
        <form @submit.prevent="sendCode">
          <div class="form-group">
            <label for="reset-email">Email</label>
            <input id="reset-email" v-model="email" type="email" required />
          </div>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Sending...' : 'Send Code' }}
          </button>
        </form>
      </div>

      <!-- Step 2: Enter code -->
      <div v-if="step === 'verify'">
        <p>Enter the verification code sent to {{ email }}</p>
        <form @submit.prevent="verifyCode">
          <div class="form-group">
            <label for="code">Verification Code</label>
            <input id="code" v-model="code" type="text" required />
          </div>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Verifying...' : 'Verify Code' }}
          </button>
        </form>
      </div>

      <!-- Step 3: New password -->
      <div v-if="step === 'reset'">
        <p>Choose a new password.</p>
        <form @submit.prevent="resetPassword">
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input id="new-password" v-model="newPassword" type="password" required minlength="8" />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input id="confirm-password" v-model="confirmPassword" type="password" required minlength="8" />
          </div>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>

      <p class="back-link">
        <a href="#" @click.prevent="$router.push('/login')">Back to Sign In</a>
      </p>
    </div>
  </div>
</template>

<script>
var USERS_DATA_SOURCE_ID = 123456; // Replace with your Users data source ID
var EMAIL_COLUMN = 'Email';        // The column name for email in your data source
var PASSWORD_COLUMN = 'Password';  // The column name for password in your data source

export default {
  data: function() {
    return {
      step: 'email',
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      isLoading: false,
      dataSource: null
    };
  },
  methods: {
    getDataSource: async function() {
      if (!this.dataSource) {
        this.dataSource = await Fliplet.DataSources.connect(USERS_DATA_SOURCE_ID);
      }
      return this.dataSource;
    },
    sendCode: async function() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        var ds = await this.getDataSource();
        var where = {};
        where[EMAIL_COLUMN] = this.email;

        // Server generates a code, stores it on the entry, and sends it via email.
        // Returns 204 regardless of whether the email exists (no information leak).
        await ds.sendValidation({
          type: 'email',
          where: where
        });

        this.step = 'verify';
      } catch (error) {
        this.errorMessage = 'Something went wrong. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    verifyCode: async function() {
      this.errorMessage = '';
      this.isLoading = true;

      try {
        var ds = await this.getDataSource();

        // Server validates the code and marks the session for password reset.
        // This also logs the user in temporarily so updateUserPassword works.
        await ds.validate({
          type: 'email',
          where: {
            code: this.code
          },
          requiresPasswordReset: true
        });

        this.step = 'reset';
      } catch (error) {
        this.errorMessage = 'Invalid or expired code. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    resetPassword: async function() {
      this.errorMessage = '';

      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (this.newPassword.length < 8) {
        this.errorMessage = 'Password must be at least 8 characters.';
        return;
      }

      this.isLoading = true;

      try {
        // Server updates the password on the data source entry and logs out the user.
        await Fliplet.Session.updateUserPassword({
          newPassword: this.newPassword,
          passwordColumn: PASSWORD_COLUMN
        });

        // Password updated — redirect to login
        this.$router.push('/login');
      } catch (error) {
        this.errorMessage = 'Failed to reset password. Please try again.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
```

**API Reference for the forgot-password flow:**

| Step | Client calls | Server does |
|---|---|---|
| Send code | `dataSource.sendValidation({ type: 'email', where: { Email: '...' } })` | Generates code, stores on entry, sends email. Returns 204 (no info leak). |
| Verify code | `dataSource.validate({ type: 'email', where: { code: '...' }, requiresPasswordReset: true })` | Validates code, checks expiry (24h default), creates temporary session. |
| Reset password | `Fliplet.Session.updateUserPassword({ newPassword, passwordColumn })` | Updates password column on data source entry, logs out user. |

This is the same flow the V2 login widget uses. All security-critical operations (code generation, validation, password storage) happen server-side.

## Patterns — DO and DON'T

```js
// DO: Use Fliplet.Session.authorize() for email/password login
await Fliplet.Session.authorize({ passport: 'dataSource', dataSourceId: id, where: { Email, Password } });

// DON'T: Store session tokens in localStorage
// localStorage is partitioned in cross-origin iframes (Studio preview).
// Fliplet.Session handles storage internally.

// DO: Use Fliplet.User.getCachedSession() for session checks (fast, works offline)
var session = await Fliplet.User.getCachedSession();

// DON'T: Use Fliplet.Session.get() for every session check
// Session.get() makes a network request. Use getCachedSession() for UI decisions.

// DO: Use Vue Router guards for protected routes (see above)
// DON'T: Check the session inside every component's mounted() hook

// DO: Use Fliplet.Session.logout('dataSource') for dataSource logouts
// DON'T: Clear cookies or localStorage manually — the SDK handles cleanup

// DO: Show generic "Invalid email or password" errors
// DON'T: Reveal whether the email or password was wrong separately
```

## Related

- [V3 Routing](routing.md) — base path, route manifest, `checkRouteAccess`, and post-login redirect pattern.
- [V3 App Bootstrap](app-bootstrap.md) — the three boot-HTML constraints every V3 app must satisfy.
- [Session JS APIs](../fliplet-session.md) — full session API reference
- [Login Component](../components/login.md) — V2 login component hooks
- [Email Verification](../components/email-verification.md) — passwordless login flow
- [Data Source Security](../../Data-source-security.md) — security rules for user data sources
- [App Security](../../App-security.md) — app-level access control rules
