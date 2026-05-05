---
title: JS API Documentation
description: "Index of Fliplet's JavaScript APIs (Core, Data Sources, Media, UI, Communicate) for working with apps, screens, users, and components from custom code."
type: reference
tags: [js-api, overview]
v3_relevant: true
deprecated: false
---

# JS API Documentation

Index of Fliplet's JavaScript APIs (Core, Data Sources, Media, UI, Communicate) for working with apps, screens, users, and components from custom code. See the [JS APIs](JS-APIs) section for guidance on using these packages in your Fliplet apps, components, and themes.

<p class="quote">Are you rather looking for our <strong>RESTful APIs</strong> for complex backend integrations? Jump to our <a href="/REST-API-Documentation">documentation</a> to read more.</p>

---

{% raw %}
<section class="blocks alt">
  <a class="bl two" href="/API/core/overview">
    <div>
      <span class="pin">Recommended library</span>
      <h4>Core</h4>
      <p>All your apps come with this pre-included set of useful core libraries to help you out doing the most common tasks such as reading information about the current app or screen.</p>
      <p class="note">Sample use cases</p>
      <ul>
        <li>Interact with the current screen and user</li>
        <li>Navigate the app to different screen</li>
        <li>Read and save data locally</li>
      </ul>
      <button>View documentation</button>
    </div>
  </a>
  <a class="bl two" href="/API/fliplet-datasources">
    <div>
      <span class="pin">Recommended library</span>
      <h4>Data Sources</h4>
      <p>Apps very frequently need to interact with dynamic data you manage. Use these JS APIs to read and write data from your app to your Data Sources.</p>
      <p class="note">Sample use cases</p>
      <ul>
        <li>Read and write data to a Data Source</li>
        <li>Integrate apps with data from DIS</li>
        <li>Create dynamic screens</li>
      </ul>
      <button>View documentation</button>
    </div>
  </a>
</section>
<section class="blocks alt">
  <a class="bl two" href="/API/core/overview">
    <div>
      <h4>Communicate</h4>
      <p>Send emails, texts and share URLs to users of your apps.</p>
      <p class="note">Sample use cases</p>
      <ul>
        <li>Send an email to your users</li>
        <li>Let the user compose an email</li>
      </ul>
      <button>View documentation</button>
    </div>
  </a>
  <a class="bl two" href="/API/fliplet-datasources">
    <div>
      <h4>Encryption</h4>
      <p>Set up encryption and decryption for your apps.</p>
      <p class="note">Sample use cases</p>
      <ul>
        <li>Use a encrypted Data Source</li>
        <li>Integrate with data from DIS</li>
      </ul>
      <button>View documentation</button>
    </div>
  </a>
</section>
{% endraw %}

---

## All JS APIs you can use in apps

These JS APIs falls into the most common category and almost all apps, components and themes use at least one of them. All apps include `fliplet-core` by default, and any other can easily be included on your app screens via Fliplet Studio.

  - [Audio](API/fliplet-audio) (`fliplet-audio`)
  - [Audio Player](API/fliplet-audio-player) (`fliplet-audio-player`)
  - [Barcode](API/fliplet-barcode) (`fliplet-barcode`)
  - [Communicate](API/fliplet-communicate) (`fliplet-communicate`)
  - [Content](API/fliplet-content) (`fliplet-content`)
  - [Core](API/fliplet-core) (`fliplet-core`)
  - [CSV](API/fliplet-csv) (`fliplet-csv`)
  - [Data Sources](API/fliplet-datasources) (`fliplet-datasources`)
  - [Database](API/fliplet-database) (`fliplet-database`)
  - [Encryption](API/fliplet-encryption) (`fliplet-encryption`)
  - [Helper](API/helpers/overview) (`fliplet-helper`)
  - [Gamify](API/fliplet-gamify) (`fliplet-gamify`)
  - [Like Buttons](API/like-buttons) (`fliplet-like:0.2`) (Beta)
  - [Media](API/fliplet-media) (`fliplet-media`)
  - [Notifications](API/fliplet-notifications) (`fliplet-notifications`)
  - [OAuth2](API/fliplet-oauth2) (`fliplet-oauth2`) (Beta)
  - [Payments](API/fliplet-payments) (`fliplet-payments`)
  - [Session](API/fliplet-session) (`fliplet-session`)
  - [Studio UI](UI-guidelines-interface) (`fliplet-studio-ui`)
  - [Themes](API/fliplet-themes) (`fliplet-themes`)
  - [Page](API/fliplet-page) (`fliplet-pages`)
  - [UI](API/fliplet-ui)

---

## Fliplet Components

  - [Accordions](API/components/accordions)
  - [Data Directory](API/components/data-directory)
  - [List (from data source)](API/components/list-from-data-source)
  - [Form](API/components/form-builder)
  - [Chat](API/components/chat)
  - [Charts](API/components/charts)
  - [Push Notifications](API/components/push-notifications)
  - [Interactive Graphics](API/components/interactive-graphics)
  - [Email Verification](API/components/email-verification)
  - [Bottom icon bar menu](API/components/menu-bottom-icon-bar)

---

## Third-party integrations

  - [Single Sign-on with SAML2](API/integrations/sso-saml2)
  - Single Sign-on with OAuth2 (Coming soon)

---

## Third-party libraries

  - [Handlebars](API/libraries/handlebars)

---

## Private JS APIs

These APIs are currently undocumented and reserved for internal use. They are usually available to components in the system hence don't require the user to access them directly.

  - App Submissions
  - App Logs
  - Chat
  - Interact
  - Menu
  - Native
  - Pages
  - Runtime
  - Security
