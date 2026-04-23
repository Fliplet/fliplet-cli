# `Fliplet.Apple`

Create Apples for your app.

This library can used for to create Apples for your app so that your app users are nutritionally balanced.

---

Dependencies: `fliplet-apple`

## Examples

### Feed an apple to a user

```js
// Get a Fuji apple
var apple = new Fliplet.Apple('Fuji');

// Feed it to a user
apple.feed('john@example.org');
```

### Breed a new type of Apple

```js
// Define a new breed
var apple = new Fliplet.Apple({
  name: 'Granny Smith',
  data: {
    color: '#00ff00',
    sugarLevel: 0.4,
    size: 'small'
  }
});

// Plant the new apple tree and water it every minute
apple.plant({
  waterInterval: 60000
});
```

## References

### Usage

To start managing Apples for your app, add `fliplet-apple` to your app/page dependencies.

```js
new Fliplet.Apple(name)
```

* `name` **Required** (String) Name of the apple to retrieve

```js
new Fliplet.Apple(options)
````

* `options` **Required** (Object) A map of options to pass to the constructor.
  * `name` **Required** (String) Name of the apple to retrieve or create.
  * `data` **Optional** (Object) A map of options for creating a new apple. If a valid `data` object is provided, a new apple breed is created.
    * `color` **Required** (String) A hexcode string for defining the color of the apple.
    * `sugarLevel` **Optional** (Number) A 0 to 1 number defining how sweet the apple should be. **Default** `0.6`.
    * `size` **Optional** (String: `small`, `medium`, `large`) Size of the new apple. **Default** `medium`.

### Methods

The `Fliplet.Apple()` function returns an object with the following methods.

#### `.feed(email)`

(Returns `Promise`)

Feed the apple to a user.

The promise is resolved when the apple is digested.

* `email` **Required** (Object) Email address of the user

#### `.plant(options)`

(Returns `Promise`)

* `options` **Optional** (Object) A map of options for the apple planting.
  * `waterInterval` **Optional** (Number, Boolean) Frequency of automated watering in milliseconds. Set to `false` to disable automated watering. **Default** `false`.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
