---
title: AJAX cross-domain and cross-origin requests
description: "How Fliplet apps handle AJAX cross-domain requests, common CORS errors, and the studio and app domains allowed by default."
type: how-to
tags: [ajax, cross, domain]
v3_relevant: true
deprecated: false
---

# AJAX cross-domain and cross-origin requests

How Fliplet apps handle AJAX requests to external domains, the CORS errors you may hit, and the studio/app domains allowed by default.

This can usually be spotted with an error message from the browser such as below:

```
XMLHttpRequest cannot load. No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This is because Fliplet apps make AJAX requests from the following domains:

**Fliplet Studio**

  * `https://studio.fliplet.com/*`
  * `https://api.fliplet.com/*`
  * `https://us.api.fliplet.com/*` (For US customers)
  * `https://ca.api.fliplet.com/*` (For CA customers)

**Web apps**

  * `https://apps.fliplet.com/*` (For EU customers)
  * `https://us-apps.fliplet.com/*` (For US customers)
  * `https://ca-apps.fliplet.com/*` (For CA customers)

**Native apps**

  * `file://*`

If the requested resource or service is not set up to support cross-domain requests, AJAX requests will likely fail.

If you encounter this issue, there are usually 3 ways to resolve it, depending on how much access or control you have over the requested resource.

## 1. Configure the requested resource to allow Fliplet's app domains

Service providers sometimes allow you to define domains that can use their APIs. You can find at the top of the page a list of domains that are used. However, because native apps use the `file://*` protocol and does not contain any specific domain, we recommend setting the service provider to allow all domains if possible. This is often done by setting the allowed domains using the character `*`.

## 2. Configure the service with an `Access-Control-Allow-Origin` header

Similar to the first method, the responses from the requested resource should contain an `Access-Control-Allow-Origin` header. The value of which could be a list of domains such as `http://domain1.example, http://domain2.example`. For reasons mentioned above, we recommend setting it as `*` if possible.

## 3. Use a proxy service

A proxy service acts as an intermediary for requests from the requester to the requested resource. The request to the requested resource is therefore made via a server and not via a web page, which bypasses the AJAX cross domain restriction. You can either use an existing proxy service or create your own.

{: .buttons}
