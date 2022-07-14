---
description: Configure your app screens to run scheduled or ad-hoc operation in the cloud and perform various automations.
---

# App Actions

The **App Actions** library allows you to configure app screens to run automatically at a scheduled time or carry out an ad-hoc operations and automations in the cloud.

![How it works](/assets/img/app-actions.png)

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

1. An app action consists in a unique `name`, a target `pageId` (the screen to run) and optional `frequency` and `timezone`.
2. An app action can be created as **scheduled** (when using the `frequency` parameter) or to be run **on-demand**.
3. Only **up to 5 app** actions can be defined for each app.
4. An app action runs the target app screen in the cloud. A result can be given back by the screen both when running on a schedule and when on-demand.
5. An app action is **limited to 30 seconds of execution time**. After 30 seconds, the action will be killed and a specific timeout error will be returned and saved in the logs.
6. The payload for on-demand actions is **limited to 2048 characters**.
7. The result sent from an on-demand app action is **limited to 6MB**.
8. Only JavaScript assets are loaded when the screen runs as an app action. Assets such as CSS and images will be ignored by the system.
9. Scheduled app actions will only run the published version of a screen, whereas on-demand actions will run the version from the same environment they are fired from (e.g. Fliplet Viewer, Live apps  )

---

## Configuring the target screen

<p class="warning"><strong>[Required]</strong> Before you create an app action, <strong>your target app screen must be configured</strong> as described below to ensure it's ready to process inbound requests made by the app action when running on a schedule or on-demand.</p>

When a screen is executed by an app action, a special function called `onRemoteExecution` is going to be fired by the system. You want to put your custom code needing to run on the app action within such function and return the result of your execution. If your function throws an error, such error is going to be included in the produced log.

To start, use the `Fliplet.Page.onRemoteExecution()` function to register your custom JavaScript code to run when the screen is being fired by an app action:

```js
// Add this code to the screen JavaScript code
// in the developer options of Fliplet Studio
Fliplet.Page.onRemoteExecution(function (payload) {
  // This code will run when the screen is triggered by an app action.

  console.log('App action sent this payload', payload);

  // Here you can return the result to be send back to the user (if running an on-demand action)
  // or stored in the produced log.

  // You can also return a promise if the result to be returned is async.
  return Promise.resolve({ a: 1, b: 2 });
});
```

That's simply it! Once you have added the above handler to the target screen you're ready to create your first app action.

---

## Creating an app action

Use the `create` JS API to create an app action. These are the supported parameters:

