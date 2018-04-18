# `Fliplet.Social.Share()`

(Returns **`Object`**)

The `fliplet-social` package contains helpers to manage shared content using data sources.

When content is shared using `Fliplet.Social.Share`, the share record is stored in a data source. This can be used to aggregate all the content being shared via different users, screens and apps.

A **share** can be used to create features such as:

* Saving a search configuration
* Bookmarking a page/directory entry
* Liking a piece of content with a thumb-up
* etc.

To use the share features, create an instance with `Fliplet.Social.Share()` and use the returned object to call the available methods.

```js
Fliplet.Social.Share(dataSourceId)
```

* **dataSourceId** (Number) The data source ID where the shared content will be recorded.

```js
Fliplet.Social.Share(options)
```

* **options** (Object) A map of options to pass to the constructor.
  * **dataSourceId** (Number) The data source ID where the shared content will be recorded.

## Examples

### Share a page with a URL

```js
var share = Fliplet.Social.Share({dataSourceId: 2});
share.create({
  pageId: 3
}, {
  public: true
}).then(function(entry){
  entry.publicSlug; // return the slug that can be used for sharing via a http://apps.fliplet.com/r/{{slug}} URL
});
```

### Count number of times a directory entry is shared

```js
var share = Fliplet.Social.Share({dataSourceId: 2});
share.query({
  content: {
    pageId: 3282,
    dataSourceEntryId: 5234,
  },
  fromAllUsers: true
}).then(function(rows){
  rows; // returns all the data source entries related to the specified shared content
});
```

## Methods

### `.create()`

(Returns **`Promise`**)

Create a share entry in the data source. The created entry is passed as the first parameter to the promise resolving function.

```js
.create(content [, options ])
```

* **content** (Object) An object containing the content shared. A hash will be created based on this content to help identify and group similar and related contents that are shared.
* **options** (Object) A map of additional options to pass to the method.
  * **settings** (Object) Additional settings that are stored against the shared content. This will not attribute towards the content hash, which allows the shared entry to store additional attributes such as _bookmark name_ etc.
  * **action** (Object) An action object that will be passed to `Fliplet.Navigate.to()` when the shared content is opened. This ensures the user is shown the correct page in an app and in the correct state.
  * **public** (Boolean) If `true`, a `publicSlug` property will be available in the returned entry. (**Default**: `false`)

### `.query()`

(Returns **`Promise`**)

Query for shared content entries. The result entries are passed as the first parameter to the promise resolving function.

```js
.query([ options ])
```

* **options** (Object) A map of options to pass to the method.
  * **content** (Object) An object containing the content to query for. Only matching content will be returned.
  * **fromAllUsers** (Boolean) If `true`, returns shared entries from all users. Otherwise, only entries that belong to the current user will be returned. (**Default**: `false`)

### `.update()`

(Returns **`Promise`**)

Update existing entries with new data.

#### Notes

* Only entries created by the user can be updated.
* `options.id` or `options.content` must be passed to query for the entries to be updated.

```js
.update(data, options)
```

* **data** (Object) An object containing the new data to be stored, including one or more of the following properties.
  * **content** (Object) The existing `content` will be replaced by the provided `content` with a new hash created.
  * **settings** (Object) The existing `settings` will be replaced by the provided `settings`.
  * **action** (Object) The existing `action` will be replaced by the provided `action`.
* **options** (Object) A map of options to pass to the method.
  * **id** (Number) ID for the data source entry to be updated.
  * **content** (Object) An object containing the content to match for updating.
  * **public** (Boolean) Use this property to turn on/off public visibility of the sharead content

### `.delete()`

(Returns **`Promise`**)

Delete existing entries with new data.

```js
.delete(options)
```

* **options** (Object) A map of options to pass to the method.
  * **id** (Number) ID for the data source entry to be deleted.
  * **content** (Boolean) An object containing the content to match for deleting.
