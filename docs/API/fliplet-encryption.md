# Encrypt the content of data sources

<p class="warning"><strong>BETA FEATURE:</strong> Please note that this feature is currently only available in beta and its specifications may be subject to change before releasing it.</p>

Add the `fliplet-encryption` Fliplet package to your global resources to enable encryption and decryption functionalities in your Fliplet apps.

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
Fliplet.DataSources.Encryption().encrypt(123, ['First name', ['Last name']);
```

The system will take care of both encrypting and decrypting content of data sources for you. No additional code will be required.

## Clear the encryption/decryption key

```js
Fliplet.DataSources.Encryption().clearKey();
```