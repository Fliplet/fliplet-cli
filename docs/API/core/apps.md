# Apps

### Get the list of apps the user has got access to

```js
Fliplet.Apps.get().then(function (apps) {
  console.log(apps);
});
```

**Note**: when returning apps, the API will return both **V1** and **V2** apps created with Fliplet. Most likely, you want to filter and use V2 apps only. This can be done by filtering out apps where the boolean `app.legacy` is `true`.