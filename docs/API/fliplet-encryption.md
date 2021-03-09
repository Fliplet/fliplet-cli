# Encryption JS APIs

Adding automatic encryption and decryption on Data Sources when being used in your apps requires just a few lines of code. Here's how it works:

1. Add the `fliplet-encryption` Fliplet package to your app's **global resources** (*Developer options > Global > Settings > Resources*) to enable encryption and decryption functionalities in your Fliplet app
2. [Set up the encryption/decryption](#set-the-encryptiondecryption-key) private key in one of your **Screen Javascript** code (most likely when the user logs in)
3. In your **Global JavaScript**, [specify a list of Data Sources to encrypt](#set-up-encryption-on-a-data-source-across-the-app) along with the list of columns that should be encrypted.

That's it! It's as easy as is sounds.

---

## Methods

### Get the encryption key from the keystore

If you're using the **Fliplet Agent to encrypt data and the key is managed by Fliplet**, you can read it from the keystore using the following method:

```js
// Fetch the key from the keystore
Fliplet.DataSources.Encryption.KeyStore.getKey().then(function (key) {
  // use key as necessary
});
```

This can be used in conjunction with the `set()` method described below to fetch and register the key on the local device:

```js
// Fetch the key from the keystore
Fliplet.DataSources.Encryption.KeyStore.getKey().then(function (key) {
  // Register the key on the device
  return Fliplet.DataSources.Encryption().setKey(key);
});
```

If you have specified a `salt` passphrase for your encryption key, you can specify it as first parameter of the method:

```js
// Fetch the key from the keystore
Fliplet.DataSources.Encryption.KeyStore.getKey('mySecretPassphrase').then(function (key) {
  // use key as necessary
});
```

---

### Set the encryption/decryption key

When encrypting the contents of a data source, you need to specify an AES (128, 256 or 512) key to encrypt and decrypt such contents. The length of key will drive the encryption type, e.g. use a 32 bytes key for AES512.

<p class="quote">Note: you most likely want to run this command once a user logs in. See below for complete examples.</p>

Setting a key is as simple as running the following JS API:

```js
// Use an arbitrary key (as salt for a generated AES512 key)
Fliplet.DataSources.Encryption().setKey('foo');
```

```js
// or using a 32 byte key for AES512
Fliplet.DataSources.Encryption().setKey('3581e5305707b61fb3931346b5826e5c');
```

As a further example, you can optionally set up the key to dynamically be read from a user's data source entry once the user logs in:

```js
// Add this code to a screen with a login component
Fliplet.Hooks.on('login', function (formEntry) {
  return Fliplet.DataSources.Encryption().setKey(formEntry.columnContainingPrivateKey);
});
```

Make sure to replace `columnContainingPrivateKey` with the actual column name where the key should be taken from.

<p class="warning">Note: the <code>setKey</code> method does not work for web apps hosted in iframes due to third-party cookies being disallowed by browsers for privacy reasons. To bypass this limitation please refer to the <code>setRuntimeKey</code> method described below.</p>

### Set up the encryption key for the current session only

The following JS API allows you to set up an encryption key without storing it to disk. This is often used to circumvent browsers limitations when the Fliplet app is served via an iframe as third-party cookies and local storage access is blocked by browsers:

```js
Fliplet.DataSources.Encryption().setRuntimeKey('foo');
```

### Get the encryption key

Use the `getKey` JS API to fetch the encryption key from the current session or the device storage:

```js
Fliplet.DataSources.Encryption().getKey().then(function (obj) {
  // obj.key
});
```

---

### Set up encryption on a data source across the app

Use the `encrypt()` method to enable automatic management of a data source encryption and decryption data on-device.

```js
Fliplet.DataSources.Encryption().encrypt(dataSourceIdOrName, arrayOfFieldsToEncrypt);
```

Here's a fully working example:

```js
// Add this to the Global JS of your app
Fliplet.DataSources.Encryption().encrypt(123, [
  'First name', 'Last name', 'Bio'
]);
```

The system will take care of both encrypting and decrypting content of data sources for you. No additional code will be required aside from setting up the encryption key.

<p class="quote">Note: After enabling encryption all features in your app will utilize it, <strong>you do not need to add any further code or settings</strong> to your app or components.</p>

The system will take care of both encrypting and decrypting content of data sources for you. No additional code will be required aside from setting up the encryption key.

<p class="warning">If you're using the <code>Fliplet.DataSources.connectByName</code> method in your custom code to access Data Sources by name you will also need to configure your encryption code to additionally connect by name as per example below:</p>

```js
// Add this to the Global JS of your app
Fliplet.DataSources.Encryption().encrypt('My data source name', [
  'First name', 'Last name', 'Bio'
]);
```

---

### Clear the encryption/decryption key

This is what you probably want to do when the user logs out from the app.

```js
Fliplet.DataSources.Encryption().clearKey();
```

---

## Multi-organization set up

The following example assumes you want to set up multiple organizations within your app having different encryption keys so they can't access each other's data.

Given two Data Sources as follows:

**Organizations** *(Data Source ID `123`)*

| ID         | Name   | Key                              |
|------------|--------|----------------------------------|
| AAPL-0123  | Apple  | 78a2aeb84e98eb24f41267b14b14ce1b |
| GOOG-0789  | Google | be969b75d74a5eb12e19ee368c45ff8a |

**Users** *(Data Source ID `456`)*

| Email             | OrganizationID | Full name   | Bio         |
|-------------------|----------------|-------------|-------------|
| alice@example.org | AAPL-0123      | (Encrypted) | (Encrypted) |
| bob@example.org   | GOOG-0789      | (Encrypted) | (Encrypted) |
| john@example.org  | AAPL-0123      | (Encrypted) | (Encrypted) |

Create a **login component** bound to the users Data Source. Then, add the following **hook** to fetch the **user's organization key** from the organizations Data Source when the user logs in. This key will be set as encryption/decryption key for the user:

```js
// Add this code to a screen with a login component
Fliplet.Hooks.on('login', function (user) {
  // Fetch the user's organization
  return Fliplet.DataSources.connect(123).then(function (connection) {
  	return connection.find({
      where: { ID: user.entry.data.OrganizationID }
    });
  }).then(function (organizations) {
    // Read the organization key
    var key = _.first(organizations).data.key;

    // Locally store the organization key
    return Fliplet.DataSources.Encryption().setKey(key);
  });
});
```

You then just need to define in your **Global JavaScript code** which Data Sources are encrypted. In our example we simply define that the contacts Data Source has some encrypted columns:

```js
// Add this to the Global JavaScript code to encrypt the defined
// columns of the users Data Source
Fliplet.DataSources.Encryption().encrypt(345, [
  'Full name', 'Bio'
]);
```

That's it! The system will take care of automatically encrypting and decrypting data for you for the Data Sources you have defined.
