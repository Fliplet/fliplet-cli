---
title: V3 communications
description: Send email and SMS from V3 apps through authorized server-side App Actions.
type: guide
tags: [js-api, v3, communicate]
v3_relevant: true
deprecated: false
package: fliplet-communicate
namespace: Fliplet.Communicate
category: communications
capabilities: [email, send email, sms, send sms, batch email, batch sms, share url, share link, sendgrid, twilio, mailgun, compose email, mailto]
notes: "In V3, browser code invokes a server-side App Action for email or SMS sends. The Action verifies the caller and permitted recipients before using Fliplet.Communicate."
---

# V3 communications

For new V3 features, send email and SMS inside a server-side App Action. Browser code may invoke that Action, but must not call the app-token send REST or JS APIs directly. The Action decides whether the caller may perform the operation and derives permitted recipients from trusted server data. For in-app and push notifications, see [V3 notifications](notifications).

See [Send communications from a server Action](../core/app-actions-v3#send-communications-from-a-server-action) for a complete example with a manual trigger, verified caller, and recipient lookup. Add `fliplet-communicate` to the Action's dependencies when it uses `Fliplet.Communicate`.

Direct browser email and SMS sends still work in existing V3 apps during migration; they lack feature-specific authorization and a V3-wide block is planned for a later release. `Fliplet.Communicate.sendPushNotification()` already requires app publisher or editor access. This guidance does not affect composing an email on the device or sharing a URL. The [shared Communicate API reference](../fliplet-communicate) retains those methods and the V2 send examples.
