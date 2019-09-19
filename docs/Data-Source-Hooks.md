# Data Source Hooks

Data Source hooks allow your app's backend to perform certain operations such as **sending emails** or **push notifications** when certain conditions occurr, e.g. inserting or updating a Data Source Entry.

**Please note**: hooks do not run when data is inserted or saved via the "App data" section in **Fliplet Studio**.

## Required properties

Each hook requires the following properties:

- `type`: `email`, `push` or `operations`
- `runOn`: an array with any of the following values: `insert`, `update`, `beforeSave`, `beforeQuery`
- `conditions`: an array of objects defining match conditions to be satisfied in order to trigger the hook

---

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

- `payload`: object with `to`, `html` and `subject` for the email; this supports **Handlebars** syntax for variable replacement in the values as shown in the first example below

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

### Manipulate a string

In addition to hook properties, configuring a hook to manipulate strings support the following parameter:

- `payload`: object where each key represents the field name to run the operation on, and the value is an array of operations to run.

Here's the list of operations that can be applied to a field:

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
