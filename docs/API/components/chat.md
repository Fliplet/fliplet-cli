# Chat

## Query parameters

Use the following query parameter when linking to a screen with chat.

* `contactConversation` (Number) Set it to the data source entry id of the user you want to start a conversation with.

### Example 1

```
?contactConversation=3467
```

## Default users in user directory

By default the chat component will list all the users from a data source in the users directory.

If you want to list only selected users in the directory, add a column to your users data source, add a column named `flDefaultChatUser` and write an `X` for each users that you would like listed in the user directory.

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}