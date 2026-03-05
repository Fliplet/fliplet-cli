---
description: Write and run JavaScript code directly on the server or client to perform automations, scheduled tasks and on-demand operations.
---

# App Actions V3

**App Actions V3** lets you write raw JavaScript code that executes on the server or client. Unlike V2 function pipelines, V3 actions provide a simpler developer experience — write a single `execute(context)` function instead of building visual pipelines.

#### What's new in V3

- **Code-based**: Write raw JavaScript instead of configuring visual function pipelines
- **Flexible execution**: Run on server, client, or both (`any`)
- **Dependencies**: Specify Fliplet packages (e.g., `fliplet-datasources`) or external URLs
- **Scheduling**: Use cron expressions for scheduled execution
- **Triggers**: Execute on events like `manual`, `schedule`, `log`, or `analytics`

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

1. A V3 app action consists of a unique `name`, JavaScript `code` defining an `execute(context)` function, and optional `frequency`, `timezone`, `environment`, `triggers` and `dependencies`.
2. An app action can be created as **scheduled** (when using the `frequency` parameter) or to be run **on-demand**.
3. An app action can run on server when `environment` is set to `server` or `any`.
4. An app action can run on client side when `environment` is set to `client` or `any`.
5. An app action is **limited to 120 seconds of execution time**. After 120 seconds, the action will be killed and a specific timeout error will be returned and saved in the logs.
6. The payload for on-demand actions is **limited to 2048 characters**.
7. The result sent from an on-demand app action is **limited to 6MB**.
8. Scheduled app actions will only run the published version of an action, whereas on-demand actions will run the version from the same environment they are fired from (e.g. Fliplet Viewer, Live apps).
9. An action must have `active` set to `true` to be executed. Inactive actions will not run regardless of whether they are on-demand, scheduled, or triggered by events.

### Execution environments

| Environment | Description | Allowed Triggers |
|-------------|-------------|------------------|
| `server`    | Executes on server via Lambda/Puppeteer | `schedule`, `log`, `manual` |
| `client`    | Executes in user's browser | `analytics`, `manual` |
| `any`       | Can execute on both server and client | All triggers |

---

## Writing action code

The `code` field must contain a valid JavaScript function named `execute` that accepts a `context` parameter:

```js
async function execute(context) {
  // Your action logic here

  return {
    // Return value (accessible when using runWithResult)
  };
}
```

**Requirements:**

| Requirement | Description |
|-------------|-------------|
| Function name | Must be `execute` |
| Async | Must be declared as `async` function |
| Parameter | Must accept `context` as the first parameter |
| Return value | Should return a value/object (available via `runWithResult`) |
| Dependencies | Code using Fliplet APIs must include corresponding dependencies |

### Supported function formats

```js
// Traditional async function declaration
async function execute(context) {
  return { success: true };
}

// Arrow function with const
const execute = async (context) => {
  return { success: true };
};

// Arrow function with let
let execute = async (context) => {
  return { success: true };
};

// Async function expression
const execute = async function(context) {
  return { success: true };
};
```

### Context object

The `context` parameter provides access to the execution environment:

```js
async function execute(context) {
  // context.payload - Data passed when running the action
  const payload = context.payload;

  // Example: use payload data
  const dsId = payload.dsId;
  const connection = await Fliplet.DataSources.connect(dsId);
  const result = await connection.find();

  return {
    success: true,
    result: result
  };
}
```

### Example — Simple action

```js
async function execute(context) {
  return { message: 'Hello World', timestamp: Date.now() };
}
```

### Example — With Data Source

```js
async function execute(context) {
  const connection = await Fliplet.DataSources.connect(158);
  const result = await connection.find({
    where: context.payload.filters
  });

  return {
    success: true,
    count: result.length,
    result: result
  };
}
```

---

## Dependencies

If your action code uses Fliplet APIs, you must include the corresponding package in the `dependencies` array. Dependencies can be Fliplet package names or external URLs.

```js
dependencies: [
  'fliplet-datasources',
  'fliplet-media',
  'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js'
]
```

### Common Fliplet packages

| Package | Description |
|---------|-------------|
| `fliplet-datasources` | Data Sources API (`Fliplet.DataSources`) |
| `fliplet-media` | Media API (`Fliplet.Media`) |
| `fliplet-communicate` | Communication API (`Fliplet.Communicate`) |
| `fliplet-barcode` | Barcode API (`Fliplet.Barcode`) |
| `fliplet-audio` | Audio API (`Fliplet.Audio`) |
| `fliplet-csv` | CSV API (`Fliplet.CSV`) |
| `fliplet-encryption` | Encryption API (`Fliplet.Encryption`) |

