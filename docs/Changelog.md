---
description: Changelog notes giving a summary of recent significant changes to the documentation.
---

# Changelog

Each week, we provide changelog notes on this page giving a summary of recent significant changes to the documentation. If there haven't been any significant changes in a given week, we don't publish changelog notes.

## September 2021

## September 1st

- The new anti-virus feature has been rolled out to all customers. All files uploaded through the [Media APIs](https://developers.fliplet.com/API/fliplet-media.html#upload-one-or-more-files) will be scanned for viruses and quarantined when an infection is found.

---

## August 2021

### August 3rd

- New Android framework version 5.0.0 released with support for App Bundle and SDK 30.

---

## July 2021

### July 20th

- New documentation page for [App Tasks](https://developers.fliplet.com/API/core/app-tasks.html).

---

## June 2021

### June 23rd

- New documentation page for the [Fliplet Helper components](https://developers.fliplet.com/API/helpers/overview.html).

### June 9th

- New documentation for the `isFormInvalid` hook for the Form component.

---

## April 2021

### April 16th

- New Android framework version 4.5.2 released with improvements for marking in-app notifications as read when push notifications are received.

---

## March 2021

### March 18th

- New iOS and Android framework version 4.5.1 released with improvements for receiving push notifications and displaying notification badges on the home screen.

### March 10th

- New JS API available to [integrate your apps with payments via Stripe](https://developers.fliplet.com/API/fliplet-payments.html).

### March 4th

- New iOS and Android framework version 4.5.0 released to add support for [reading push notification settings](https://developers.fliplet.com/API/core/notifications.html#verify-the-devices-push-notification-settings) (e.g. badge, sound and alert).

---

## February 2021

### February 18th

- Added new documentation page for public JS APIs for the [Email Verification](https://developers.fliplet.com/API/components/email-verification.html).

### February 14th

- Added new documentation page for [rate limiting when using APIs](https://developers.fliplet.com/Rate-limiting-for-API.html).

### February 11th

- Added public JS APIs for accessing the [device biometrics](https://developers.fliplet.com/API/core/biometrics.html).
- Added new documentation page listing all [organization audit log types](https://developers.fliplet.com/Organization-audit-log-types.html#list-of-audit-log-types-for-organizations).

---

## January 2021

### January 24th

- Added public JS APIs for accessing [Organization audit logs](https://developers.fliplet.com/API/core/organizations.html#audit-logs).
- Added public RESTful APIs for accessing [Organization audit logs](https://developers.fliplet.com/REST-API/fliplet-organizations.html#get-the-audit-logs-for-an-organization).

### January 15th

- Added new page for APIs related to [Upcoming features](/Upcoming.html).

---

## December 2020

### December 14th

- New iOS framework version 4.3.0 released to improve support for **push notifications**.

### December 8th

- Added public JS APIs for interacting with [Chat channels](/API/components/chat.html#public-channels).

## November 2020

### November 17th

- Released new version 1.12.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with fixes for uninstalling Windows Services.

---

## October 2020

### October 1st

- Released new version 1.11.0 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) with support for case-insensitive primary key, log verbosity and absolute paths on the Windows service.

---

## September 2020

### September 17th

- New iOS framework version 4.2.2 released and fixed an issue that caused clipboard warnings to be triggered when user revisits an app.

### September 15th

- New iOS framework version 4.2.1 released with support for clearing the splash screen cache on app startup.

---

## August 2020

### August 18th

- New redesigned layout for the developers website

### August 7th

- New Android framework release (version 4.2.0) to increase target SDK to 29 (Android 10) and disable back-ups for improved security.

---

## July 2020

### July 14th

- New documentation for the [Data Source commit endpoint](https://developers.fliplet.com/REST-API/fliplet-datasources.html#commit-a-series-of-changes-to-a-data-source).

## June 2020

### June 23rd

- New documentation for [advanced conditions on Data Source hooks](https://developers.fliplet.com/Data-Source-Hooks.html#hook-conditions) using Sift.js.

### June 15th

- New documentation for setting up a [test SAML2 integration with Auth0](https://developers.fliplet.com/API/integrations/sso-saml2.html#set-up-a-test-saml2-integration-with-auth0).
- New JavaScript environment variable `demo` available via `Fliplet.Env.get('demo')`.

---

## May 2020

### May 28th

- Added support for merging data source entries when in sync with the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html) via the new `merge: true` option.

### May 26th

- Added new documentation for the [Fliplet.App.getPublicSlug()](https://developers.fliplet.com/API/core/overview.html#get-the-public-url-of-the-current-app) method.

### May 11th

- Published new documentation on [Fliplet URLs and IP Addresses](https://developers.fliplet.com/URLs-and-IP-Addresses.html).

### May 6th

- Published new [Fliplet Agent](https://developers.fliplet.com/Data-integration-service.html#encryption) version (1.10) with support for [encrypting columns](https://developers.fliplet.com/Data-integration-service.html#encryption).

- Adds support for new [Vue.js-based boilerplate](https://developers.fliplet.com/Building-components.html#creating-a-component-interface-using-the-advanced-vuejs-boilerplate) when creating component interfaces.

---

## April 2020

### April 22nd

- Adds support for [disabling the download option](https://developers.fliplet.com/API/fliplet-audio-player.html) for audio players.
- New iOS framework release (version 4.1.3) to enhance the audio player.

### April 8th

- New documentation for running [aggregation queries](https://developers.fliplet.com/API/fliplet-datasources.html#run-aggregation-queries) on Data Sources using the built-in Mingo library.

### April 6th

- Added more documentation and examples on [setting up an encryption key](https://developers.fliplet.com/API/fliplet-encryption.html#set-the-encryptiondecryption-key) when using the `fliplet-encryption` dependency.

### April 1st

- Documentation for the [List from data source](https://developers.fliplet.com/API/components/list-from-data-source.html) component updated with the following:
  - New comment related hooks
  - New search input related hooks
  - New comment related query parameters

---

## March 2020

### March 31st

- New documentation for retrieving the [public URL](https://developers.fliplet.com/API/core/overview.html#get-the-public-url-of-the-current-screen) of a screen.
- New [beforeRichFieldInitialize](https://developers.fliplet.com/API/components/form-builder.html#beforerichfieldinitialize) hook added to the **Form builder**.

### March 17th

- Updates for new app framework released, see [native framework changelog](https://developers.fliplet.com/Native-framework-changelog.html) for details.
- New documentation for [Data Source operation hooks](https://developers.fliplet.com/Data-Source-Hooks.html#manipulate-a-string).


### March 3rd

- Added new documentation page to list out available JavaScript assets in Fliplet Apps.
- Added new documentation page for defining [Data Source Views](https://developers.fliplet.com/API/datasources/views.html).

---

## February 2020

### February 24th

- Documentation for the [List from data source](https://developers.fliplet.com/API/components/list-from-data-source.html) component updated with new options for the **flListDataBeforeRenderList** and **flListDataAfterRenderList** hooks.

### February 19th

- Released new version of our native framework for iOS apps with dropped UIWebView support following [Apple's deprecation notice](https://developer.apple.com/news/?id=12232019b) and updated **InAppBrowser** Cordova plugin to its latest version.

### February 14th

- New documentation for creating and managing [in-app and push notifications](https://developers.fliplet.com/API/fliplet-notifications.html)
- Released version 1.9.2 of the [Data Integration Service](https://developers.fliplet.com/Data-integration-service.html)
- Added more examples and documentation on connecting to [Data Sources](https://developers.fliplet.com/API/fliplet-datasources.html#connect-to-a-data-source-by-id) with advances settings for online and offline use.
- Added more examples on [resizing a Media File](https://developers.fliplet.com/REST-API/fliplet-media.html#stream-the-contents-of-a-file).

### February 6th

- New examples on the documentation for the `beforeFormSubmit` hook of the [Form builder](https://developers.fliplet.com/API/components/form-builder.html#beforeformsubmit).
- Added new method to programmatically submit a form built via the [Form builder](https://developers.fliplet.com/API/components/form-builder.html#programmatically-submit-a-form).

---

## January 2020

### January 31st

- Documentation for screen link queries on [List from Data Source](API/components/list-from-data-source.md).

### January 24th

- Documentation for configuring the Data Integration Service with [Sharepoint](Data-integration-service.md#integrate-with-sharepoint).
- New hooks for the [Chart](https://developers.fliplet.com/API/components/charts.html#hooks) component.
- Documentation page to explain the [Infrastructure Data Flow](/Data-flow.md) of the Fliplet platform.

### January 17th

- Documentation page to explain the [App Execution Flow](https://developers.fliplet.com/Execution-flow.html) of Fliplet apps.
- New hooks for the [Chat](https://developers.fliplet.com/API/components/chat.html) component.
- General updates on the documentation for the [Data Integration Service](Data-integration-service.md).

### January 10th

- Documentation page for the [Fliplet.Helper](https://developers.fliplet.com/API/helpers/overview.html) JS API.
- General improvements to the guidelines and example on the [Output of components](https://developers.fliplet.com/components/Build-output.html#reading-previously-saved-settings) page used when developing custom components for Fliplet apps.

### January 6th

- Updated jQuery to 3.4.1. See [all Fliplet approved libraries](https://developers.fliplet.com/Fliplet-approved-libraries.html).

---

## December 2019

### December 27th

- Documentation on the [Fliplet.Notifications](https://developers.fliplet.com/API/fliplet-notifications.html) JS API to document new public methods available.

### December 20th

- Documentation for the new `field.options` method available in the [Form Builder](https://developers.fliplet.com/API/components/form-builder.html#fieldoptionsarray) JS APIs.
- General improvements to the [Native framework changelog](https://developers.fliplet.com/Native-framework-changelog.html) page.