- `name` (String) a name for the action. Only numbers, letters, dashes and underscores are supported (e.g. `hello-world-123`)
- `pageId` (Number) the target screen ID
- `active` (Boolean) whether the action should be enabled (for scheduled actions only)
- `timezone` (Optional String) [the timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. "America/Phoenix"
- `frequency` (Optional String) the "cron expression" to run the action periodically on a given schedule (e.g. `0 5 * * *`). See example frequency below:

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

<p class="warning">The timezone for the frequency can be defined via the <code>timezone</code> parameter using the <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank">full name of the zone</a>, e.g. "Europe/Dublin".</p>

Example timezones:

- America/Los_Angeles
- America/New_York
- Europe/Dublin
- Europe/London
- Europe/Rome

### Create a scheduled action

Once you have figured out what frequency to use, use the `create` JS API to create the action:

```js
Fliplet.App.Actions.create({
  name: 'send-monday-weekly-reminder',
  frequency: '0 8 * * 1',
  timezone: 'Europe/Rome',
  active: true,
  pageId: 123
}).then(function (action) {
  // Task has been created and scheduled to run every Monday morning at 8am
});
```

---

### Create an on-demand action

<p class="warning"><strong>Note</strong>: if you only want to <strong>run your action on-demand</strong> (e.g. triggered by a user) make sure not to use the frequency parameter as shown below.</p>

```js
// Create an action that is manually run by you
Fliplet.App.Actions.create({
  name: 'confirm-booking',
  pageId: 456
}).then(function (action) {
  // On-demand action has been created
});
```

---

## Run an on-demand action

If you have created an app action without a specific schedule, you can use the `run` and `runWithResult` functions to run your action:

```js
// Run an action in asynchronous mode
Fliplet.App.Actions.run('confirm-booking');

// Run an action in asynchronous mode with an
// input payload to be sent to the screen.
Fliplet.App.Actions.run('confirm-booking', {
  FirstName: 'Nick',
  Date: '2021-06-15'
}).then(function () {
  // The action has been queued for processing.
  // No result is given back.
});

// Run an action synchronously with an input payload
// and retrieve back the result
Fliplet.App.Actions.runWithResult('email-is-registered', {
  Email: 'john@example.org'
}).then(function (result) {
  // This example assumes your result returns a "isRegistered" property
  if (result.isRegistered) {
    // ....
  }
});
```

<p class="quote">Rate limiting: please note that app actions are rate limited and can run <strong>up to 60 times per minute for the entire app</strong>. The limit does not apply to scheduled tasks. Please get in touch with our team for more details.</p>

<p class="quote">Payload size limit: please note that the input payload for app actions is limited to <strong>2048 characters</strong>.</p>

As a further note, app actions do not save their result in the produced log entry when running on-demand.

---

## Get the list of app actions

Use the `get` method to fetch the list of app actions you have created. Each action will contain a `lastRunAt` and `nextRunAt` timestamps to help you figuring out when the action has run the last time and when it's scheduled to be run.

```js
return Fliplet.App.Actions.get().then(function (actions) {
  actions.forEach(function (action) {
    console.log(action);
  });
});
```

Here is a sample of the array of actions returned:

```json
[
  {
    "id": 1,
    "name": "send-monday-weekly-reminder",
    "active": true,
    "frequency": "*/2 * * * *",
    "timezone": "Europe/Dublin",
    "lastRunAt": "2021-07-21T12:32:02.495Z",
    "nextRunAt": "2021-07-21T12:34:00.000Z",
    "createdAt": "2021-07-20T09:29:00.366Z",
    "updatedAt": "2021-07-20T09:29:00.366Z",
    "appId": 123,
    "pageId": 456
  }
]
```

---

## Get the logs for an action

Each time n runs a new log record gets generated in our backend. You can access such logs for one of all actions:

```js
// Fetch the last 50 completed and failed action results
Fliplet.App.Actions.getLogs().then(function (response) {
  // response.count
  // response.logs

  console.log(response.logs);
});

// Fetch the last 10 failed action logs for just one action, given its ID
Fliplet.App.Actions.getLogs({
  id: 123,
  limit: 10,
  where: { type: 'app.task.failed' }
}).then(function (response) {
  console.log(response.logs);
});
```

Sample logs:

```json
[
  {
    "id": 1,
    "createdAt": "2021-07-21T12:36:02.663Z",
    "type": "app.action.completed",
    "data": {
      "mode": "on-demand",
      "duration": 2000,
      "pageId": 456,
      "actionId": 1
    }
  },
  {
    "id": 2,
    "createdAt": "2021-07-21T12:36:02.663Z",
    "type": "app.task.completed",
    "data": {
      "mode": "scheduled",
      "duration": 3000,
      "pageId": 456,
      "actionId": 1,
      "result": { "a": 1 }
    }
  },
  {
    "id": 3,
    "createdAt": "2021-07-21T12:36:02.663Z",
    "type": "app.task.failed",
    "data": {
      "mode": "scheduled",
      "duration": 5000,
      "pageId": 456,
      "actionId": 1,
      "result": {
        "errorType": "Error",
        "errorMessage": "Error: Evaluation failed: TypeError: Cannot read property 'sendEmail' of undefined...",
        "trace": ["..."]
      }
    }
  }
]
```

---

## Update an action

Use the `update` JS API with the input action `id` or `name` to update any property of the action (among `pageId`, `name`, `frequency` and `active`):

```js
Fliplet.App.Actions.update('confirm-booking', {
  pageId: 456
}).then(function (action) {
  // Task has been updated
});
```

---

## Temporarily deactivate a scheduled action

Simply update an action as `active: false` to temporarily disable the current scheduling for an action:

```js
// Temporarily deactivate a scheduled action
Fliplet.App.Actions.update('send-monday-weekly-reminder', {
  active: false
}).then(function (action) {
  // Task has been deactivated
});
```

---

## Delete an action

Use the `remove` JS API with the input action `id` or `name` to delete an action.

```js
Fliplet.App.Actions.remove('confirm-booking').then(function () {
  // Task has been removed
});
```

---

## Troubleshooting

### Whitelist inbound requests from App Actions

If you're using an app action to make requests to your server you may need to whitelist the IP address that our infrastructure uses to make inbound requests to your systems. Please use the relevant IP for your region:

- Canadian customers: `3.98.9.146`
- European customers: `52.212.7.119`
- US customers: `54.151.38.62`