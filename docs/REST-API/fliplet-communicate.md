# Communicate REST APIs

The Communicate REST APIs allows you to interact and make any sort of change to your app's communicate.

<p class="warning"><strong>Note:</strong> This RESTful API is intended to be used by 3rd party software such as external integrations. <strong>If you're using this in a Fliplet App, please use the <a href="/API/fliplet-communicate.html">Communicate JS APIs</a> instead.</strong></p>

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

Required parameters:
- **to** (array of recipients for "to", "cc" or "bcc")

Optional parameters:
- **subject** (string, subject of the email)
- **from_name** (string, the sender's name)
- **html** (string, HTML string for the email body)
- **headers** (json object containing "key:value" object with headers to add to the email (most headers are allowed). We recommend using `X-*` prefixes to any custom header, e.g. `X-My-Custom-Header: "value"`)
- **attachments** (array of attachments with `type` (the MIME type), `content` (String or Buffer), `name` (the filename including extension) and optional `encoding` (base64, hex, binary, etc))
- **required** (Set to `true` to cache the request if the device is offline. When the device comes online, the cached requests will be sent. Default: `false`)

Sample request body:

```json

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
  }
```

---

### Send batch emails

Use our APIs to send batch of email to one or more recipients. Note that this feature is rate limited and improper use will result in your account being flagged for suspension.You need to pass emails with array of object as shown below.

#### `POST;/v1/communicate/email/batch`

Parameters:
- **emails** (array of json object)
    - Parameters for each object inside **emails** array
        - Required parameters:
            - **to** (array of recipients for "to", "cc" or "bcc")
        - Optional parameters:
            - **subject** (string, subject of the email)
            - **from_name** (string, the sender's name)
            - **html** (string, HTML string for the email body)
            - **headers** (json object containing "key:value" object with headers to add to the email (most headers are allowed). We recommend using `X-*` prefixes to any custom header, e.g. `X-My-Custom-Header: "value"`)
            - **attachments** (array of attachments with `type` (the MIME type), `content` (String or Buffer), `name` (the filename including extension) and optional `encoding` (base64, hex, binary, etc))
            - **required** (Set to `true` to cache the request if the device is offline. When the device comes online, the cached requests will be sent. Default: `false`)

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

### send batch SMS

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
