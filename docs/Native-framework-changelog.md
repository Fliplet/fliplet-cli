# Native framework changelog

We regularly update our framework to support new features. If you have an older framework version but need to use a newer feature, your app will need to be rebuilt. You can check your apps framework in the 'About this app' section.

{% raw %}
<section class="blocks">
  <div class="bl two">
    <div>
      <h4>iOS</h4>
      <p>Latest stable release: 4.2.2</p>
    </div>
  </div>
  <div class="bl two">
    <div>
      <h4>Android</h4>
      <p>Latest stable release: 4.2.0</p>
    </div>
  </div>
</section>
{% endraw %}

---

## Supported versions (4.1+)

### Version 4.2.2 (September 17, 2020)

- **iOS**: Fixed an issue that caused clipboard warnings to be triggered when user revisits an app.

### Version 4.2.1 (September 15, 2020)

- **iOS**: Added support for clearing the splash screen cache on app startup.

### Version 4.2.0 (July 24, 2020)

- **Android**: Target SDK increased to 29 (Android 10) and disabled back-ups to improve security.

### Version 4.1.4 (July 24, 2020)

- **iOS**: Fixed an issue that caused apps to crash when recording videos

### Version 4.1.3 (March 22, 2020)

- **iOS**: Improvements when playing audio files.

### Version 4.1.2 (March 17, 2020)

- **All platforms**: Improved support for new link actions in push notifications.
- **iOS**: Dropped all usage of UIWebView following [Apple's deprecation notice](https://developer.apple.com/news/?id=12232019b).
- **iOS**: Target SDK increased to iOS13.

### Version 4.1.0 (February 19, 2020)

- **iOS**: Dropped UIWebView support following [Apple's deprecation notice](https://developer.apple.com/news/?id=12232019b).
- **iOS**: Updated **InAppBrowser** Cordova plugin to its latest version.

---

## Deprecated versions

Please note that these versions have limited support for newer Fliplet features. We encourage you to submit a new native update to your apps via the App Store or Google Play if you have users still running these versions of your app.

### Version 4.0.2 (November 19, 2019)

- **iOS**: Improvements for Firebase Analytics reporting.
- **All platforms**: Removed support for **Google Analytics** following its deprecation.

### Version 4.0.1 (October 15, 2019)

- **iOS**: Fixes for push notifications on **iOS13** devices.

### Version 4.0.0 (October 8, 2019)

- **All platforms**: Support for **Firebase Analytics**.

---

### Version 3.9.9 (Aug 28, 2019)

- **iOS**: Support for iOS13.

---

### Version 3.9.8 (Jul 19, 2019)

- **iOS**: Improvements when playing remote audio files.

---

### Version 3.9.7 (June 3, 2019)

- **iOS**: Improvements when playing audio files using `Fliplet.Media`.

---

### Version 3.9.6 (April 30, 2019)

- **iOS**: Bugfixes for issues reported when playing audio files.

---

### Version 3.9.5 (April 25, 2019)

- **iOS**: Stability improvements during boot time and when performing in-app updates.

---

### Version 3.9.4 (April 16, 2019)

- **Android**: Support for Google Analytics data reporting on all versions of Android.

---

### Version 3.9.3 (April 11, 2019)

- **All platforms**: Stability improvements during the download of in-app updates.

---

### Version 3.9.2 (January 25, 2019)

- **All platforms**: Support for push notifications deep linking.
- **All platforms**: Fixes an issue where apps don't check for updates until up to 30 seconds after app launch.
- **iOS**: Fixes an issue on iPhone X/XS/XR/XS Max running iOS 12 where the screen content is sometimes shifted after dismissing the keyboard.

---

### Version 3.9.1 (December 10, 2018)

- **All platforms**: Fixed an issue which caused some apps to crash when applying app updates under certain conditions.

---

### Version 3.9.0 (October 3, 2018)

- **All platforms**: Barcode scanner plugin added.

---

### Version 3.8.5 (August 29, 2018)

- **All platforms**: SQLite plugin removed.

---

### Version 3.8.4 (May 31, 2018)

- **All platforms**: Insomnia cordova plugin added.

---

### Version 3.8.3 (May 29, 2018)

- **All platforms**: Local notifications cordova plugin added.

---

### Version 2.1.3 (May 1, 2018)

- **All platforms**: Social share cordova plugin added.
- **Android**: Fixes for camera not allowing the user to take pictures and causing the device to crash on certain devices.

---

### Version 2.1.2 (Feb 19, 2018)

- **All platforms**: Bugfixes.

---

### Version 2.1.1 (Feb 14, 2018)

- **All platforms**: Various updates to Cordova plugins.
- **All platforms**: Audio plugin added.

---

### Version 2.1.0 (Dec 13, 2017)

- **All platforms**: Improvements and bugfixes.
- **All platforms**: Enhanced logging for debugging.

---

### Version 2.0.1 (Jun 19, 2017)

- **All platforms**: Improvements and bugfixes.

---

[Back to home](README.md)
{: .buttons}
