# communicate REST APIs

The communicate REST APIs allows you to interact and make any sort of change to your app's communicate.

<p class="warning"><strong>Note:</strong> This RESTful API is intended to be used by 3rd party software such as external integrations. <strong>If you're using this in a Fliplet App, please use the <a href="/API/fliplet-communicate.html">communicate JS APIs</a> instead.</strong></p>

## Authentication

Please head to the [how to authenticate](authenticate.md) page of the documentation to read more about how you can authorize your client to make API requests to Fliplet.

---

## App communicate

When dealing with app communicate, there's a few things you should keep in mind:
  to add


## Endpoints

### Send an email

Use our APIs to send an email to one or more recipients. Note that this feature is rate limited and improper use will result in your account being flagged for suspension.

#### `POST;/v1/communicate/email`

Sample request body:

```json

{
  "data": {
    "title": "New article",
    "message": "John posted an article."
  },
  "scope": { "Email": "nick@example.org" },
  "pushNotification": {
    "payload": {
      "title": "New article",
      "body": "John has posted a new article on the news page. Go check it out!"
    }
  }
}
```

You can also target many people at once using any [Sift.js](https://github.com/Fliplet/sift.js) operator for the scope, e.g.:

```json
{
  "data": {
    "title": "Greetings",
    "message": "Hi John and Nick!."
  },
  "scope": {
    "Email": {
      "$in": ["nick@example.org", "john@example.org"]
    }
  }
}
```

---

### send Batch Emails

Use our APIs to send batch of email to one or more recipients. Note that this feature is rate limited and improper use will result in your account being flagged for suspension.You need to pass emails with array of object as shown below.

#### ``POST;/v1/communicate/email/batch`

Required parameters:
- **emails** (array of json object)

Sample request body:

```json

{
    "emails": [
        {
            "to": [
                {
                    "email": "john@example.com",
                    "type": "to"
                }
            ],
            "html": "<p>Hi John 1</p>",
            "subject": "My subject",
            "from_name": "Example Name",
            "headers": {
              "Reply-To": "message.reply@example.com"
            },
            "attachments": [],
            "images": []
        },
        {
            "to": [
                {
                    "email": "john@example.com",
                    "type": "to"
                }
            ],
            "html": "<p>Hi John Doe</p>",
            "subject": "My subject",
            "from_name": "Example Name",
            "headers": {
              "Reply-To": "message.reply@example.com"
            },
            "attachments": [],
            "images": []
        }
    ]
}

```

You can also target many people at once using any [Sift.js](https://github.com/Fliplet/sift.js) operator for the scope, e.g.:

```json
{
  "data": {
    "title": "Greetings",
    "message": "Hi John and Nick!."
  },
  "scope": {
    "Email": {
      "$in": ["nick@example.org", "john@example.org"]
    }
  }
}

```

---
### Send an SMS

Use our APIs to send an sms to one or more recipients. Note that this feature is rate limited and improper use will result in your account being flagged for suspension.

#### `POST;/v1/communicate/sms`

Sample request body:

```json

{
  "provider": "twilio",
  "data": {
    "from": "+123456789",
    "to": "+123456789",
    "body": "Hey!"
  },
  "options": {
    "twilio_sid": 'AC81caaa94b3b84bb7ba9c3cd96bcb152a', // Your Account SID from www.twilio.com/console
    "twilio_auth_token": 'AUTH_TOKEN'                 // Your Auth Token from www.twilio.com/console
  }
}
```

---

### send Batch SMS

Use our APIs to send batch of SMS to one or more recipients. Note that this feature is rate limited and improper use will result in your account being flagged for suspension.You need to pass emails with array of object as shown below.

#### ``POST;/v1/communicate/sms/batch`

Required parameters:
- **sms** (array of json object)

Sample request body:

```json
{
"sms" : [{
  "provider": "twilio",
  "data": {
    "from": "+123456789",
    "to": "+123456789",
    "body": "Hey!"
  },
  "options": {
    "twilio_sid": 'AC81caaa94b3b84bb7ba9c3cd96bcb152a', // Your Account SID from www.twilio.com/console
    "twilio_auth_token": 'AUTH_TOKEN'                  // Your Auth Token from www.twilio.com/console
  }
},
{
  "provider": "twilio",
  "data": {
    "from": "+123456789",
    "to": "+987654321",
    "body": "Hey!"
  },
  "options": {
    "twilio_sid": 'AC81caaa94b3b84bb7ba9c3cd96bcb152a', // Your Account SID from www.twilio.com/console
    "twilio_auth_token": 'AUTH_TOKEN'                  // Your Auth Token from www.twilio.com/console
  }
}]
}

---