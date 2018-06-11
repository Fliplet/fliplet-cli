# Advanced features for the iOS platform

## Targeting iOS devices 

Fliplet uses `Modernizr` to expose boolean flags which can help you targeting a specific platform when writing Javascript code for your apps:

```js
if (Modernizr.ios) {
  // code here will only run on iOS devices
}

if (Fliplet.Env.is('native')) {
  // code here will run on Android, iOS and Windows devices but not on web
}
```

---

## Manually creating a P12 certificate for AAB

If you're using Fliplet Automated App Build system with an Apple Enterprise account and want to manually provide your certificate, we will need its P12 key. Please follow [this](aab/create-p12-certificate.md) steps to generate one with your Apple account.

[How to generate a P12 certificate](aab/create-p12-certificate.md)
{: .buttons}

---

[Back to home](README.md)
{: .buttons}