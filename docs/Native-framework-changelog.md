# Native framework changelog

We regularly update our framework to support new features. If you have an older framework version but need to use a newer feature, your app will need to be rebuilt. You can check your apps framework in the 'About this app' section.

{% raw %}
<section class="blocks">
  <div class="bl two">
    <div>
      <h4>iOS</h4>
      <p>Current release: <u>6.4.6</u></p>
      <p>Target SDK version: 26</p>
    </div>
  </div>
  <div class="bl two">
    <div>
      <h4>Android</h4>
      <p>Current release: <u>6.4.4</u></p>
      <p>Target API level: 36</p>
    </div>
  </div>
</section>
{% endraw %}

---

## Supported versions

### Version 6.4.6 (February 09, 2026)

- **iOS**: The target SDK has now been set to iOS 26.


### Version 6.4.5 (August 19, 2025)

- **iOS**: Updated Fastlane to 2.228.0

### Version 6.4.4 (July 8, 2025)

- **Android**: The target SDK has now been set to 36 (Android 16)

### Version 6.4.3 (May 8, 2025)

- **Android**: Removed broad media permissions and updated media plugins to use system media narrow picker

### Version 6.4.2 (August 20, 2024)

- **Android**: The target SDK has now been set to 34 (Android 14)

### Version 6.4.1 (June 12, 2024)

- **Android**: Update the Firebase Messaging SDK to send push notifications via FCM(Firebase Cloud Messaging)

### Version 6.4.0 (May 2, 2024)

- **iOS**: The target SDK has now been set to iOS 17.

### Version 6.3.2 (September 13, 2023)

- **Android**: Change AlarmManager API to use inexact alarm functions to schedule local notification.

### Version 6.3.1 (August 29, 2023)

- **Android**: Disables ad ID permission.

### Version 6.3.0 (August 9, 2023)

- **Android**: The target SDK has now been set to 33 (Android 13).

### Version 6.2.0 (April 14, 2023)

- **iOS**: Improved screen transitions for the launch screen on iPad.

### Version 6.1.0 (March 28, 2023)

- **iOS**: The target SDK has now been set to iOS 16.

### Version 6.0.4 (October 17, 2022)

- **Android**: Security updates.

### Version 6.0.2 (Aug 5, 2022)

- **Android**: The target SDK has now been set to 31.

### Version 6.0.0 (Jul 20, 2022)

- **All platforms**: Support for the upcoming localization feature.

### Version 5.3.2 (Jul 7, 2022)

- **iOS**: Bugfix for the share dialog not working as expected when being used by the Communicate JS API.

### Version 5.3.0 (Apr 22, 2022)

- **iOS**: Support for iOS 15.

---

## Deprecated versions

Please note that these versions have limited support for newer Fliplet features. We encourage you to submit a new native update to your apps via the App Store or Google Play if you have users still running these versions of your app.

### Version 5.2.0 (Oct 19, 2021)

- **Android**: Bugfix for apps built with the SDK30 not properly dismissing the virtual keyboard.

### Version 5.1.0 (Sep 20, 2021)

- **Android**: Support for SDK 30 and bugfixes for the camera not working as expected on Android 12.

### Version 5.0.0 (Aug 3, 2021)

- **Android**: Support for App Bundle files on Google Play and initial beta support for SDK 30.

### Version 4.6.0 (June 17, 2021)

- **Android**: Security improvements.

### Version 4.5.3 (June 15, 2021)

- **Android**: Security improvements for unzipping files.

### Version 4.5.2 (April 16, 2021)

- **All platforms**: Improvements for marking in-app notifications as read when push notifications are received.

### Version 4.5.1 (March 18, 2021)

- **All platforms**: Improvements for push notifications and displaying notification badges on the home screen.

### Version 4.5.0 (March 4, 2021)

- **All platforms**: Support for [reading push notification settings via the JS API](https://developers.fliplet.com/API/core/notifications.html#verify-the-devices-push-notification-settings).

### Version 4.4.0 (December 14, 2020)

- **All platforms**: Improvements to access new JS APIs for Notifications and open the app settings screen.
- **Android**: Support for Biometrics JS APIs (e.g. Fingerprint and Face Unlock).

### Version 4.3.0 (December 14, 2020)

- **iOS**: Improvements for push notifications.

### Version 4.2.4 (November 11, 2020)

- **iOS**: Improvements and bugfixes.

### Version 4.2.3 (September 22, 2020)

- **iOS**: Fixes an issue that prevents status bar text from correctly adapting in Dark Mode.

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
