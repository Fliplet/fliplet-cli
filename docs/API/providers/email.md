# Email provider

**Package**: `com.fliplet.email-provider`

## Overview

The **Email provider** allows users to provide information for email templates such that emails can be sent via Fliplet's `Fliplet.Communicate.sendEmail()` JS API ([reference](../../API/fliplet-communicate.html#send-an-email)).

## Usage

```js
var provider = Fliplet.Widget.open('com.fliplet.email-provider', {
  data: {
    options: {
      subject: 'Greetings',
      html: '<p>Hi, how are you?</p>',
      headers: {
        'Reply-To': 'admin@email.com'
      },
      to: [
        {
          email: 'alice@email.com',
          name: 'Alice',
          type: 'to'
        },
        {
          email: 'bob@email.com'
          type: 'cc'
        }
      ]
    }
  }
});
```

## Parameters

The following parameters can be passed to `Fliplet.Widget.open()` using `data` as shown above.

* `subject` (String) Email subject.
* `html` (String) Email body.
* `headers` (Object) Object of header values to be included.
  * `Reply-To` (String) Set the Reply-To email address.
* `to` (Array) List of email recipients. Each item supports the following parameters.
  * `email` (String) **Required** Email address
  * `name` (String) Name of recipient
  * `type` (String) **Required** Type of recipient. Possible values include: `to`, `cc`, `bcc`
* `hideTo` (Boolean) Set to `true` to hide the To field
* `hideCC` (Boolean) Set to `true` to hide the CC field
* `hideBCC` (Boolean) Set to `true` to hide the BCC field
* `hideReplyTo` (Boolean) Set to `true` to hide the ReplyTo field
* `hideSubject` (Boolean) Set to `true` to hide the Subject field
* `hideBody` (Boolean) Set to `true` to hide the Body field

## Return value

The `provider` object resolves with an object representing the email configuration.

**Example**

```js
provider.then(function(result) {
  console.log('Email template:', result.data);
});
```

---

[Back to Providers](../../components/Using-Providers.html)
{: .buttons}
