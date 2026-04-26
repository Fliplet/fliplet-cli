---
name: fliplet-js-api
description: The Fliplet client-side JavaScript API: every Fliplet.X namespace (Storage, User, Navigate, Profile, Communicate, Media, Notifications, UI, ...).
---

# Fliplet JavaScript API (Fliplet.*)

The Fliplet client-side JavaScript API: every Fliplet.X namespace (Storage, User, Navigate, Profile, Communicate, Media, Notifications, UI, ...).

## Documentation

- [JS API Documentation](https://developers.fliplet.com/API-Documentation.html): Index of Fliplet's JavaScript APIs (Core, Data Sources, Media, UI, Communicate) for working with apps, screens, users, and components from custom code.
- [Accordion component](https://developers.fliplet.com/API/components/accordions.html): The Accordion component supports query parameters to open specific accordions when linking to a screen.
- [Charts component](https://developers.fliplet.com/API/components/charts.html): Use the Charts JS API to retrieve chart instances on a screen and update their data, labels, and series at runtime.
- [Chat JS APIs](https://developers.fliplet.com/API/components/chat.html): Start conversations, list contacts, count unread messages, and modify chat rendering via Fliplet.Chat on screens that use the Chat layout component.
- [Data Directory JS APIs](https://developers.fliplet.com/API/components/data-directory.html): Hook into the Data Directory component to override its data source, transform entries, and run code before render or initialization on directory screens.
- [Dynamic Container JS APIs](https://developers.fliplet.com/API/components/dynamic-container.html): Bind a screen region to a data source query via Fliplet.DynamicContainer so the component renders a list of entries with bound expressions.
- [Email Verification component](https://developers.fliplet.com/API/components/email-verification.html): Use the Email Verification JS API to retrieve the component instance on a screen and trigger verification flows for a given email address.
- [Form JS APIs](https://developers.fliplet.com/API/components/form-builder.html): Populate fields, read values, react to validation, and submit programmatically via Fliplet.FormBuilder on screens that contain a Form component.
- [Interactive Graphics JS APIs](https://developers.fliplet.com/API/components/interactive-graphics.html): Override marker data, preselect a marker or map, and respond to label clicks via Interactive Graphics component hooks on screens that use it.
- [List (from Data Source) component](https://developers.fliplet.com/API/components/list-from-data-source.html): Configure templates, hooks, and query parameters for the List (from Data Source) component, which renders summary and detail views backed by a data source.
- [List Repeater JS APIs](https://developers.fliplet.com/API/components/list-repeater.html): Render a list of data source entries inside a Dynamic Container via `Fliplet.ListRepeater`, with hooks to modify rows before and after render.
- [Login](https://developers.fliplet.com/API/components/login.html): Run custom code after a user authenticates or when a returning user's session is re-validated via the Login component's `login` and `sessionValidate` hooks.
- [Bottom Icon Bar menu component](https://developers.fliplet.com/API/components/menu-bottom-icon-bar.html): Use a query parameter to highlight the active item when linking into a screen that uses the Bottom Icon Bar menu component.
- [Push Notifications JS APIs](https://developers.fliplet.com/API/components/push-notifications.html): Prompt users to subscribe, read device push settings, fetch the subscription ID and token, and unsubscribe via Fliplet's push notifications JS API.
- [Record container JS APIs](https://developers.fliplet.com/API/components/record-container.html): Render a single data source entry in a screen via Fliplet.RecordContainer, with hooks to modify the query and react when data is retrieved.
- [Fliplet.AI](https://developers.fliplet.com/API/core/ai.html): Build AI features with `Fliplet.AI` — chat, completions, streaming, image generation, transcription, and embeddings via OpenAI or Google Gemini proxies.
- [Fliplet.Analytics](https://developers.fliplet.com/API/core/analytics.html): Enable, disable, and check analytics tracking, and record custom app events and page views from JavaScript.
- [Fliplet.API.request()](https://developers.fliplet.com/API/core/api.html): Make authenticated HTTP requests to Fliplet APIs with automatic URL construction, caching, offline queueing, and error handling.
- [Fliplet.App](https://developers.fliplet.com/API/core/app.html): Retrieve the current app's public slug, build shareable screen URLs, and access app-level settings from JavaScript.
- [Fliplet.Apps](https://developers.fliplet.com/API/core/apps.html): List the Fliplet apps the current user can access, and filter between legacy V1 and modern V2 apps.
- [Fliplet.User.Biometrics](https://developers.fliplet.com/API/core/biometrics.html): Check biometric availability and verify users with Face ID, Touch ID, or fingerprint inside native Fliplet apps.
- [Fliplet.Cache](https://developers.fliplet.com/API/core/cache.html): Run async operations once and memoize their results, with optional expiry and background refresh.
- [Fliplet.Encode](https://developers.fliplet.com/API/core/encode.html): Encode strings as base64 and double-encode URL query parameters safely for transport.
- [Fliplet.Env](https://developers.fliplet.com/API/core/environment.html): Read environment variables such as `appId`, `appName`, `mode`, and `apiUrl` from the current runtime.
- [Fliplet.parseError()](https://developers.fliplet.com/API/core/error.html): Turn any error response or object into a human-readable message by scanning common error properties.
- [Fliplet.Hooks](https://developers.fliplet.com/API/core/hooks.html): Register callbacks that run before or after key app events (e.g. form submit), with sync or async Promise handlers.
- [Fliplet.Locale](https://developers.fliplet.com/API/core/localization.html): Translate strings and format dates and numbers in Fliplet components via Fliplet.Locale, the T() shorthand, and translation.json files using i18next.
- [Fliplet common functions](https://developers.fliplet.com/API/core/misc.html): Utility helpers on the global `Fliplet` object: `Fliplet.compile()` for templating and `Fliplet.guid()` for unique IDs.
- [Fliplet.Modal](https://developers.fliplet.com/API/core/modal.html): Show confirmation, alert, and prompt dialogs from widget interfaces in Fliplet Studio via `Fliplet.Modal`, powered by Bootbox.
- [Fliplet.Navigate](https://developers.fliplet.com/API/core/navigate.html): Navigate between app screens, open external URLs, pass query parameters, and handle back, home, and modal navigation via Fliplet.Navigate.
- [Fliplet.Navigator](https://developers.fliplet.com/API/core/navigator.html): Detect online/offline state, listen for connectivity changes, and wait for the device to be ready.
- [Fliplet.Navigator.Notifications](https://developers.fliplet.com/API/core/notifications.html): Check notification support, request permission, and send local device notifications from JavaScript.
- [Fliplet.Organizations](https://developers.fliplet.com/API/core/organizations.html): List the current user's organizations and fetch audit logs with filters for type, date range, app, and session.
- [Fliplet Core overview](https://developers.fliplet.com/API/core/overview.html): Fliplet Core is the JS library bundled into every app screen — storage, navigation, user, API, and dozens of device helpers.
- [Fliplet.Profile](https://developers.fliplet.com/API/core/profile.html): Read and write namespaced user profile attributes (email, name, company, phone) and fetch the device UUID.
- [Fliplet.Registry](https://developers.fliplet.com/API/core/registry.html): Store and retrieve runtime values and functions by key so components can share state and helpers.
- [`Fliplet.Pages` and `Fliplet.Page`](https://developers.fliplet.com/API/core/screens.html): List app screens, get the current screen's public URL, and build shareable URLs for any screen by ID.
- [`Fliplet.Storage` and `Fliplet.App.Storage`](https://developers.fliplet.com/API/core/storage.html): Persist JSON-serializable values to device or browser storage, scoped globally or to the current app.
- [Fliplet.Studio](https://developers.fliplet.com/API/core/studio.html): Emit events to Fliplet Studio and listen for events from it when building widget interfaces.
- [Fliplet.User](https://developers.fliplet.com/API/core/user.html): Get and set the current user's auth token, profile details, and preferences, and sign the user out.
- [Fliplet.Widget](https://developers.fliplet.com/API/core/widget.html): Access widget instance IDs, settings, and data, and coordinate save and ready events between widget and interface.
- [Fliplet.Media.Audio.Player](https://developers.fliplet.com/API/fliplet-audio-player.html): Embed an audio player UI in a screen by tagging HTML elements with audio URLs; the framework auto-initializes players on screen load.
- [Fliplet.Media.Audio](https://developers.fliplet.com/API/fliplet-audio.html): Play, pause, stop, and seek audio files on device or from a URL in Fliplet apps via the Audio namespace.
- [Fliplet.Barcode](https://developers.fliplet.com/API/fliplet-barcode.html): Scan QR codes and other 1D/2D barcodes from the device camera via the fliplet-barcode package.
- [Fliplet.Communicate](https://developers.fliplet.com/API/fliplet-communicate.html): Send email, SMS, push notifications, and share URLs from a Fliplet app using a single Communicate namespace.
- [Fliplet.Content()](https://developers.fliplet.com/API/fliplet-content.html): Create, query, update, and delete shared content records (bookmarks, likes, saved searches) backed by a data source via Fliplet.Content.
- [Fliplet.CSV](https://developers.fliplet.com/API/fliplet-csv.html): Encode and decode CSV in Fliplet apps via the fliplet-csv package.
- [Fliplet.Database](https://developers.fliplet.com/API/fliplet-database.html): Low-level helper for reading and querying JSON data from a local file as a database; used internally by Fliplet.DataSources.
- [Fliplet.DataSources.Encryption](https://developers.fliplet.com/API/fliplet-encryption.html): Automatically encrypt and decrypt selected Data Source columns on-device by registering a private key and column list.
- [Fliplet.Gamify](https://developers.fliplet.com/API/fliplet-gamify.html): Configure gamification with logs, variables, and achievements via Fliplet.Gamify; track points, milestones, and badges backed by a data source per user.
- [Fliplet.Media](https://developers.fliplet.com/API/fliplet-media.html): Browse folders, upload and manage files, and download media to devices via the Fliplet Media namespace.
- [Fliplet.Notifications](https://developers.fliplet.com/API/fliplet-notifications.html): Read, send, and schedule in-app and push notifications in Fliplet apps, with support for scopes, read receipts, and badge counts.
- [Fliplet.Page](https://developers.fliplet.com/API/fliplet-page.html): Utilities for interacting with the current Fliplet screen — including smooth-scrolling to an element with configurable duration and offsets.
- [Fliplet.Payments](https://developers.fliplet.com/API/fliplet-payments.html): Accept Stripe payments and checkout in Fliplet apps via Fliplet.Payments, with a products data source and webhook-driven order tracking.
- [Fliplet.Profile.Content()](https://developers.fliplet.com/API/fliplet-profile-content.html): Create, query, update, and delete user-attributed content records in a data source so each user only sees their own entries via Fliplet.Profile.Content.
- [Fliplet.Session](https://developers.fliplet.com/API/fliplet-session.html): Read, write, and clear the current user session — including cached offline sessions — for authentication state in Fliplet apps.
- [Fliplet.UI.Table](https://developers.fliplet.com/API/fliplet-table.html): Render searchable, sortable tables with pagination, row selection, expandable rows, and custom cell rendering via `Fliplet.UI.Table`.
- [Fliplet.UI.Actions()](https://developers.fliplet.com/API/fliplet-ui-actions.html): Show a native-style action sheet with a title, labeled options, and a cancel button, resolving with the chosen index via Fliplet.UI.Actions.
- [Fliplet.UI.AddressField()](https://developers.fliplet.com/API/fliplet-ui-address.html): Add a Google Maps autocomplete address field to a screen via `Fliplet.UI.AddressField()` to search, select, and retrieve location details.
- [Fliplet.UI.DatePicker()](https://developers.fliplet.com/API/fliplet-ui-datepicker.html): Render a date picker input with optional preset value, required flag, and get/set/change methods via Fliplet.UI.DatePicker.
- [Fliplet.UI.DateRange()](https://developers.fliplet.com/API/fliplet-ui-daterange.html): Render a paired start/end date range input with required flag, default value, and get/set/change methods via Fliplet.UI.DateRange.
- [Fliplet.UI.NumberInput()](https://developers.fliplet.com/API/fliplet-ui-number.html): Render a numeric input with required flag, preset value, and get/set/change methods for reading user-entered numbers via Fliplet.UI.NumberInput.
- [Fliplet.UI.PanZoom](https://developers.fliplet.com/API/fliplet-ui-panzoom.html): Pan, zoom, and place markers on images or interactive graphics via `Fliplet.UI.PanZoom`, with pinch, mouse wheel, and double-tap support.
- [Fliplet.UI.RangeSlider()](https://developers.fliplet.com/API/fliplet-ui-rangeslider.html): Render a range slider input with min, max, step, and default value, plus get/set/change methods via Fliplet.UI.RangeSlider.
- [Fliplet.UI.TimePicker()](https://developers.fliplet.com/API/fliplet-ui-timepicker.html): Render a time picker input in 24-hour HH:mm format with required flag and get/set/change methods via Fliplet.UI.TimePicker.
- [Fliplet.UI.TimeRange()](https://developers.fliplet.com/API/fliplet-ui-timerange.html): Render a paired start/end time range input in HH:mm format with required flag, default value, and get/set/change methods via Fliplet.UI.TimeRange.
- [Fliplet.UI.Toast.error()](https://developers.fliplet.com/API/fliplet-ui-toast-error.html): Parse an error object and show a toast with a friendly initial message plus a button to reveal the detailed technical error via Fliplet.UI.Toast.error.
- [Fliplet.UI.Toast()](https://developers.fliplet.com/API/fliplet-ui-toast.html): Show minimal or regular auto-dismissing toast notifications with title, message, position, duration, progress bar, and action buttons via Fliplet.UI.Toast.
- [Fliplet.UI.Typeahead()](https://developers.fliplet.com/API/fliplet-ui-typeahead.html): Render a typeahead input with real-time suggestions, free-input toggle, max items, and get/set/change methods via Fliplet.UI.Typeahead.
- [Fliplet.UI](https://developers.fliplet.com/API/fliplet-ui.html): Fliplet-managed UI primitives — toasts, action sheets, modals, date/time pickers, typeahead, tables, panzoom — under the Fliplet.UI namespace.
- [Using Handlebars in your apps](https://developers.fliplet.com/API/libraries/handlebars.html): Use Handlebars 2.15.2 in Fliplet app screens for templating, with built-in helpers for images, dates, auth URLs, JSON, and conditional comparisons.
- [Fliplet.LikeButton](https://developers.fliplet.com/API/like-buttons.html): Embed a one-tap like button on any screen element, backed by a Data Source that records likes per content ID.
- [Data Source provider](https://developers.fliplet.com/API/providers/data-source.html): The Data Source provider lets users pick or create a data source for a component, including default columns, entries, and access rules.
- [Email provider](https://developers.fliplet.com/API/providers/email.html): Compose email templates (subject, body, recipients, headers) in a reusable provider UI for sending via `Fliplet.Communicate.sendEmail()`.
- [File Picker provider](https://developers.fliplet.com/API/providers/file-picker.html): The File Picker provider lets users select one or more files from Fliplet's File Manager, optionally scoped by file type or restricted to single-select.
- [Link Action provider](https://developers.fliplet.com/API/providers/link-action.html): Configure link actions (navigate to screen, open URL, document, video, or run JS) in a reusable provider UI executable via `Fliplet.Navigate.to()`.
- [Fliplet-approved JavaScript libraries (coding-standards edition)](https://developers.fliplet.com/approved-libraries.html): The JavaScript libraries Fliplet pre-approves for app development, why you should prefer them over custom ones, and when to reach for each.
- [Fliplet API patterns and categories](https://developers.fliplet.com/code-api-patterns.html): Overview of the main Fliplet JS API categories (Data Sources, Users, Media, Navigation) and when to pick each one.
- [Fliplet-approved JavaScript libraries (reference list)](https://developers.fliplet.com/Fliplet-approved-libraries.html): Reference list of every JavaScript library Fliplet pre-approves in apps, including versions and optional add-on libraries.
- [Fliplet SDK](https://developers.fliplet.com/Fliplet-SDK.html): Load Fliplet JS APIs on any external website via sdk.js with an auth token and optional comma-separated package list (e.g. fliplet-media, fliplet-datasources).
- [The Fliplet JavaScript APIs](https://developers.fliplet.com/JS-APIs.html): How the Fliplet JS APIs (SDK, not a framework) let you interact with data, screens, users, and components from Studio custom code, themes, and widgets.

## How to load full content

Replace `.html` with `.md` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
