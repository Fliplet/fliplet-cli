---
name: fliplet-data-sources
description: Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.
---

# Fliplet data sources

Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.

## Documentation

- [Data Source joins](https://developers.fliplet.com/API/datasources/joins.md): Fetch related rows from multiple data sources in a single query using named joins, like SQL joins.
- [Data Sources query operators](https://developers.fliplet.com/API/datasources/query-operators.md): Filter Data Source queries with MongoDB/Sift operators ($eq, $gt, $in, $regex, $and, $or) inside connection.find() where clauses.
- [Data source security examples](https://developers.fliplet.com/API/datasources/security-examples.md): Pair public, shared, private, profile and role-based access rules with data shapes and allowed and denied SDK operations.
- [Data source security rule reference](https://developers.fliplet.com/API/datasources/security-rules.md): Access rule evaluation, trusted identity, requirement targets, column restrictions and custom script behavior.
- [Testing data source security in preview](https://developers.fliplet.com/API/datasources/testing-security.md): Verify allowed and denied data source operations as authenticated app users with Studio preview security enforcement enabled.
- [Data Source views](https://developers.fliplet.com/API/datasources/views.md): Define named, session-aware filters on a data source so each user or group sees only the rows that apply to them.
- [Fliplet.DataSources](https://developers.fliplet.com/API/fliplet-datasources.md): Connect to, query, insert, update, and delete records in Fliplet Data Sources from inside an app. All methods are promise-based.
- [Fliplet infrastructure data flow](https://developers.fliplet.com/Data-flow.md): Architecture diagram showing how data flows between Fliplet Studio, Fliplet servers, app clients, and connected data sources.
- [Data Source Hooks](https://developers.fliplet.com/Data-Source-Hooks.md): Trigger emails, SMS, push notifications, web requests, or column operations on Data Source insert/update/beforeSave/beforeQuery using Sift.js match conditions.
- [Securing Fliplet data sources](https://developers.fliplet.com/Data-source-security.md): Configure data source access rules and verify allowed and denied operations as authenticated app users.
- [Securing Fliplet files and folders](https://developers.fliplet.com/File-security.md): Secure files and folders in your Fliplet apps with access rules and custom JavaScript security rules.

## How to load full content

The URLs above are raw `.md` and can be fetched directly. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
