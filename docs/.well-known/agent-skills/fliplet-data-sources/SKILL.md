---
name: fliplet-data-sources
description: Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.
---

# Fliplet data sources

Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.

## Documentation

- [Data Source file attachments](https://developers.fliplet.com/API/datasources/file-attachments.md): Attach files to Data Source entries with insert or update, handle upload constraints and distinguish file uploads from dataset imports.
- [Data Source joins](https://developers.fliplet.com/API/datasources/joins.md): Fetch related rows with named join configuration and read them from each record’s joins property.
- [Managing data sources](https://developers.fliplet.com/API/datasources/managing-data-sources.md): Source metadata, creation, configuration, deletion and Studio user roles, separate from app record access.
- [Offline Data Source database](https://developers.fliplet.com/API/datasources/offline-database.md): Read and modify native bundled Data Sources with Database handles, local collection methods, views, indexes, and explicit persistence boundaries.
- [Data Sources query operators](https://developers.fliplet.com/API/datasources/query-operators.md): Filter Data Source queries with MongoDB/Sift operators ($eq, $gt, $in, $regex, $and, $or) inside connection.find() where clauses.
- [Reading Data Source records](https://developers.fliplet.com/API/datasources/reading-data.md): Read records, filter and sort queries, paginate with cursors, and retrieve distinct column values with Fliplet.DataSources.
- [Data source security examples](https://developers.fliplet.com/API/datasources/security-examples.md): Pair public, shared, owner-filtered read, profile and role-based examples with data shapes and allowed and denied SDK operations.
- [Data source security rule reference](https://developers.fliplet.com/API/datasources/security-rules.md): Access rule evaluation, trusted identity, requirement targets, column restrictions and custom script behavior.
- [Data Source subscriptions](https://developers.fliplet.com/API/datasources/subscriptions.md): Subscribe to Data Source changes, handle entry payloads, and stop monitoring when a screen is hidden or removed.
- [Testing data source security in preview](https://developers.fliplet.com/API/datasources/testing-security.md): Verify allowed and denied data source operations as authenticated app users with Studio preview security enforcement enabled.
- [Data Source views](https://developers.fliplet.com/API/datasources/views.md): Request named filters that bind to the current login session. Views filter query results; access rules must enforce privacy independently.
- [Writing Data Source records](https://developers.fliplet.com/API/datasources/writing-data.md): Insert, update, delete and commit Data Source records with the correct input shapes, options, write outcomes and security limits.
- [Fliplet.DataSources](https://developers.fliplet.com/API/fliplet-datasources.md): Connect to Fliplet data sources and find references for queries, writes, subscriptions, native storage and source management.
- [Fliplet infrastructure data flow](https://developers.fliplet.com/Data-flow.md): Architecture diagram showing how data flows between Fliplet Studio, Fliplet servers, app clients, and connected data sources.
- [Data Source Hooks](https://developers.fliplet.com/Data-Source-Hooks.md): Trigger emails, SMS, push notifications, web requests, or column operations on Data Source insert/update/beforeSave/beforeQuery using Sift.js match conditions.
- [Securing Fliplet data sources](https://developers.fliplet.com/Data-source-security.md): Configure data source access rules and verify allowed and denied operations as authenticated app users.
- [Securing Fliplet files and folders](https://developers.fliplet.com/File-security.md): Secure files and folders in your Fliplet apps with access rules and custom JavaScript security rules.

## How to load full content

The URLs above are raw `.md` and can be fetched directly. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
