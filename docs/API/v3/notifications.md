---
title: V3 notifications
description: Send in-app and push notifications from V3 apps through authorized server-side App Actions.
type: guide
tags: [js-api, v3, notifications]
v3_relevant: true
deprecated: false
package: fliplet-notifications
namespace: Fliplet.Notifications
category: communications
capabilities: [notification, push notification, in-app notification, scheduled notification, badge count, read receipt, notifications inbox, broadcast notification]
notes: "In V3, browser code invokes a server-side App Action to create, publish, or schedule notifications. The Action verifies the caller and permitted audience before using Fliplet.Notifications."
---

# V3 notifications

For new V3 features, create, publish, and schedule in-app or push notifications inside a server-side App Action. Browser code may invoke that Action, but must not use app-token REST or JS APIs to send directly. The Action checks whether the caller may send and selects the permitted audience; never accept an arbitrary recipient or broadcast scope from the browser.

See [Send communications from a server Action](../core/app-actions-v3#send-communications-from-a-server-action) for the caller and recipient checks. Apply the same checks before using `Fliplet.Notifications` to send. Add `fliplet-notifications` to the Action's dependencies.

Direct browser sends still work in existing V3 apps during migration; they are an unprotected pattern for new V3 features and a V3-wide block is planned for a later release. Reading notifications, marking them as read, and managing the device's push subscription are unaffected. The [shared Notifications API reference](../fliplet-notifications) retains these methods and the V2 send examples.
