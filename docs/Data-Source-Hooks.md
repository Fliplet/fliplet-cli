# Data Source Hooks

Data Source hooks allow your app's backend to perform certain operations such as **sending emails** or **push notifications** when certain conditions occurr, e.g. inserting or updating a Data Source Entry.

**Please note**: hooks do not run when data is inserted or saved via the "App data" section in **Fliplet Studio**.

## Required properties to all hooks

Each hook requires the following properties:

- `type`: `email`, `sms`, `web`, `push` or `operations`
- `runOn`: an array with any of the following values: `insert`, `update`, `beforeSave`, `beforeQuery`
- `conditions`: an array of objects defining match conditions to be satisfied in order to trigger the hook

---

## Hook conditions

Hooks can specify an array of objects to define a list of matching conditions that should be satisfied in order to trigger the hook. Each object supports [Sift.js](https://github.com/Fliplet/sift.js) operators as well as simple string equality matching.

See the example below where we have set up a hook to automatically add a column named "Approved" to a data source entry when it is added given the Email column has a Fliplet domain:

```json
[
  {
    "type": "operations",
    "runOn": [ "insert" ],
    "payload": {
      "Approved": "Yes"
    },
    "conditions": [
      {
        "Email": {
          "$regex": ".+@fliplet.com$"
        }
      }
    ]
  }
]
```


## Hook types

### Send a push notification

In addition to hook properties, configuring a hook to send push notifications support the following parameters:

- `appId`: the target Fliplet App ID
- `payload`: object with `title` and `body` for the push notification; this supports **Handlebars** syntax for variable replacement in the values as shown in the first example below
- `filter`: object describing conditions for the users that should receive the push notification as shown in the second example below

The following example sends a push notification to all users subscribed to app `123` when a Data Source Entry gets updated and its **Status** column has value *"Published"*.

{% raw %}
```json
[
  {
    "type": "push",
    "appId": 123,
    "runOn": [ "update" ],
    "payload": {
      "title": "An item has been published: {{{Title}}}",
      "body": "{{{Description}}}"
    },
    "conditions": [
      { "Status": "Published" }
    ]
  }
]
```
{% endraw %}

Let's take a look at a more complex example where push notifications are only sent to users having their **Notifications** field matching with the **Category** of the Data Source Entry being inserted:

{% raw %}
```json
[
  {
    "type": "push",
    "appId": 123,
    "runOn": [ "insert" ],
    "payload": {
      "title": "New item: {{{Title}}}",
      "body": "Receiving this because you subscribed to {{{Category}}}"
    },
    "filter": {
      "match": { "Notifications": "{{Category}}" },
      "dataSourceId": 456
    }
  }
]
```
{% endraw %}

---

### Send an email

In addition to hook properties, configuring a hook to send emails support the following parameter:

- `payload`: object with `to`, `html` and `subject` for the email; this supports **Handlebars** syntax for variable replacement in the values as shown in the first example below.

{% raw %}
```json
[
  {
    "type": "email",
    "runOn": ["insert"],
    "payload": {
      "to": [
        { "type": "to", "email": "john@example.org", "name": "John" },
        { "type": "cc", "email": "nick@example.org", "name": "Nick" }
      ],
      "html": "<h1>Enquiry</h1><p>A form submission has been received from {{Name}}</p>",
      "subject": "Form enquiry received"
    }
  }
]
```
{% endraw %}

---

### Send an SMS

In addition to hook properties, configuring a hook to send SMS support the following parameter:

- `payload`: object with `to` and `body` for the SMS; this supports **Handlebars** syntax for variable replacement in the values as shown in the first example below.

{% raw %}
```json
[
  {
    "type": "sms",
    "runOn": ["insert"],
    "payload": {
      "to": "+123456789",
      "body": "Hi {{ fullName }}, thanks for signing up!"
    }
  }
]
```
{% endraw %}

---

### Make a network request

In addition to hook properties, configuring a hook to make network requests supports the following parameter:

- `payload`: object with `method`, `endpoint`, `body` and `headers` for the HTTP(S) network request; this supports **Handlebars** syntax for variable replacement in the values as shown in the example below.

{% raw %}
```json
[
  {
    "type": "web",
    "runOn": ["insert"],
    "payload": {
      "method": "POST",
      "endpoint": "https://example.org/apis/user-signup",
      "body": {
        "user_full_name": "{{ fullName }}"
      },
      "headers": {
        "X-Foo": "Bar"
      }
    }
  }
]
```
{% endraw %}

---

### Manipulate a string

In addition to hook properties, configuring a hook to manipulate strings support the following parameter:

- `payload`: object where each key represents the field name to run the operation on, and the value is either a string value or an array of operations to run.

If the value is a `string`, the result will compiled through Handlebars so you can replace any variable at runtime. See the examples below for more information.

On the other hand, when the value is an `array` it can be a list of operations that should be applied to the field:

- `trim`: removes leading and trailing whitespaces from a string
- `lower`: transforms a string to lowercase
- `upper`: transforms a string to uppercase
- `hash`: hashes a string, e.g. a password to be secured

Here's an example where the field named "Password" will be hashed before saving it:

{% raw %}
```json
[
  {
    "type": "operations",
    "runOn": ["beforeSave"],
    "payload": { "Password": ["hash"] }
  }
]
```
{% endraw %}

And one more example where one field gets trimmed and converted to lowercase while the second field is converted to uppercase:

{% raw %}
```json
[
  {
    "type": "operations",
    "runOn": ["beforeSave"],
    "payload": {
      "Email": ["lower", "trim"],
      "Name": ["upper"]
    }
  }
]
```
{% endraw %}

This last example shows string interpolation being compiled with Handlebars:

{% raw %}
```json
[
  {
    "type": "operations",
    "runOn": ["beforeSave"],
    "payload": {
      "Content": "Foo bar",
      "AnotherContent": "Foo {{ email }}"
    }
  }
]
```
{% endraw %}
