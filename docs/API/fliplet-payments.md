# `Fliplet.Payments`

Adds payments functionality in your apps.

<p class="warning"><strong>Note:</strong> This documentation is a draft subject to change before release.</p>

---

Dependencies: `fliplet-payments`

## Data models and key concepts

Adding payments to your apps has the following three requirements:

1. An app is configured to use payments, including adding the required **settings and secrets** which are securely stored in our backend.
2. A **Data Source** is created with a specific structure to manage the list of products you want the app users to be able to buy.
3. **Custom code** is added in your app screen to let users buy the products and complete the **checkout process** using our simple JS APIs.

To start setting up payments for your app, add `fliplet-payments` to your app or screen dependencies.

### Configure the payment settings

An app must first configure its payment settings before users are able to buy products. Configuring the app is done by making a JS API or RESTful API request including the following information:

- `provider`: `string` - the payment provider; we currently only support `stripe` as value
- `providerPublicKey`: `string` - the public key for the provider
- `providerPrivateKey`: `string` - the private key for the provider
- `productsDataSourceId`: `number` - the ID of the Data Source listing the products your users can buy

<p class="quote"><strong>Note:</strong> the following request must be made only once and from an authenticated Studio user.</p>

```js
// Run this once while logged in as a Studio user
Fliplet.Payments.Configuration.update({
  provider: 'stripe',
  providerPublicKey: 'foo',
  providerPrivateKey: 'bar',
  productsDataSourceId: 123
}).then(function (result) {
  // Configuration has been set successfully.
  // Your app is ready to start checkout sessions.
});
```

Once configuration has been set up, you can start to configure your data source with the products you want to list.

---

### Configure the products

Use the "App data" section of Fliplet Studio or the Data Sources JS APIs to manage a list of products for users to buy. Each product requires the following information:

- Name: `string`
- Price: `float`
- Price ID: `string` // TODO: confirm

Here's an example Data Source containing a few products:

| Name         | Description              | Price | Price ID |
|--------------|--------------------------|-------|----------|
| Premium plan | A fancy premium plan     | 1.00  | 123      |
| Gold plan    | A even fancier gold plan | 2.50  | 456      |

Once you have set up one or more products you're ready to start accepting payments in your app.

---

### Add code to initiate a checkout session

Our JS APIs allow your apps to read the list of products you have configured and then initiate a checkout process for one of your products.

You want to first read the list of products, then let the user choose one (and its quantity) and then initiate a checkout session.

These are the two JS APIs you need to use to achieve what has been described above:

- `Fliplet.Payments.getProducts()` - fetch the list of products you have configured in the data source
- `Fliplet.Payments.checkout(productId, quantity, options)` - initiate a checkout session to let the user buy a product

Here's a full example to help you getting started:

```js
// Get the list of products
Fliplet.Payments.getProducts().then(function (products) {

  // Choose the first product
  const product = _.first(products);

  // Initiate a checkout session to the payment provider
  Fliplet.Payments.checkout(product.id, quantity, {
    // Additional options for the payment provider.
    // Refer to the Stripe documentation for the list
    // of available options you can use.
    description: 'Buy the premium plan for the app'
  }).then(function onCheckoutCompleted(response) {
    // The checkout session has been completed.
    // The user was successfully charged for the product.

    // response.customerId
    // response.transactionDetails
  }, function onCheckoutFailed(err) {
    // The checkout session has been canceled
    // or could not be completed
  })
})
```

---

### Retrieve the list of payment-related events for a user

Some providers are capable of returning a list of events made for a specific customer, including a list of successfull and failed charges. You can use the following JS API to retrieve a list of all logs generated for a customer:

```js
Fliplet.Payments.Logs.get({
  customerId: 123
}).then(function (logs) {
  // Use logs here
});
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}