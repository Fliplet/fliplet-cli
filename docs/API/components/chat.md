# Chat

## Query parameters

Use the following query parameter when linking to a screen with chat.

* `contactConversation` (Number) Set it to the data source entry id of the user you want to start a conversation with.

### Example 1

```
?contactConversation=3467
```

## Default users in user directory

If you want to select the users to be shown in the directory, add a column to your users data source and name the column `flDefaultChatUser` and write an `X` on each of the users' row that should be listed in the users directory.

_By default the users directory in the chat component will display all the users from a data source._

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}