# JS API Documentation

Feeling lost? Head to the [JS APIs](JS-APIs.md) section of the docs to read more about using these packages in your Fliplet apps, components and themes.

<p class="quote">Are you rather looking for our <strong>RESTful APIs</strong> for complex backend integrations? Jump to our <a href="/REST-API-Documentation.html">documentation</a> to read more.</p>

---

{% raw %}
<section class="blocks alt">
  <a class="bl two" href="/API/fliplet-core.html">
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
  <a class="bl two" href="/API/fliplet-datasources.html">
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
  <a class="bl two" href="/API/fliplet-core.html">
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
  <a class="bl two" href="/API/fliplet-datasources.html">
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

- [Audio](API/fliplet-audio.md) (`fliplet-audio`)
- [Audio Player](API/fliplet-audio-player.md) (`fliplet-audio-player`)
- [Barcode](API/fliplet-barcode.md) (`fliplet-barcode`)
- [Communicate](API/fliplet-communicate.md) (`fliplet-communicate`)
- [Content](API/fliplet-content.md) (`fliplet-content`)
- [Core](API/fliplet-core.md) (`fliplet-core`)
- [CSV](API/fliplet-csv.md) (`fliplet-csv`)
- [Data Sources](API/fliplet-datasources.md) (`fliplet-datasources`)
- [Database](API/fliplet-database.md) (`fliplet-database`)
- [Encryption](API/fliplet-encryption.md) (`fliplet-encryption`)
- [Helper](API/fliplet-helper.md) (`fliplet-helper`)
- [Gamify](API/fliplet-gamify.md) (`fliplet-gamify`)
- [Like Buttons](API/like-buttons.md) (`fliplet-like:0.2`) (Beta)
- [Media](API/fliplet-media.md) (`fliplet-media`)
- [Notifications](API/fliplet-notifications.md) (`fliplet-notifications`)
- [OAuth2](API/fliplet-oauth2.md) (`fliplet-oauth2`) (Beta)
- [Session](API/fliplet-session.md) (`fliplet-session`)
- [Studio UI](UI-guidelines-interface.md) (`fliplet-studio-ui`)
- [Themes](API/fliplet-themes.md) (`fliplet-themes`)
- [UI](API/fliplet-ui.md) (`fliplet-pages`)

---

## Fliplet Components

- [Accordions](API/components/accordions.md)
- [Data Directory](API/components/data-directory.md)
- [List (from data source)](API/components/list-from-data-source.md)
- [Form Builder](API/components/form-builder.md)
- [Chat](API/components/chat.md)
- [Charts](API/components/charts.md)
- [Push Notifications](API/components/push-notifications.md)
- [Interactive Graphics](API/components/interactive-graphics.md)

---

## Third-party integrations

- [Single Sign-on with SAML2](API/integrations/sso-saml2.md)
- Single Sign-on with OAuth2 (Coming soon)

---

## Third-party libraries

- [Handlebars](API/libraries/handlebars.md)

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