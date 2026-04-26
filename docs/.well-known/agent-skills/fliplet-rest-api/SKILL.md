---
name: fliplet-rest-api
description: Server-side REST API for managing organizations, apps, users, data sources, files, and screens from your own backend.
---

# Fliplet REST API

Server-side REST API for managing organizations, apps, users, data sources, files, and screens from your own backend.

## Documentation

- [Rate limiting for APIs](https://developers.fliplet.com/Rate-limiting-for-API.html): Fliplet rate-limits Data Source, Communicate, audit-log, AI, and App Action APIs per user; back off on 429 responses and batch writes via the commit endpoint.
- [Fliplet REST API documentation](https://developers.fliplet.com/REST-API-Documentation.html): Index of Fliplet REST endpoints for Data Sources, Media, Notifications, Apps, and more — intended for third-party integrations.
- [Authenticating with the Fliplet REST APIs](https://developers.fliplet.com/REST-API/authenticate.html): Authenticate Fliplet REST API requests via Auth-token header, Authorization Bearer (base64), query string, or cookie against EU, US, or CA endpoints.
- [App Analytics REST API](https://developers.fliplet.com/REST-API/fliplet-app-analytics.html): The App Analytics REST API lets you read your app's analytics data.
- [App Subscriptions REST API](https://developers.fliplet.com/REST-API/fliplet-app-subscriptions.html): The App Subscriptions REST API lets you read and manage your app's users subscribed via push notifications.
- [Apps REST API](https://developers.fliplet.com/REST-API/fliplet-apps.html): The Apps REST API lets external integrations list, read, create, update, and delete Fliplet apps that the auth token has access to.
- [Communicate REST API](https://developers.fliplet.com/REST-API/fliplet-communicate.html): The Communicate REST API lets external integrations send emails and SMS from a Fliplet app, subject to per-account rate limits.
- [Data Sources REST API](https://developers.fliplet.com/REST-API/fliplet-datasources.html): The Data Sources REST API lets external integrations read and modify the data sources belonging to a Fliplet app or organization.
- [Media REST API](https://developers.fliplet.com/REST-API/fliplet-media.html): The Media REST API lets external integrations upload, list, and manage media files and folders scoped to a Fliplet app or organization.
- [Notifications REST API](https://developers.fliplet.com/REST-API/fliplet-notifications.html): The Notifications REST API lets external integrations create, schedule, and publish in-app and push notifications to Fliplet app users.
- [Organizations REST API](https://developers.fliplet.com/REST-API/fliplet-organizations.html): The Organizations REST API lets external integrations read audit logs and manage resources belonging to a Fliplet organization.

## How to load full content

Replace `.html` with `.md` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
