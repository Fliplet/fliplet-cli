# Communicate JS APIs

The `fliplet-communicate` package contains the following namespaces:

- [Communicate](#communicate)

---

## Communicate

### Send an email

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

### Send a SMS

#### Default provider
```js
const options = {
  data: {
    to: "+123456789",
    body: "Hey!"
  }
};

Fliplet.Communicate.sendSMS(options);
```

##### Twilio
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

Let us know if you want to use another SMS provider.
We'll check if we can integrate it on our system.
