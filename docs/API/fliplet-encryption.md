# Encrypt the content of data sources

Adding encryption on Data Sources requires just a few lines of code. Here's how it works:

1. Add the `fliplet-encryption` Fliplet package to your **global resources** (*Developer options > Global > Settings > Resources*) to enable encryption and decryption functionalities in your Fliplet app
2. [Set up the encryption/decryption](#set-the-encryptiondecryption-key) private key in one of your **Screen Javascript** code (most likely when the user logs in)
3. In your **Global JavaScript**, specify a list of Data Sources to encrypt along with the list of columns that should be encrypted.

That's it! It's as easy as is sounds.

---

## Set the encryption/decryption key

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

## Set up encryption on a data source across the app

```js
Fliplet.DataSources.Encryption().encrypt(dataSourceId, arrayOfFieldsToEncrypt);
```

Working example:

```js
// Add this to the Global JS
Fliplet.DataSources.Encryption().encrypt(123, ['First name', 'Last name']);
```

The system will take care of both encrypting and decrypting content of data sources for you. No additional code will be required.

## Clear the encryption/decryption key

```js
Fliplet.DataSources.Encryption().clearKey();
```