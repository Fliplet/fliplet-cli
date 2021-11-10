---
description: If you’re integrating your app or service with Fliplet APIs, you should be mindful in relation to how frequent your requests are hitting our APIs. Our infrastructure is set up to automatically throttle down and rate limit requests depending on how frequently they are made.
---

# Rate limiting for APIs

If you're integrating your app or service with Fliplet APIs, you should be mindful in relation to how frequent your requests are hitting our APIs.

Our infrastructure is set up to automatically throttle down and rate limit requests depending on how frequently they are made.

These limits can apply to a specific device, all users of your app or your entire organisation.

These are a few examples of rate limits we currently allow on a per-user basis:

- **Data Source APIs**: up to 200 requests every 10 seconds
- **Communicate APIs**: up to 20 requests every 30 seconds
- **Audit logs APIs**: up to 30 requests every 10 seconds
- **App Actions**: up to 60 runs per minute (*for the entire app*)

If you get rate limited, our APIs will return a `429` status code with a message similar to this:

```json
{
  "message":"You've made too many attempts in a short period of time, please try again in a few seconds. Read more about rate limiting and how you may be affected by reading our documentation.",
  "referenceUrl":"https://developers.fliplet.com/Rate-limiting-for-API.html",
  "nextValidRequestDate":"2021-02-15T17:13:32.363Z"
}
```

When that happens, you should review the integration you have put together and make the necessary changes to ensure you don't hit these limits.

<p class="quote">Note: <strong>both JS APIs and RESTful APIs</strong> are subject to our standard rate limiting as outlined above.</p>

As a rule of thumb, avoid making requests inside loops, e.g. if you are updating data source entries in short succession you should rewrite your code to [commit changes at once](https://developers.fliplet.com/API/fliplet-datasources.html#commit-changes-at-once-to-a-data-source) using a single [API request](https://developers.fliplet.com/REST-API/fliplet-datasources.html#post-v1data-sourcesdatasourceidcommit).