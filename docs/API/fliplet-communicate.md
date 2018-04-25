# Communicate JS APIs

The `fliplet-communicate` package contains the namespace `Fliplet.Communicate` and a set of helper methods for sending communications from the app.

- [`.sendEmail()`](#send-an-email) - Sends an HTML formatted email
- [`.sendSMS()`](#send-an-sms) - Sends an SMS message
- [`.composeEmail()`](#compose-an-email) - Composes an email on the device
- [`.shareURL()`](#share-a-url) - Share a URL 

## Send an email

```js
const options = {
  to: [{
    email: "john@example.org",
    name: "John",
    type: "to"
  }],
  html: "<p>Some HTML content</p>",
  subject: "My subject"
};

Fliplet.Communicate.sendEmail(options);
```

## Send an SMS

### Default provider
```js
const options = {
  data: {
    to: "+123456789",
    body: "Hey!"
  }
};

Fliplet.Communicate.sendSMS(options);
```

### Twilio

```js
const options = {
  provider: "twilio"
  data: {
    from: "+123456789"
    to: "+123456789",
    body: "Hey!"
  },
  options: {
    twilio_sid: 'AC81caaa94b3b84bb7ba9c3cd96bcb152a', // Your Account SID from www.twilio.com/console
    twilio_auth_token: 'AUTH_TOKEN';                  // Your Auth Token from www.twilio.com/console
  }
};

Fliplet.Communicate.sendSMS(options);
```

Let us know if you require to use another SMS provider and we'll check whether we can integrate it on our system.

## Compose an email

```js 
// TBC
```

## Share a URL

```js 
Fliplet.Communicate.shareURL('https://maps.google.com/?addr=N1+9PF');
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
