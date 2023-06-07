---
description: Changelog notes giving a summary of recent significant changes to the documentation.
---

# Changelog

Each week, we provide changelog notes on this page giving a summary of recent significant changes to the documentation. If there haven't been any significant changes in a given week, we don't publish changelog notes.

## 2023

- **June, 7th**: Added new JS API for the chat component. See [Chat JS API](https://developers.fliplet.com/API/components/chat.html) for more details.
- **April, 14th**: New iOS framework version 6.2.0 released with improvements for screen transitions on iPad.
- **April, 11th**: Added draft documentation for the upcoming [AI JS API](https://developers.fliplet.com/API/core/ai.html).
- **March, 29th**: Released new version 2.0.1 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html##releases-changelog) with improved checksum validation for media files.
- **March, 28th**: New iOS framework version 6.1.0 released with support for iOS 16.
- **March, 10th**: Added [new pagination options](https://developers.fliplet.com/API/fliplet-datasources.html#fetch-records-with-pagination) for the Data Source JS API
- **February, 23rd**: Released new version 2.0.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html##releases-changelog) with improved SSL compatibility and logging.
- **February, 21st**: Released new version 1.15.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html##releases-changelog) with improved logging when synchronizing files.
- **February, 8th**: [Data Source security rules](/Data-source-security.html) are now required by all API tokens and DIS integrations when interacting with Data Sources
- **January, 16th**: Added documentation for [custom Data Source security rules](https://developers.fliplet.com/Data-source-security.html#custom-security-rules)

---

## 2022

- **November, 21st**: Released new version 1.14.3 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with improved merge support on error handling when files can't be fetched from disk.
- **October, 27th**: Released new version 1.14.2 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with improvements to error logging.
- **October, 25th**: Documentation added for [session expiration](https://developers.fliplet.com/App-security.html#session-expiration).
- **October, 5th**: New Android framework version 6.0.3 with security updates.
- **September, 6th**: Updated Chat JS APIs with options to [open a group conversation](/API/components/chat.html#startopen-a-group-conversation-with-one-or-more-people).
- **August, 5th**: New Android framework version 6.0.2 with support to the SDK 31.
- **July, 20th**: New iOS and Android framework version 6.0.0 released with support for the upcoming localization feature.
- **July, 7th**: New iOS framework version 5.3.2 released with bugfixes for the share dialog.
- **April, 22nd**: New iOS framework version 5.3.0 released with support for iOS 15.

---

## 2021

- Released new version 6.0.0 of the Fliplet CLI with improved support for [creating tests](/Testing-components.html) for your components.
- Released new version 1.14.1 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with fixes for running a push operation without a primary key.
- New Android framework version 5.2.0 released with a bugfix for apps built with the SDK30 not properly dismissing the virtual keyboard.
- New Android framework version 5.1.0 released with full support for SDK 30 including a bugfix for taking pictures with camera not working as expected on Android 12.
- The new anti-virus feature has been rolled out to all customers. All files uploaded through the [Media APIs](https://developers.fliplet.com/API/fliplet-media.html#upload-one-or-more-files) will be scanned for viruses and quarantined when an infection is found.
- New Android framework version 5.0.0 released with support for App Bundle and SDK 30.
- New documentation page for [App Actions](https://developers.fliplet.com/API/core/app-actions.html).
- New documentation page for the [Fliplet Helper components](https://developers.fliplet.com/API/helpers/overview.html).
- New documentation for the `isFormInvalid` hook for the Form component.
- New Android framework version 4.5.2 released with improvements for marking in-app notifications as read when push notifications are received.
- New iOS and Android framework version 4.5.1 released with improvements for receiving push notifications and displaying notification badges on the home screen.
- New JS API available to [integrate your apps with payments via Stripe](https://developers.fliplet.com/API/fliplet-payments.html).
- New iOS and Android framework version 4.5.0 released to add support for [reading push notification settings](https://developers.fliplet.com/API/core/notifications.html#verify-the-devices-push-notification-settings) (e.g. badge, sound and alert).
- Added new documentation page for public JS APIs for the [Email Verification](https://developers.fliplet.com/API/components/email-verification.html).
- Added new documentation page for [rate limiting when using APIs](https://developers.fliplet.com/Rate-limiting-for-API.html).
- Added public JS APIs for accessing the [device biometrics](https://developers.fliplet.com/API/core/biometrics.html).
  - Added new documentation page listing all [organization audit log types](https://developers.fliplet.com/Organization-audit-log-types.html#list-of-audit-log-types-for-organizations).
- Added public JS APIs for accessing [Organization audit logs](https://developers.fliplet.com/API/core/organizations.html#audit-logs).
  - Added public RESTful APIs for accessing [Organization audit logs](https://developers.fliplet.com/REST-API/fliplet-organizations.html#get-the-audit-logs-for-an-organization).
- Added new page for APIs related to [Upcoming features](/Upcoming.html).

---

## 2020

- New iOS framework version 4.3.0 released to improve support for **push notifications**.
- Added public JS APIs for interacting with [Chat channels](/API/components/chat.html#public-channels).
- Released new version 1.12.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with fixes for uninstalling Windows Services.
- Released new version 1.11.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with support for case-insensitive primary key, log verbosity and absolute paths on the Windows service.
- New iOS framework version 4.2.2 released and fixed an issue that caused clipboard warnings to be triggered when user revisits an app.
- New iOS framework version 4.2.1 released with support for clearing the splash screen cache on app startup.
- New redesigned layout for the developers website
- New Android framework release (version 4.2.0) to increase target SDK to 29 (Android 10) and disable back-ups for improved security.
- New documentation for the [Data Source commit endpoint](https://developers.fliplet.com/REST-API/fliplet-datasources.html#commit-a-series-of-changes-to-a-data-source).
- New documentation for [advanced conditions on Data Source hooks](https://developers.fliplet.com/Data-Source-Hooks.html#hook-conditions) using Sift.js.
- New documentation for setting up a [test SAML2 integration with Auth0](https://developers.fliplet.com/API/integrations/sso-saml2.html#set-up-a-test-saml2-integration-with-auth0).
- New JavaScript environment variable `demo` available via `Fliplet.Env.get('demo')`.
- Added support for merging data source entries when in sync with the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) via the new `merge: true` option.
- Added new documentation for the [Fliplet.App.getPublicSlug()](https://developers.fliplet.com/API/core/overview.html#get-the-public-url-of-the-current-app) method.
- Published new documentation on [Fliplet URLs and IP Addresses](https://developers.fliplet.com/URLs-and-IP-Addresses.html).
- Published new [Fliplet Agent](https://developers.fliplet.com/Data-integration-service.html#encryption) version (1.10) with support for [encrypting columns](https://developers.fliplet.com/Data-integration-service.html#encryption).
- Adds support for new [Vue.js-based boilerplate](https://developers.fliplet.com/Building-components.html#creating-a-component-interface-using-the-advanced-vuejs-boilerplate) when creating component interfaces.
- Adds support for [disabling the download option](https://developers.fliplet.com/API/fliplet-audio-player.html) for audio players.
- New iOS framework release (version 4.1.3) to enhance the audio player.
- New documentation for running [aggregation queries](https://developers.fliplet.com/API/fliplet-datasources.html#run-aggregation-queries) on Data Sources using the built-in Mingo library.
- Added more documentation and examples on [setting up an encryption key](https://developers.fliplet.com/API/fliplet-encryption.html#set-the-encryptiondecryption-key) when using the `fliplet-encryption` dependency.
- Documentation for the [List from data source](https://developers.fliplet.com/API/components/list-from-data-source.html) component updated with the following:
  - New comment related hooks
  - New search input related hooks
  - New comment related query parameters
- New documentation for retrieving the [public URL](https://developers.fliplet.com/API/core/overview.html#get-the-public-url-of-the-current-screen) of a screen.
- New [beforeRichFieldInitialize](https://developers.fliplet.com/API/components/form-builder.html#beforerichfieldinitialize) hook added to the **Form** component.
- Updates for new app framework released, see [native framework changelog](https://developers.fliplet.com/Native-framework-changelog.html) for details.
- New documentation for [Data Source operation hooks](https://developers.fliplet.com/Data-Source-Hooks.html#manipulate-a-string).
- Added new documentation page to list out available JavaScript assets in Fliplet Apps.
- Added new documentation page for defining [Data Source Views](https://developers.fliplet.com/API/datasources/views.html).
- Documentation for the [List from data source](https://developers.fliplet.com/API/components/list-from-data-source.html) component updated with new options for the **flListDataBeforeRenderList** and **flListDataAfterRenderList** hooks.
- Released new version of our native framework for iOS apps with dropped UIWebView support following [Apple's deprecation notice](https://developer.apple.com/news/?id=12232019b) and updated **InAppBrowser** Cordova plugin to its latest version.
- New documentation for creating and managing [in-app and push notifications](https://developers.fliplet.com/API/fliplet-notifications.html)
- Released version 1.9.2 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html)
- Added more examples and documentation on connecting to [Data Sources](https://developers.fliplet.com/API/fliplet-datasources.html#connect-to-a-data-source-by-id) with advances settings for online and offline use.
- Added more examples on [resizing a Media File](https://developers.fliplet.com/REST-API/fliplet-media.html#stream-the-contents-of-a-file).
- New examples on the documentation for the `beforeFormSubmit` hook of the [Form](https://developers.fliplet.com/API/components/form-builder.html#beforeformsubmit) component.
- Added new method to programmatically submit a form built via the [Form](https://developers.fliplet.com/API/components/form-builder.html#programmatically-submit-a-form) component.
- Documentation for screen link queries on [List from Data Source](API/components/list-from-data-source.md).
- Documentation for configuring the Data Integration Service with [Sharepoint](Data-integration-service.md#integrate-with-sharepoint).
- New hooks for the [Chart](https://developers.fliplet.com/API/components/charts.html#hooks) component.
- Documentation page to explain the [Infrastructure Data Flow](/Data-flow.md) of the Fliplet platform.
- Documentation page to explain the [App Execution Flow](https://developers.fliplet.com/Execution-flow.html) of Fliplet apps.
- New hooks for the [Chat](https://developers.fliplet.com/API/components/chat.html) component.
- General updates on the documentation for the [Data Integration Service](Data-integration-service.md).
- Documentation page for the [Fliplet.Helper](https://developers.fliplet.com/API/helpers/overview.html) JS API.
- General improvements to the guidelines and example on the [Output of components](https://developers.fliplet.com/components/Build-output.html#reading-previously-saved-settings) page used when developing custom components for Fliplet apps.
- Updated jQuery to 3.4.1. See [all Fliplet approved libraries](https://developers.fliplet.com/Fliplet-approved-libraries.html).

---

## 2019
- Documentation on the [Fliplet.Notifications](https://developers.fliplet.com/API/fliplet-notifications.html) JS API to document new public methods available.
- Documentation for the new `field.options` method available in the [Form](https://developers.fliplet.com/API/components/form-builder.html#fieldoptionsarray) JS APIs component.
- General improvements to the [Native framework changelog](https://developers.fliplet.com/Native-framework-changelog.html) page.
