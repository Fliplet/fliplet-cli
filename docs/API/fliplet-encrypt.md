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

---

## Deprecated usage

<p class="warning"><strong>DEPRECATED USE:</strong> The following implementation is considered to be very low level and it's not recommended unless you know what you're doing.</p>

Add the `crypto-js` Fliplet package to your global resources to enable encryption and decryption functionalities in your Fliplet apps.

### Set up the basic structure

Before diving into components, let's define a few helpers in the **Global JS** to reuse code between screens. Simply copy and paste the following code to get started:

```js
App = {
  Keys: {
    set: function (obj) {
      Fliplet.App.Storage.set(App.Static.KEYS, obj);
    },
    get: function () {
      return Fliplet.App.Storage.get(App.Static.KEYS).then(function (values) {
        if (!values || !values.key) {
          return Promise.reject('Security keys have not been set. Please make sure you\'re logged in before performing this action.');
        }

        return values;
      });
    }
  },
  Static: {
    KEYS: '_SecurityKeys'
  },
  Security: {
    encrypt: function (value, key) {
      return CryptoJS.AES.encrypt(value, key).toString();
    },
    decrypt: function (value, key) {
      return CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
    }
  },
  Entry: {
    // List of fields to encrypt/decrypt
    EncryptedFields: [
      'Name', 'Title', 'Department', 'Telephone'
    ],
    encrypt: function (data, key) {
      _.extend(data, _.mapValues(_.pick(data, App.Entry.EncryptedFields), function (value) {
        return App.Security.encrypt(value, key);
      }));
    },
    decrypt: function (data, key) {
      _.forIn(data, function (value, name) {
        if (App.Entry.EncryptedFields.indexOf(name) !== -1) {
          data[name] = App.Security.decrypt(value, key);
        }
      });
    }
  }
};
```

### Set the encryption keys on user login

```js
// Add this code to a screen with a login component
Fliplet.Hooks.on('login', function (formEntry) {
  // Locally store the keys for decrypting/encrypting data
  return App.Keys.set({ key: 'FOO' });
});
````

### Configure a form to decrypt and encrypt data

```js
var entryId = Fliplet.Navigate.query.dataSourceEntryId;

return App.Keys.get().then(function (keys) {
  // Encrypt the contact data when saving
  Fliplet.Hooks.on('beforeFormSubmit', function(data) {
    App.Entry.encrypt(data, keys.key);
  });

  var toast = Fliplet.UI.Toast('Please wait...');

  // Hook for loading contact and decrypting its data
  return Fliplet.FormBuilder.get().then(function (form) {
    form.load(function () {
      return Fliplet.DataSources.connect(form.data().dataSourceId).then(function (connection) {
        return connection.findById(entryId);
      }).then(function (entry) {
        App.Entry.decrypt(entry.data, keys.key);

        toast.then(function (instance) {
          instance.dismiss();
        })

        return entry.data;
      });
    });
  });
}).catch(function (err) {
  Fliplet.UI.Toast(err);
});

```

### Configure a LFD to decrypt data before displaying it

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  data.config.getData = function() {
    return App.Keys.get().then(function (keys) {
      // Fetch the data
      return Fliplet.DataSources.connect(123)
        .then(function (db) {
          return db.find();
        })
        .then(function (records) {
          records.forEach(function (record) {
            App.Entry.decrypt(record.data, keys.key);
          });

          return records;
        });
    }).catch(function (err) {
      console.error(err);
      return Promise.reject('You need to be logged in to view this encrypted list. ' + err);
    });
  };
});
```