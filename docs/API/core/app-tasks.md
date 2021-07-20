---
description: Configure your app screens to run scheduled or ad-hoc operation in the cloud and perform various automations.
---

# App Tasks

The **App Tasks** library allows you to configure app screens to run automatically at a scheduled time or carry out an ad-hoc operations and automations in the cloud.

![How it works](/assets/img/app-tasks.png)

<p class="warning"><strong>Early preview</strong>: this feature is currently in internal preview and it's not available to all our customers yet. Please get in touch with us if you want to try an early preview of App Tasks.</p>

#### Sample use cases:

- Weekly reports on app usage via email
- Push notifications to users if users have a booking for today
- Importing RSS feeds daily & notifying users via push notifications when new items are found
- Automatically checkout all check-ins at midnight or on-demand
- Send weekly reminders for users to take update their working status
- Integration with 3rd party tools
- Return data based on user's rights

---

## Data models and key concepts

1. An app task consists in a unique `name`, a target `pageId` and an optional `frequency`.
2. An app task can be created as **scheduled** (when using the `frequency` parameter) or to be run on demand.
3. Only **up to 5 app** tasks can be defined for each app.
4. An app task runs the target app screen in the cloud. A result can be given back by the screen both when running on a schedule and when on demand.

---

## Configuring the target screen

<p class="quote"><strong>[Required]</strong> Before you create an app task, <strong>your target app screen must be configured</strong> to ensure it's ready to process inbound requests made by the app task when running on a schedule or on demand.</p>

To start, use the `Fliplet.Page.onRemoteExecution()` function to register your custom JavaScript code to run when the screen is being fired by an app task:

```js
// Add this code to the screen JavaScript code
// in the developer options of Fliplet Studio
Fliplet.Page.onRemoteExecution(function (payload) {
  console.log('App task sent this payload', payload);

  // This code will run when the screen is triggered by an app task.
  // You can return a promise if the result to be returned is async.
  return Promise.resolve({ a: 1, b: 2 });
});
```

That's simply it! Once you have added the above handler to the target screen you're ready to create your first app task.

---

## Creating an app task

Use the `create` JS API to create an app task. These are the supported parameters:

- `name` (String) a name for the task. Only numbers, letters, dashes and underscores are supported (e.g. `hello-world-123`)
- `pageId` (Number) the target screen ID
- `active` (Boolean) whether the task should be enabled (for scheduled tasks only)
- `frequency` (Optional String) the "cron expression" to run the task periodically on a given schedule (e.g. `0 5 * * *`). See example frequency below:

#### Frequency

```
  ┌───────────── minute (0 - 59)
  │ ┌───────────── hour (0 - 23)
  │ │ ┌───────────── day of the month (1 - 31)
  │ │ │ ┌───────────── month (1 - 12)
  │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
  │ │ │ │ │
  │ │ │ │ │
  │ │ │ │ │
  * * * * *
```

Here are a few examples for the frequency value:

| Frequency         | Description                                                                                            |
|-------------------|--------------------------------------------------------------------------------------------------------|
| `1 0 * * *`       | Run at one minute past midnight (00:01) every day                                                      |
| `0 * * * *`       | Run once an hour at the beginning of the hour	                                                         |
| `0 0 1 * *`       | Run once a month at midnight of the first day of the month	                                           |
| `0 0 * * 0`       | Run once a week at midnight on Sunday morning	                                                         |
| `45 23 * * 6`     | Run at 23:45 (11:45PM) every Saturday                                                                  |
| `*/5 1 * * *`     | Run every 5th minute of every first hour (i.e., 01:00, 01:05, 01:10, up until 01:55)                   |
| `0 0 1 1 *`       | Run once a year at midnight of 1 January	                                                             |

### Create a scheduled task

Once you have figured out what frequency to use, use the `create` JS API to create the task:

```js
Fliplet.App.Tasks.create({
  name: 'send-monday-weekly-reminder',
  frequency: '0 8 * * 1',
  active: true,
  pageId: 123
}).then(function (task) {
  // Task has been created and scheduled to run every Monday morning at 8am
});
```

---

### Create an on-demand task

<p class="warning"><strong>Note</strong>: if you only want to <strong>run your task on demand</strong> (e.g. triggered by a user) make sure not to use the frequency parameter as shown below.</p>

```js
// Create a task that is manually run by you
Fliplet.App.Tasks.create({
  name: 'confirm-booking',
  pageId: 456
}).then(function (task) {
  // On demand task has been created
});
```

---

## Run an on-demand task

If you have created an app task without a specific schedule, you can use the `run` and `runWithResult` functions to run your task:

```js
// Run a task in asynchronous mode
Fliplet.App.Tasks.run('confirm-booking');

// Run a task in asynchronous mode with an
// input payload to be sent to the screen.
Fliplet.App.Tasks.run('confirm-booking', {
  FirstName: 'Nick',
  Date: '2021-06-15'
}).then(function () {
  // The task has been queued for processing.
  // No result is given back.
});

// Run a task synchronously with an input payload
// and retrieve back the result
Fliplet.App.Tasks.runWithResult('email-is-registered', {
  Email: 'john@example.org'
}).then(function (result) {
  // This example assumes your result returns a "isRegistered" property
  if (result.isRegistered) {
    // ....
  }
});
```

---

## Get the list of app tasks

Use the `get` method to fetch the list of app tasks you have created. Each task will contain a `lastRunAt` and `nextRunAt` timestamps to help you figuring out when the task has run the last time and when it's scheduled to be run.

```js
return Fliplet.App.Tasks.get().then(function (tasks) {
  tasks.forEach(function (task) {
    console.log(task);
  });
});
```

---

## Get the logs for a task

Each time a task runs a new log record gets generated in our backend. You can access such logs for one of all tasks:

```js
// Fetch the last 50 completed and failed task results
Fliplet.App.Tasks.getLogs().then(function (response) {
  // response.count
  // response.logs

  console.log(response.logs);
});

// Fetch the last 10 failed task logs for just one task, given its ID
Fliplet.App.Tasks.getLogs({
  id: 123,
  limit: 10,
  where: { type: 'app.task.failed' }
}).then(function (response) {
  console.log(response.logs);
});
```

---

## Update a task

Use the `update` JS API with the input task `id` or `name` to update any property of the task (among `pageId`, `name`, `frequency` and `active`):

```js
Fliplet.App.Tasks.update('confirm-booking', {
  pageId: 456
}).then(function (task) {
  // Task has been updated
});
```

---

## Temporarily deactivate a scheduled task

Simply update a task as `active: false` to temporarily disable the current scheduling for a task:

```js
// Temporarily deactivate a scheduled task
Fliplet.App.Tasks.update('send-monday-weekly-reminder', {
  active: false
}).then(function (task) {
  // Task has been deactivated
});
```

---

## Delete a task

Use the `remove` JS API with the input task `id` or `name` to delete a task.

```js
Fliplet.App.Tasks.remove('confirm-booking').then(function () {
  // Task has been removed
});
```

---

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}