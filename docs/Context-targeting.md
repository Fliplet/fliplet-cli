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
| iPhone X | `iphonex` |

## Classes to show/hide content

For faster development, use these utility classes for showing and hiding content by various contexts.

**Note: These only work for the custom Fliplet Modernizr tests.**

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

|   | Mobile (`< 640px`) | Tablet (`>= 640px`) |
| --- | --- | --- 
| `.visible-mobile-*` | **Visible** | Hidden |
| `.visible-tablet-*` | Hidden | **Visible** |
| `.hidden-mobile` | Hidden | **Visible** |
| `.hidden-tablet` | **Visible** | Hidden |

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