<p class="warning"><strong>Note:</strong> When your code uses any of these Fliplet APIs, the corresponding package <strong>must</strong> be listed in the <code>dependencies</code> array. Failing to do so will result in a <code>CODE_VALIDATION_FAILED</code> error.</p>

---

## Action triggers

An action can be triggered as a result of a system event or manually. You can configure the triggers for an action using the `triggers` property.

| Trigger | Environments | Description |
|---------|-------------|-------------|
| `manual` | All | Triggered programmatically via the JavaScript API |
| `schedule` | `server`, `any` | Triggered by cron schedule |
| `log` | `server`, `any` | Triggered by app log events |
| `analytics` | `client`, `any` | Triggered by analytics events |

### Trigger configuration example

```js
triggers: [
  {
    trigger: 'manual'
  },
  {
    where: {
      data: {
        _pageId: 9535,
        _userEmail: 'user@email.com'
      }
      type: 'analytics.pageView'
    },
    trigger: 'analytics'
  }
]
```

---

## Create an action

Use the `Fliplet.App.V3.Actions.create()` JS API to create a V3 action. These are the supported parameters:

- `name` (String) a name for the action. Only numbers, letters, dashes and underscores are supported (e.g. `hello-world-123`). Max 255 characters.
- `code` (String) JavaScript code defining an `async function execute(context)` function
- `active` (Boolean) whether the action should be enabled. Default: `false`
- `environment` (Optional String) execution environment: `server`, `client`, or `any`. Default: `server`
- `triggers` (Optional Array) array of trigger configurations
- `dependencies` (Optional Array) Fliplet package names or external URLs
- `frequency` (Optional String) the "cron expression" to run the action periodically on a given schedule (e.g. `0 5 * * *`)
- `timezone` (Optional String) [the timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. "America/Phoenix"

### Frequency

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
| `0 * * * *`       | Run once an hour at the beginning of the hour                                                          |
| `0 0 1 * *`       | Run once a month at midnight of the first day of the month                                             |
| `0 0 * * 0`       | Run once a week at midnight on Sunday morning                                                          |
| `45 23 * * 6`     | Run at 23:45 (11:45PM) every Saturday                                                                  |
| `*/5 1 * * *`     | Run every 5th minute of every first hour (i.e., 01:00, 01:05, 01:10, up until 01:55)                   |
| `0 0 1 1 *`       | Run once a year at midnight of 1 January                                                               |

<p class="warning">The timezone for the frequency can be defined via the <code>timezone</code> parameter using the <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank">full name of the zone</a>, e.g. "Europe/Dublin".</p>

Example timezones:

- America/Los_Angeles
- America/New_York
- Europe/Dublin
- Europe/London
- Europe/Rome

### Create a scheduled action

```js
Fliplet.App.V3.Actions.create({
  name: 'send-monday-weekly-reminder',
  code: `async function execute(context) {
    const connection = await Fliplet.DataSources.connect(158);
    const entries = await connection.find();

    // Send reminder logic here...

    return { success: true, count: entries.length };
  }`,
  active: true,
  environment: 'server',
  frequency: '0 8 * * 1',
  timezone: 'Europe/Rome',
  triggers: [{ trigger: 'schedule' }],
  dependencies: ['fliplet-datasources']
}).then(function (result) {
  // result.action - The created action
  // Action is scheduled to run every Monday morning at 8am
});
```

### Create an on-demand action

<p class="warning"><strong>Note</strong>: if you only want to <strong>run your action on-demand</strong> (e.g. triggered by a user) make sure to use the <code>manual</code> trigger as shown below.</p>

```js
Fliplet.App.V3.Actions.create({
  name: 'confirm-booking',
  code: `async function execute(context) {
    const connection = await Fliplet.DataSources.connect(158);
    await connection.update(context.payload.entryId, {
      Status: 'Confirmed',
      ConfirmedBy: context.payload.name
    });

    return { success: true };
  }`,
  active: true,
  environment: 'server',
  triggers: [{ trigger: 'manual' }],
  dependencies: ['fliplet-datasources']
}).then(function (result) {
  // On-demand action has been created
});
```

### Create an action with a log trigger

<p class="warning"><strong>Note:</strong> the <code>log</code> trigger can only be executed on the <strong>server side</strong>.</p>

```js
Fliplet.App.V3.Actions.create({
  name: 'send-new-user-email',
  code: `async function execute(context) {
    // context.payload contains the log entry that triggered the action
    const logEntry = context.payload;

    return { success: true, logType: logEntry.type };
  }`,
  active: true,
  environment: 'server',
  triggers: [
    {
      trigger: 'log',
      where: {
        type: 'dataSource.entry.create',
        dataSourceId: 177
      }
    }
  ]
}).then(function (result) {
  // Action will run when a new entry is created in data source 177
});
```

### Create a client-side action with analytics trigger

<p class="warning"><strong>Note:</strong> the <code>analytics</code> trigger can only be executed on the <strong>client side</strong>.</p>

```js
Fliplet.App.V3.Actions.create({
  name: 'track-page-visit',
  code: `async function execute(context) {
    console.log('Page visited', context.payload);
    return { tracked: true };
  }`,
  active: true,
  environment: 'client',
  triggers: [
    {
      trigger: 'analytics',
      where: {
        type: 'analytics.pageView',
        data: {
          _pageId: 77
        }
      }
    }
  ]
}).then(function (result) {
  // Action will run when page 77 is visited
});
```

---

## Run an on-demand action

If you have created an app action with a `manual` trigger, you can use the `run` and `runWithResult` functions to execute it. You can pass an action `name` or `id` as the first parameter:

```js
// Run an action in asynchronous mode (fire and forget)
Fliplet.App.V3.Actions.run('confirm-booking');

// Run an action with an input payload
Fliplet.App.V3.Actions.run('confirm-booking', {
  entryId: 123,
  name: 'Nick'
}).then(function () {
  // The action has been queued for processing.
  // No result is given back.
});

// Run an action synchronously and retrieve back the result
Fliplet.App.V3.Actions.runWithResult('confirm-booking', {
  entryId: 123,
  name: 'Nick'
}).then(function (result) {
  // result contains the return value from the execute() function
  if (result.success) {
    // ...
  }
});

// Run by action ID
Fliplet.App.V3.Actions.runWithResult(12345, { entryId: 123 }).then(function (result) {
  // ...
});
```

<p class="quote">Rate limiting: please note that the run action endpoint is limited to <strong>30 requests per minute</strong>. Please get in touch with our team for more details.</p>

<p class="quote">Payload size limit: please note that the input payload for app actions is limited to <strong>2048 characters</strong>.</p>

---

## Get the list of app actions

Use the `get` method to fetch the list of V3 app actions you have created:

```js
Fliplet.App.V3.Actions.get().then(function (result) {
  // result.actions - Array of actions
  // result.pagination - Pagination info

  result.actions.forEach(function (action) {
    console.log(action);
  });
});

// With pagination options
Fliplet.App.V3.Actions.get({
  limit: 10,
  offset: 0
}).then(function (result) {
  // result.actions
  // result.pagination.total
  // result.pagination.hasMore
});
```

Here is a sample of the action object returned:

```json
{
  "id": 12345,
  "appId": 67890,
  "name": "my-action",
  "code": "async function execute(context) { ... }",
  "active": true,
  "environment": "server",
  "actionVersion": "v3",
  "triggers": [{"trigger": "manual"}],
  "dependencies": ["fliplet-datasources"],
  "assets": [
    {
      "name": "fliplet-datasources",
      "url": "https://cdn.fliplet.com/assets/fliplet-datasources/1.0/datasources.js",
      "path": "assets/fliplet-datasources/1.0/datasources.js"
    }
  ],
  "frequency": null,
  "timezone": null,
  "lastRunAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Get a single action

Use the `getById` method to retrieve a single V3 action by its ID:

```js
Fliplet.App.V3.Actions.getById(12345).then(function (result) {
  // result.action - The action object
  console.log(result.action);
});
```

---

## Update an action

Use the `update` JS API with the action `id` to update any property of the action (among `name`, `code`, `active`, `environment`, `triggers`, `dependencies`, `frequency` and `timezone`):

<p class="warning"><strong>Note:</strong> You cannot update a published action. You must update the master action and republish it.</p>

```js
Fliplet.App.V3.Actions.update(12345, {
  name: 'confirm-booking-updated',
  code: `async function execute(context) {
    return { updated: true };
  }`,
  active: true,
  environment: 'server',
  triggers: [{ trigger: 'manual' }],
  dependencies: []
}).then(function (result) {
  // result.action - The updated action
});
```

---

## Temporarily deactivate an action

Simply update an action as `active: false` to temporarily disable the current scheduling for an action:

```js
Fliplet.App.V3.Actions.update(12345, {
  active: false
}).then(function (result) {
  // Action has been deactivated
});
```

---

## Delete an action

Use the `remove` JS API with the action `id` to delete an action. If the action is published, its production version will also be deleted.

<p class="warning"><strong>Note:</strong> You cannot delete a production action directly. Delete the master action instead, which will also remove the production version.</p>

```js
Fliplet.App.V3.Actions.remove(12345).then(function () {
  // Action has been removed
});
```

---

## Publish an action

Use the `publish` JS API to publish an action to production. Only published actions will run in the live app. The app must be published first before you can publish an action.

```js
Fliplet.App.V3.Actions.publish(12345).then(function (result) {
  // result.action - The published production action
});
```

---

## Unpublish an action

Use the `unpublish` JS API to remove an action from production. The action will stop running in the live app.

```js
Fliplet.App.V3.Actions.unpublish(12345).then(function () {
  // Action has been unpublished
});
```

---

## Get the logs for an action

Each time an action runs a new log record gets generated in our backend. You can access such logs for one or all actions:

```js
// Fetch the last 50 action logs
Fliplet.App.V3.Actions.getLogs().then(function (response) {
  // response.count
  // response.logs

  console.log(response.logs);
});

// Fetch the last 10 logs for a specific action
Fliplet.App.V3.Actions.getLogs({
  id: 12345,
  limit: 10
}).then(function (response) {
  console.log(response.logs);
});
```

---

## Error responses

All error responses follow this format:

```json
{
  "status": "ERROR_STATUS_CODE",
  "error": "Human-readable error message"
}
```

### Validation errors

| Status | Description |
|--------|-------------|
| `NAME_REQUIRED` | Action name is required |
| `NAME_EMPTY` | Action name cannot be empty |
| `NAME_TOO_LONG` | Name exceeds 255 characters |
| `NAME_INVALID_CHARS` | Name contains invalid characters (only letters, numbers, dashes and underscores allowed) |
| `NAME_ALREADY_EXISTS` | Name already used by another action in this app |
| `CODE_REQUIRED` | Code is required for V3 actions |
| `CODE_EMPTY` | Code cannot be empty |
| `CODE_VALIDATION_FAILED` | Code failed validation (missing execute function or missing dependencies) |
| `ENVIRONMENT_INVALID` | Invalid environment value |
| `FREQUENCY_INVALID` | Invalid cron expression |
| `FREQUENCY_TOO_FREQUENT` | Cannot run every minute |
| `TIMEZONE_INVALID` | Invalid timezone |
| `TRIGGERS_INVALID` | Triggers must be an array |
| `TRIGGER_TYPE_INVALID` | Invalid trigger type |
| `TRIGGER_NOT_ALLOWED` | Trigger not allowed for the given environment |
| `DEPENDENCIES_INVALID` | Invalid dependencies |

### Operational errors

| Status | Description |
|--------|-------------|
| `ACTION_NOT_FOUND` | Action not found |
| `ACTION_NOT_V3` | Action exists but is not a V3 action |
| `CANNOT_UPDATE_PRODUCTION` | Cannot update a published action directly |
| `CANNOT_DELETE_PRODUCTION` | Cannot delete a production action directly |
| `CLIENT_ACTION_NOT_RUNNABLE` | Client-only actions cannot run on server |
| `ACTION_INACTIVE` | Cannot run an inactive action |
| `APP_NOT_PUBLISHED` | App must be published before publishing an action |
| `ACTION_NOT_PUBLISHED` | Action is not published |
| `EXECUTION_FAILED` | Action execution failed |
| `PUBLISH_FAILED` | Failed to publish action |

---

## Rate limits

| Operation | Limit |
|-----------|-------|
| CRUD operations (get, create, update, delete) | 60 requests / 60 seconds |
| Run action | 30 requests / 60 seconds |
| Publish / Unpublish | 10 requests / 60 seconds |

---

## JS API methods summary

| Method | Description |
|--------|-------------|
| `Fliplet.App.V3.Actions.get(options)` | List actions with pagination |
| `Fliplet.App.V3.Actions.getById(id)` | Get a single action |
| `Fliplet.App.V3.Actions.create(data)` | Create a new action |
| `Fliplet.App.V3.Actions.update(id, data)` | Update an action |
| `Fliplet.App.V3.Actions.remove(id)` | Delete an action |
| `Fliplet.App.V3.Actions.run(nameOrId, payload)` | Run action (fire and forget) |
| `Fliplet.App.V3.Actions.runWithResult(nameOrId, payload)` | Run action and wait for result |
| `Fliplet.App.V3.Actions.runWithTriggerSource(trigger, eventData)` | Run actions matching a trigger |
| `Fliplet.App.V3.Actions.publish(id)` | Publish to production |
| `Fliplet.App.V3.Actions.unpublish(id)` | Remove from production |
| `Fliplet.App.V3.Actions.getLogs(options)` | Get execution logs |
| `Fliplet.App.V3.Actions.clearCache()` | Clear cached data |

---

## Troubleshooting

### Whitelist inbound requests from App Actions

If you're using an app action to make requests to your server you may need to whitelist the IP address that our infrastructure uses to make inbound requests to your systems. Please use the relevant IP for your region:

- Canadian customers: `3.98.9.146`
- European customers: `52.212.7.119`
- US customers: `54.151.38.62`
