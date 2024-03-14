# Context targeting

Fliplet uses [Modernizr](https://modernizr.com/) (`v3.5.0`) to help developers target users with specific device capabilities and contexts. This lets you target users via selectors and flags provided by HTML classes and JavaScript.

## Example

A class `no-touchevents` or `touchevents` is added to the `<html>` element depending on whether a device supports touch events, i.e. if the user on a touch device.

A property with the same name `Modernizr.touchevents` will also return `true` or `false`.

**CSS usage**

```html
<div id="target">This text is red on touch devices and green on non-touch devices.</div>
```

```css
.touchevents #target {
  color: red;
}

.no-touchevents #target {
  color: green;
}
```

**JavaScript usage**

```js
if (Modernizr.touchevents) {
  alert('You are using a touch device.');
} else {
  alert('You are not using a touch device.');
}
```

**For a list of supported tests, type `Object.keys(Modernizr)` into the developer console.**

## Custom Fliplet Modernizr tests

Fliplet adds some custom tests to Modernizr to help detect and target the following contexts.

| Detect | CSS class/JS property |
| --- | --- |
| iOS | `ios` |
| Android | `android` |
| Windows | `windows` |
| Web | `web` |
| Native | `native` |
| Mobile `width < 640px` | `mobile` |
| Tablet `width >= 640px` | `tablet` |
| Desktop `width >= 1024px` | `desktop` |
| Device with a notch | `notch` |

---

## CSS Class to show content in Fliplet Studio while in edit mode

Use the `.visible-interact` class to show your content only when is being seen in Fliplet Studio while in edit mode. Otherwise, the elements will be hidden (e.g. preview mode, web apps, iOS and Android apps).

```html
<div class="visible-interact">
  <p>This will only be displayed while in Fliplet Studio in edit mode.</p>
</div>
```

You can also use Fliplet's JS APIs to programmatically achieve the same result:

```js
if (!Fliplet.Env.get('interact')) {
  // Hide the element when we're not in Fliplet Studio in edit mode
  $('div').hide();
}
```

However, we do recommend using the `.visible-interact` CSS class to avoid having the content briefly displayed on the screen before it gets hid by Javascript.

---

## CSS Classes to show/hide content

For faster development, use these utility classes for showing and hiding content by various contexts.

**Note: These only work for the custom Fliplet Modernizr tests. When editing apps in Studio, these classes will be disabled so that all the available content is visible for editing.**

### Available classes

Use a single or combination of the available classes for toggling content across different contexts.

#### Operating Systems

|   | iOS | Android | Windows |
| --- | --- | --- | --- |
| `.visible-ios-*` | **Visible** | Hidden | Hidden |
| `.visible-android-*` | Hidden | **Visible** | Hidden |
| `.visible-windows-*` | Hidden | Hidden | **Visible** |
| `.hidden-ios` | Hidden | **Visible** | **Visible** |
| `.hidden-android` | **Visible** | Hidden | **Visible** |
| `.hidden-windows` | **Visible** | **Visible** | Hidden |

#### Platforms

|   | Web | Native |
| --- | --- | ---
| `.visible-web-*` | **Visible** | Hidden |
| `.visible-native-*` | Hidden | **Visible** |
| `.hidden-web` | Hidden | **Visible** |
| `.hidden-native` | **Visible** | Hidden |

#### Screen sizes

|   | Mobile (`< 640px`) | Tablet (`>= 640px`) | Desktop (`>= 1024px`) |
| --- | --- | ---
| `.visible-mobile-*` | **Visible** | Hidden | Hidden |
| `.visible-tablet-*` | Hidden | **Visible** | Hidden |
| `.visible-desktop-*` | Hidden | Hidden | **Visible** |
| `.hidden-mobile` | Hidden | **Visible** | **Visible** |
| `.hidden-tablet` | **Visible** | Hidden | **Visible** |
| `.hidden-desktop` | **Visible** | **Visible** | Hidden |

#### iPhone X

|   | iPhone X | Not iPhone X |
| --- | --- | ---
| `.visible-iphonex-*` | **Visible** | Hidden |
| `.hidden-iphone-x` | Hidden | **Visible** |

The `.visible-*-*` classes for each context come in three variations, one for each CSS display property value listed below.

| Group of classes | CSS `display` |
| --- | --- |
| `.visible-*-block` |  `display: block;` |
| `.visible-*-inline` |  `display: inline;` |
| `.visible-*-inline-block` |  `display: inline-block;` |

---

### Programmatically show and hide elements for app templates

Nest your selectors within the following classes (applied to the screen's `html`) to show and hide content for app templates or non-template apps:

|   | App template | Regular app |
| --- | --- | ---
| `.no-app-template` |   | **X** |
| `.app-template` | **X** |   |

Example (SCSS code):

```scss
.app-template {
  /* styles for when the app is a template */

  button { display: block }
}

.no-app-template {
  /* styles for when the app is NOT a template */

  form { font-size: 10px }
}
```

---

You can also use Fliplet's JS APIs to programmatically achieve the same results

```js
var isTemplate = Fliplet.Env.get('appTemplate');

if (isTemplate) {
  $('button').show()
}
```
