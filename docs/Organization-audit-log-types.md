# List of audit log types for organizations

Please see below a table with a recap of all available log types for organization audit logs. Logs can be fetched either using the [JS API](/API/core/organizations.html#audit-logs) or [RESTful API](/REST-API/fliplet-organizations.html#get-the-audit-logs-for-an-organization).


## Logs from Fliplet Studio & Fliplet Viewer

| Section                     | Type                               | Description                                                           |
|-----------------------------|------------------------------------|-----------------------------------------------------------------------|
| Authentication              | user.login                         | User logs in                                                          |
| Authentication              | user.login.first                   | User logs in for the first time                                       |
| Authentication              | user.login.failed                  | User failed to log in                                                 |
| Authentication              | user.login.sso                     | User log in via SSO                                                   |
| Authentication              | user.logout                        | User logs out                                                         |
| User activity               | studio.analytics.presence          | User has accessed Studio                                              |
| User management             | user.update                        | User updated its details                                              |
| User management             | user.password.update               | User updates its password                                             |
| User management             | user.twofactor.add                 | User adds 2FA to his account                                          |
| User management             | user.twofactor.remove              | User removes 2FA from his account                                     |
| User management             | user.session.remove                | A session was manually revoked                                        |
| Organization management     | organization.create                | The organisation was created                                          |
| Organization management     | organization.user.create           | A user was created by an org admin                                    |
| Organization management     | organization.user.invite           | A user was invited by an org admin                                    |
| Organization management     | organization.user.delete           | A user was deleted by an org admin                                    |
| Organization management     | organization.user.update           | A user was updated by an org admin                                    |
| Organization management     | organization.user.unblock          | A user was unblocked by an org admin                                  |
| Organization management     | organization.user.twofactor.remove | A user twofactor was removed by an org admin                          |
| Organization management     | organization.user.app.create       | Access to apps for a user was updated by an org admin                 |
| Organization management     | organization.user.app.update       | Access to apps for a user was updated by an org admin                 |
| Organization management     | organization.user.app.remove       | Access to apps for a user was updated by an org admin                 |
| App management              | app.create                         | An app was created or cloned (bounds to target new app)               |
| App management              | app.remove                         | An app was moved to the bin                                           |
| App management              | app.delete                         | An app was deleted                                                    |
| App management              | app.clone                          | An app was cloned (this is a record bound to the source app)          |
| App management              | app.publish                        | An in-app update was published                                        |
| App management              | app.publish.web.create             | An app was launched on web                                            |
| App management              | app.publish.web.update             | An app 's slug was changed (e.g. launched on web or slug changed)     |
| App management              | app.publish.web.remove             | An app was unpublished from web                                       |
| App management              | app.settings.update                | App settings were updated                                             |
| App management              | app.widget.create                  | An app add-on was enabled                                             |
| App management              | app.widget.update                  | An app component (including themes) was updated                       |
| App management              | app.widget.delete                  | An app add-on was  disabled                                           |
| App management (AAB)        | app.submission.build               | Requested app build via Studio (AAB)                                  |
| App AAB                     | app.submission.report              | App build is completed via AAB                                        |
| App Screens management      | app.page.create                    | A screen was created                                                  |
| App Screens management      | app.page.update                    | A screen was updated                                                  |
| App Screens management      | app.page.remove                    | A screen was moved to the bin                                         |
| App Screens management      | app.page.restore                   | A screen was restored from the bin                                    |
| App Screens management      | app.page.delete                    | A screen was deleted                                                  |
| App Screens management      | app.page.layout.update             | A screen layout (HTML) was updated                                    |
| App Screens management      | app.page.settings.update           | A screen settings were updated                                        |
| App Screens management      | app.page.settings.remove           | A screen settings were removed                                        |
| App Screens management      | app.page.rollback                  | A screen was restored to a previous version                           |
| App Screens management      | app.page.widget.create             | A screen component was created                                        |
| App Screens management      | app.page.widget.update             | A screen component was updated                                        |
| App Screens management      | app.page.widget.remove             | A screen component was removed from the screen                        |
| App Screens management      | app.pages.sort                     | Screens were sorted                                                   |
| App Access management       | app.user.create                    | A user was added to the app                                           |
| App Access management       | app.user.update                    | A user role was updated for the app                                   |
| App Access management       | app.user.remove                    | A user was removed from the app                                       |
| App Access management       | app.token.remove                   | An app token was removed                                              |
| Data Sources management     | dataSource.create                  | A data source was created (by a user)                                 |
| Data Sources management     | dataSource.update                  | The settings of a data source (including access rules) were changed   |
| Data Sources management     | dataSource.remove                  | A data source was moved to the bin                                    |
| Data Sources management     | dataSource.restore                 | A data source was restored                                            |
| Data Sources management     | dataSource.delete                  | A data source was deleted                                             |
| Data Sources management     | dataSource.rollback                | A data source was rolled back to a previous version                   |
| Data Sources management     | dataSource.commit                  | A data source entries were changed via the data source manager or DIS |
| Media Files management      | mediaFile.create                   | A media file was created (uploaded)                                   |
| Media Files management      | mediaFile.update                   | A media file was updated (e.g. moved to a new folder)                 |
| Media Files management      | mediaFile.remove                   | A media file was moved to the bin                                     |
| Media Files management      | mediaFile.restore                  | A media file was restored                                             |
| Media Files management      | mediaFolder.create                 | A media folder was created (uploaded)                                 |
| Media Files management      | mediaFolder.update                 | A media folder was updated (e.g. moved to a new folder)               |
| Media Files management      | mediaFolder.remove                 | A media folder was moved to the bin                                   |
| Media Folders management    | mediaFolder.restore                | A media folder was restored                                           |
| Widgets management          | widget.update                      | A widget was sync'd (uploaded or updated)                             |
| App Push notifications logs | pushNotification.send              | Push notifications were sent for the app                              |

---

## Logs from Fliplet Apps

| Section                     | Type                               | Description                                                           |
|-----------------------------|------------------------------------|-----------------------------------------------------------------------|
| Communication Audits        | sms.2fa                            | An SMS was sent because of 2FA login                                  |
| Communication Audits        | sms.communicate                    | An SMS was sent via JS APIs                                           |
| Communication Audits        | sms.dataSourceHook                 | An SMS was sent from a data source hook                               |
| Communication Audits        | sms.validate                       | An SMS was sent because of a data source login                        |
| Communication Audits        | email.communicate                  | An email was sent via JS APIs                                         |
| Communication Audits        | email.dataSourceHook               | An email was sent from a data source hook                             |
| Communication Audits        | email.validate                     | An email was sent because of a data source login                      |
| App analytics               | app.analytics.event                | Analytics event logged from app                                       |
| App analytics               | app.analytics.pageView             | Screen view logged from app                                           |
| App analytics               | app.update                         | An app user is requesting for in-app updates                          |
| App analytics               | app.view                           | Screen viewed from web app                                            |
| Data Sources                | dataSource.entry.create            | A data source entry was created                                       |
| Data Sources                | dataSource.entry.update            | A data source entry was updated                                       |
| Data Sources                | dataSource.entry.delete            | A data source entry was deleted                                       |
| Data Sources                | dataSource.event                   | A custom event on a data source (unused)                              |
| Media Files management      | mediaFile.create                   | A media file was created (uploaded)                                   |