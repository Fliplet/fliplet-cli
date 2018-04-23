# `Fliplet.Profile.Content()`

(Returns **`Object`**)

The `fliplet-content` package contains helpers to create and manage content specific to the user.

When **content** is created using `Fliplet.Profile.Content()`, a record is stored in the specified data source with the content **attributed to the user**. This means the following:

* Content **created** will be attributed to the user.
* Only content created by the same user can be **queried**.
* Only content created by the same user can be **updated**.
* Only content created by the same user can be **deleted**.

See [`Fliplet.Content()`](fliplet-content.md) for more information on what features can be built with these helpers.

To build these features, create an instance with `Fliplet.Profile.Content()` and use the returned object to call the available methods.

```js
Fliplet.Profile.Content(dataSourceId)
```

* **dataSourceId** (Number) The data source ID where the content will be stored.

```js
Fliplet.Profile.Content(options)
```

* **options** (Object) A map of options to pass to the constructor.
  * **dataSourceId** (Number) The data source ID where the content will be stored.

## Methods

### `.create()`

(Returns **`Promise`**)

Create a content entry in the data source. The created entry is passed as the first parameter to the promise resolving function.

```js
.create(content [, options ])
```

* **content** (Object) An object containing the created content.
* **options** (Object) A map of additional options to pass to the method.
  * **settings** (Object) Additional settings that are stored against the content. This allows the content entry to store additional attributes specific for the user such as _bookmark name_ etc.
  * **action** (Object) An action object that will be passed to `Fliplet.Navigate.to()` when the content is opened via a shared URL. This ensures the user is shown the correct page in an app and in the correct state.
  * **public** (Boolean) If `true`, a `publicSlug` property will be available in the returned entry. (**Default**: `false`)

### `.query()`

(Returns **`Promise`**)

Query for content entries. The result entries are passed as the first parameter to the promise resolving function.

```js
.query([ options ])
```

* **options** (Object) A map of options to pass to the method.
  * **content** (Object) An object containing the content to query for. This can use JSON-based queries.
  * **settings** (Object) An object containing the settings to query for. This can use JSON-based queries.
  * **action** (Object) An object containing the action to query for. This can use JSON-based queries.

### `.update()`

(Returns **`Promise`**)

Update existing entries with new data.

#### Notes

* `options.id` or `options.content` must be passed to query for the entries to be updated.

```js
.update(data, options)
```

* **data** (Object) An object containing the new data to be stored, including one or more of the following properties.
  * **content** (Object) The existing `content` will be replaced by the provided `content` with a new hash created.
  * **settings** (Object) The existing `settings` will be replaced by the provided `settings`.
  * **action** (Object) The existing `action` will be replaced by the provided `action`.
  * **public** (Boolean) Use this property to turn on/off public visibility of the sharead content
* **options** (Object) A map of options to pass to the method.
  * **id** (Number) ID for the data source entry to be updated.
  * **content** (Object) An object containing the content to match for updating. This can use JSON-based queries.

### `.delete()`

(Returns **`Promise`**)

Delete existing entries.

```js
.delete(options)
```

* **options** (Object) A map of options to pass to the method.
  * **id** (Number) ID for the data source entry to be deleted.
  * **content** (Boolean) An object containing the content to match for deleting. This can use JSON-based queries.

## Related

* [`Fliplet.Profile.Content()`](fliplet-profile-content.md)

[Back to API documentation](../API-Documentation.md)
{: .buttons}
