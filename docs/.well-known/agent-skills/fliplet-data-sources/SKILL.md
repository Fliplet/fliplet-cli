---
name: fliplet-data-sources
description: Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.
---

# Fliplet data sources

Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.

## Documentation

- [Data Source joins](https://developers.fliplet.com/API/datasources/joins.html): Fetch related rows from multiple data sources in a single query using named joins, like SQL joins.
- [Data Sources query operators](https://developers.fliplet.com/API/datasources/query-operators.html): Filter Data Source queries with MongoDB/Sift operators ($eq, $gt, $in, $regex, $and, $or) inside connection.find() where clauses.
- [Data Source views](https://developers.fliplet.com/API/datasources/views.html): Define named, session-aware filters on a data source so each user or group sees only the rows that apply to them.
- [Fliplet.DataSources](https://developers.fliplet.com/API/fliplet-datasources.html): Connect to, query, insert, update, and delete records in Fliplet Data Sources from inside an app. All methods are promise-based.
- [Fliplet infrastructure data flow](https://developers.fliplet.com/Data-flow.html): Architecture diagram showing how data flows between Fliplet Studio, Fliplet servers, app clients, and connected data sources.
- [Data Source Hooks](https://developers.fliplet.com/Data-Source-Hooks.html): Trigger emails, SMS, push notifications, web requests, or column operations on Data Source insert/update/beforeSave/beforeQuery using Sift.js match conditions.
- [Securing Fliplet data sources](https://developers.fliplet.com/Data-source-security.html): Secure your Data Sources with access rules, data requirements, and custom JavaScript security rules.
- [Securing Fliplet files and folders](https://developers.fliplet.com/File-security.html): Secure files and folders in your Fliplet apps with access rules and custom JavaScript security rules.

## How to load full content

Replace `.html` with `.md` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
