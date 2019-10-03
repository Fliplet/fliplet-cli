# Encrypt the content of data sources

Adding encryption on Data Sources requires just a few lines of code. Here's how it works:

1. Add the `fliplet-encryption` Fliplet package to your **global resources** (*Developer options > Global > Settings > Resources*) to enable encryption and decryption functionalities in your Fliplet app
2. [Set up the encryption/decryption](#set-the-encryptiondecryption-key) private key in one of your **Screen Javascript** code (most likely when the user logs in)
3. In your **Global JavaScript**, [specify a list of Data Sources to encrypt](set-up-encryption-on-a-data-source-across-the-app) along with the list of columns that should be encrypted.

That's it! It's as easy as is sounds.

---

## Methods

### Set the encryption/decryption key

```js
Fliplet.DataSources.Encryption().setKey('foo');
```

Working example:

```js
// Add this code to a screen with a login component
Fliplet.Hooks.on('login', function (formEntry) {
  Fliplet.DataSources.Encryption().setKey(formEntry.columnContainingPrivateKey);
});
```

### Set up encryption on a data source across the app

```js
Fliplet.DataSources.Encryption().encrypt(dataSourceId, arrayOfFieldsToEncrypt);
```

Working example:

```js
// Add this to the Global JS
Fliplet.DataSources.Encryption().encrypt(123, [
  'First name', 'Last name', 'Bio'
]);
```

The system will take care of both encrypting and decrypting content of data sources for you. No additional code will be required.

### Clear the encryption/decryption key

This is what you probably want to do when the user logs out from the app.

```js
Fliplet.DataSources.Encryption().clearKey();
```

---

## Multi-organisation set up

The following example assumes you want to set up multiple organisations within your app having different encryption keys so they can't access each other's data.

Given two Data Sources as follows:

**Organisations** *(Data Source ID `123`)*

| ID         | Name   | Key      |
|------------|--------|----------|
| AAPL-0123  | Apple  | appl123$ |
| GOOG-0789  | Google | G00gl1!# |

**Users** *(Data Source ID `456`)*

| Email             | OrganizationID | Full name   | Bio         |
|-------------------|----------------|-------------|-------------|
| alice@example.org | AAPL-0123      | (Encrypted) | (Encrypted) |
| bob@example.org   | GOOG-0789      | (Encrypted) | (Encrypted) |
| john@example.org  | AAPL-0123      | (Encrypted) | (Encrypted) |

Create a **login component** bound to the users Data Source. Then, add the following **hook** to fetch the **user's organisation key** from the organisations Data Source when the user logs in. This key will be set as encryption/decryption key for the user:

```js
// Add this code to a screen with a login component
Fliplet.Hooks.on('login', function (user) {  
  // Fetch the user's organization
  return Fliplet.DataSources.connect(123).then(function (connection) {
  	return connection.find({
      where: { ID: user.entry.data.OrganizationID }
    });
  }).then(function (organizations) {
    // Read the organisation key
    var key = _.first(organizations).data.key;

    // Locally store the organization key
    return Fliplet.DataSources.Encryption().setKey(key);
  });
});
```

You then just need to define in your **Global JavaScript code** which Data Sources are encrypted. In our example we simply define that the contacts Data Source has some encrypted columns:

```js
// Add this to the Global JavaScript code to encrypt the users data source
Fliplet.DataSources.Encryption().encrypt(345, [
  'Full name', 'Bio'
]);
```

That's it! The system will take care of automatically encrypting and decrypting data for you for the Data Sources you have defined.