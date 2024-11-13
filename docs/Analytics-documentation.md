# Analytics Events

## Page Analytics

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.pageView` | N/A | N/A | Screen view logged from app |

## App Events
### Navigation & Core Actions

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `about-overlay` | `link` | User has open the about this app overlay |
| `analytics.event` | `action` | `link` | User has clicked a link with an action type |
| `analytics.event` | `app` | `link` | User navigates to a link |
| `analytics.event` | `back` | `link` | User has clicked the back button |
| `analytics.event` | `exit-app` | `link` | User has exited the application |
| `analytics.event` | `logout` | `link` | User has logged out of the application |
| `analytics.event` | `screen` | `link` | User has navigated to a new screen |

### App Management

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `app_update_check` | `app_update` | User has manually checked for updates |
| `analytics.event` | `delete` | `application` | User has deleted an application |
| `analytics.event` | `open` | `application` | User has opened an application |

### Sharing

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `app_share_button_clicked` | `app_sharing` | User has clicked on app sharing button |
| `analytics.event` | `close` | `share_url` | User has closed the share popup |
| `analytics.event` | `open` | `share_url` | User has opened the share URL interface |
| `analytics.event` | `copy` | `share_url` | User has copied a shared URL to clipboard |
| `analytics.event` | `email` | `share_url` | User has shared content via email |

#### Share Platforms

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `com.apple.UIKit.activity.AirDrop` | `share_url` | User has shared content via AirDrop |
| `analytics.event` | `com.apple.UIKit.activity.CopyToPasteboard` | `share_url` | User has copied content to clipboard |
| `analytics.event` | `com.apple.UIKit.activity.Mail` | `share_url` | User has shared content via Mail |
| `analytics.event` | `com.apple.UIKit.activity.Message` | `share_url` | User has shared content via Messages |
| `analytics.event` | `com.microsoft.Office.Outlook.compose-shareextension` | `share_url` | User has shared content via Outlook |
| `analytics.event` | `facebook` | `share_url` | User has shared content via Facebook |
| `analytics.event` | `linkedin` | `share_url` | User has shared content via LinkedIn |
| `analytics.event` | `messenger` | `share_url` | User has shared content via Messenger |
| `analytics.event` | `net.whatsapp.WhatsApp.ShareExtension` | `share_url` | User has shared content via WhatsApp |
| `analytics.event` | `telegram` | `share_url` | User has shared content via Telegram |
| `analytics.event` | `twitter` | `share_url` | User has shared content via Twitter |
| `analytics.event` | `vkontakte` | `share_url` | User has shared content via VKontakte |
| `analytics.event` | `whatsapp` | `share_url` | User has shared content via WhatsApp |
| `analytics.event` | `line` | `share_url` | User has shared content via Line |

## Component Events
### Authentication & Security
#### Lock Screen

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `enter_fail` | `lock_screen` | User has failed to enter the correct lock screen credentials |
| `analytics.event` | `enter_success` | `lock_screen` | User has successfully entered lock screen credentials |
| `analytics.event` | `forgot_passcode` | `lock_screen` | User has initiated the forgot passcode flow on the lock screen |
| `analytics.event` | `setup_back` | `lock_screen` | User has navigated back during lock screen setup |
| `analytics.event` | `setup_fail` | `lock_screen` | User has failed to complete lock screen setup |
| `analytics.event` | `setup_success` | `lock_screen` | User has successfully completed lock screen setup |

#### Touch ID

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `touchid_admin_enabled` | `lock_screen` | Administrator has enabled Touch ID functionality |
| `analytics.event` | `touchid_available` | `lock_screen` | Touch ID has been detected as available on the device |
| `analytics.event` | `touchid_cancelled` | `lock_screen` | User has cancelled the Touch ID authentication |
| `analytics.event` | `touchid_manual_activated` | `lock_screen` | User has manually activated Touch ID |
| `analytics.event` | `touchid_verified` | `lock_screen` | User has successfully verified using Touch ID |

#### Login & Verification

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `login_fail` | `login_datasource` | User has failed to login using datasource authentication |
| `analytics.event` | `login_pass` | `login_datasource` | User has successfully logged in using datasource authentication |
| `analytics.event` | `forgot_password` | `login_datasource` | User has initiated the forgot password flow for datasource login |
| `analytics.event` | `login_fail` | `login_fliplet` | User has failed to login using Fliplet authentication |
| `analytics.event` | `login_pass` | `login_fliplet` | User has successfully logged in using Fliplet authentication |
| `analytics.event` | `login_2fa_required` | `login_fliplet` | User has been prompted for two-factor authentication during Fliplet login |
| `analytics.event` | `forgot_password` | `login_fliplet` | User has initiated the forgot password flow for Fliplet login |

#### Email & SMS Verification

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `authenticate_fail` | `email_verification` | User has a failed authentification against the email verification component |
| `analytics.event` | `authenticate_pass` | `email_verification` | User has a successful authentification against the email verification component |
| `analytics.event` | `code_request` | `email_verification` | User has been sent a code for email verification component |
| `analytics.event` | `code_resend` | `email_verification` | User has requested code to be resent for the email verification |
| `analytics.event` | `code_verify` | `email_verification` | User has verified the code for email verification |
| `analytics.event` | `request_skip` | `email_verification` | User has chosen to skip the email verification process |
| `analytics.event` | `authenticate_fail` | `sms_verification` | User has a failed authentification against the sms verification component |
| `analytics.event` | `authenticate_pass` | `sms_verification` | User has a successful authentification against the sms verification component |
| `analytics.event` | `code_request` | `sms_verification` | User has been sent a code for the sms verification component |
| `analytics.event` | `code_resend` | `sms_verification` | User has requested code to be resent for the sms verification |
| `analytics.event` | `code_verify` | `sms_verification` | User has verified the code for SMS verification |
| `analytics.event` | `request_skip` | `sms_verification` | User has chosen to skip the SMS verification process |

### List From Data (LFD) Components
#### Common List Actions

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `open` | `LFD` | User has opened a List from Data component |
| `analytics.event` | `client_prefilter` | `list_dynamic` | User has applied a filter to a dynamic list |
| `analytics.event` | `mixitup_init` | `list_dynamic` | User has initialized the mixitup filter interface |

#### Entry Management (Common across styles)

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `entry_bookmark` | `list_dynamic_agenda` | User has bookmarked an entry in the agenda style of LFD |
| `analytics.event` | `entry_unbookmark` | `list_dynamic_agenda` | User has removed a bookmark from an entry in the agenda style of LFD |
| `analytics.event` | `entry_open` | `list_dynamic_agenda` | User has opened an entry in the agenda style of LFD |
| `analytics.event` | `entry_bookmark` | `list_dynamic_news-feed` | User has bookmarked an entry in the news feed style of LFD |
| `analytics.event` | `entry_unbookmark` | `list_dynamic_news-feed` | User has removed a bookmark from an entry in the news feed style of LFD |
| `analytics.event` | `entry_open` | `list_dynamic_news-feed` | User has opened an entry in the news feed style of LFD |
| `analytics.event` | `entry_bookmark` | `list_dynamic_simple-list` | User has bookmarked an entry in the simple list style of LFD |
| `analytics.event` | `entry_unbookmark` | `list_dynamic_simple-list` | User has removed a bookmark from an entry in the simple list style of LFD |
| `analytics.event` | `entry_open` | `list_dynamic_simple-list` | User has opened an entry in the simple list style of LFD |
| `analytics.event` | `entry_bookmark` | `list_dynamic_small-card` | User has bookmarked an entry in the small card style of LFD |
| `analytics.event` | `entry_unbookmark` | `list_dynamic_small-card` | User has removed a bookmark from an entry in the small card style of LFD |
| `analytics.event` | `entry_open` | `list_dynamic_small-card` | User has opened an entry in the small card style of LFD |
| `analytics.event` | `entry_open` | `list_dynamic_small-h-card` | User has opened an entry in the small horizontal card style of LFD |

#### Search & Filter Controls

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `search_filter_controls_activate` | `list_dynamic_agenda` | User has activated search and filter controls in the agenda style of LFD |
| `analytics.event` | `search_filter_controls_overlay_activate` | `list_dynamic_agenda` | User has activated search and filter controls overlay in the agenda style of LFD |
| `analytics.event` | `search` | `list_dynamic_agenda` | User has performed a search in the agenda style of LFD |
| `analytics.event` | `filter` | `list_dynamic_agenda` | User has applied a filter in the agenda style of LFD |
| `analytics.event` | `filter_date` | `list_dynamic_agenda` | User has filtered by date in the agenda style of LFD |
| `analytics.event` | `search_filter_controls_activate` | `list_dynamic_news-feed` | User has activated search and filter controls in the news feed style of LFD |
| `analytics.event` | `search_filter_controls_overlay_activate` | `list_dynamic_news-feed` | User has activated search and filter controls overlay in the news feed style of LFD |
| `analytics.event` | `search` | `list_dynamic_news-feed` | User has performed a search in the news feed style of LFD |
| `analytics.event` | `filter` | `list_dynamic_news-feed` | User has applied a filter in the news feed style of LFD |
| `analytics.event` | `search_filter_controls_activate` | `list_dynamic_simple-list` | User has activated search and filter controls in the simple list style of LFD |
| `analytics.event` | `search_filter_controls_overlay_activate` | `list_dynamic_simple-list` | User has activated search and filter controls overlay in the simple list style of LFD |
| `analytics.event` | `search` | `list_dynamic_simple-list` | User has performed a search in the simple list style of LFD |
| `analytics.event` | `filter` | `list_dynamic_simple-list` | User has applied a filter in the simple list style of LFD |
| `analytics.event` | `search_filter_controls_activate` | `list_dynamic_small-card` | User has activated search and filter controls in the small card style of LFD |
| `analytics.event` | `search_filter_controls_overlay_activate` | `list_dynamic_small-card` | User has activated search and filter controls overlay in the small card style of LFD |
| `analytics.event` | `search` | `list_dynamic_small-card` | User has performed a search in the small card style of LFD |
| `analytics.event` | `filter` | `list_dynamic_small-card` | User has applied a filter in the small card style of LFD |

#### Comments

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `comment_copy` | `list_dynamic_news-feed` | User has copied a comment in the news feed style of LFD |
| `analytics.event` | `comment_delete` | `list_dynamic_news-feed` | User has deleted a comment in the news feed style of LFD |
| `analytics.event` | `comment_edit` | `list_dynamic_news-feed` | User has initiated editing a comment in the news feed style of LFD |
| `analytics.event` | `comment_save_edit` | `list_dynamic_news-feed` | User has saved an edited comment in the news feed style of LFD |
| `analytics.event` | `comment_entered` | `list_dynamic_news-feed` | User has started typing a comment in the news feed style of LFD |
| `analytics.event` | `comment_options` | `list_dynamic_news-feed` | User has clicked on comment options in the news feed style of LFD |
| `analytics.event` | `comment_send` | `list_dynamic_news-feed` | User has submitted a new comment in the news feed style of LFD |
| `analytics.event` | `comments_open` | `list_dynamic_news-feed` | User has opened the comments section in the news feed style of LFD |
| `analytics.event` | `comment_entered` | `list_dynamic_simple-list` | User has started typing a comment in the simple list style of LFD |
| `analytics.event` | `comment_options` | `list_dynamic_simple-list` | User has clicked on comment options in the simple list style of LFD |
| `analytics.event` | `comment_save_edit` | `list_dynamic_simple-list` | User has saved an edited comment in the simple list style of LFD |
| `analytics.event` | `comment_send` | `list_dynamic_simple-list` | User has submitted a new comment in the simple list style of LFD |
| `analytics.event` | `comments_open` | `list_dynamic_simple-list` | User has opened the comments section in the simple list style of LFD |

#### Likes & Social Interactions

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `entry_like` | `list_dynamic_news-feed` | User has liked an entry in the news feed style of LFD |
| `analytics.event` | `entry_unlike` | `list_dynamic_news-feed` | User has removed a like from an entry in the news feed style of LFD |
| `analytics.event` | `entry_like` | `list_dynamic_simple-list` | User has liked an entry in the simple list style of LFD |
| `analytics.event` | `entry_unlike` | `list_dynamic_simple-list` | User has removed a like from an entry in the simple list style of LFD |

#### Profile & Card Interactions

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `profile_buttons` | `list_dynamic_small-card` | User has interacted with profile buttons in the small card style of LFD |
| `analytics.event` | `profile_open` | `list_dynamic_small-card` | User has opened a profile in the small card style of LFD |
| `analytics.event` | `profile_buttons` | `list_dynamic_small-h-card` | User has interacted with profile buttons in the small horizontal card style of LFD |

#### Bookmarks Display

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `bookmarks_hide` | `list_dynamic_agenda` | User has clicked to hide the bookmarks on the Agenda list |
| `analytics.event` | `bookmarks_show` | `list_dynamic_agenda` | User has clicked to show the bookmarks on the Agenda list |

### Directory Component

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `entry_filter` | `directory` | User has filtered entries in the directory |
| `analytics.event` | `entry_open` | `directory` | User has opened an entry in the directory |
| `analytics.event` | `filter` | `directory` | User has applied a filter in the directory |
| `analytics.event` | `search` | `directory` | User has performed a search in the directory |
| `analytics.event` | `search_activate` | `directory` | User has activated the search interface in the directory |

### Media Components
#### Audio Player

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `delete` | `audio_player` | User has deleted an audio file from the audio player |
| `analytics.event` | `download` | `audio_player` | User has initiated an audio file download |
| `analytics.event` | `download_cancel` | `audio_player` | User has cancelled an audio file download |
| `analytics.event` | `pause` | `audio_player` | User has paused audio playback |
| `analytics.event` | `play_offline` | `audio_player` | User has played audio in offline mode |
| `analytics.event` | `play_stream` | `audio_player` | User has started audio stream playback |

#### Video Player

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `load_stream_offline` | `video` | User has loaded a video stream in offline mode |
| `analytics.event` | `load_stream_online` | `video` | User has loaded a video stream in online mode |
| `analytics.event` | `pause_stream` | `video` | User has paused video stream playback |
| `analytics.event` | `play_stream` | `video` | User has started video stream playback |

### Navigation & Links

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `document` | `link` | User has clicked on a document link |
| `analytics.event` | `gallery` | `link` | User has opened a gallery link |
| `analytics.event` | `popup` | `link` | User has opened a popup link |
| `analytics.event` | `url_open` | `link` | User has opened a URL link |
| `analytics.event` | `video` | `link` | User has opened a video link |

### Form & List Interactions

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `reset` | `form` | User has reset a form to its default state |
| `analytics.event` | `submit` | `form` | User has submitted a form |
| `analytics.event` | `my_list` | `list` | User has accessed their personal list |
| `analytics.event` | `swipe_save` | `list` | User has saved an item using swipe gesture |
| `analytics.event` | `swipe_unsave` | `list` | User has unsaved an item using swipe gesture |

### Notifications

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `inbox_visit` | `notification_inbox` | User has visited the notification inbox |
| `analytics.event` | `load_more` | `notification_inbox` | User has loaded more notifications in the inbox |
| `analytics.event` | `notification_open` | `notification_inbox` | User has opened a notification from the inbox |
| `analytics.event` | `notification_read_all` | `notification_inbox` | User has marked all notifications as read |
| `analytics.event` | `notification_settings` | `notification_inbox` | User has accessed notification settings |

### Other Components
#### Accordion

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `open` | `accordion` | User has opened an accordion element |

#### Charts

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `data_point_interact` | `chart` | User has interacted with a data point on a chart |
| `analytics.event` | `legend_filter` | `chart` | User has filtered data using the chart legend |

#### Market Comparison

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `topic` | `market_comparison` | User has selected a topic for market comparison |

#### Onboarding

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `button_click` | `onboarding` | User has clicked a button within the onboarding interface |
| `analytics.event` | `skip` | `onboarding` | User has chosen to skip the onboarding process |

### User Management

| Type | Action | Category | Description |
|------|---------|-----------|-------------|
| `analytics.event` | `user-added` | | User has been added to the system |
| `analytics.event` | `user-removed` | | User has been removed from the system |
