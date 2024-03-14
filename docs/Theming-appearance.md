# Theme and appearance for components

Components can easily integrate with our theming and appearance settings UI seen in Fliplet Studio. Let's go through the process of setting up the basic structure in your component repository.

## Setup

### 1. Configure the list of configurable properties

Start by adding the list of CSS-related properties a user should be able to configure via the Fliplet Studio theme settings UI.

Open up the `widget.json` file of your component and add a new `themeSettings` key using the sample content found below:

```json
"themeSettings": {
  "variablePrefix": "myComponentName",
  "variables": [
    {
      "description": "Background color",
      "fields": [
        {
        "name": "background",
        "default": "#FFFFFF",
        "label": "Background color",
        "type": "color"
        }
      ]
    }
  ]
}
```

Make sure to change the `variablePrefix` value with a unique "camelCase" name that will be used as a prefix for your theme variables.

As an example, the list above declares a configurable color that will end up saved as the "background" property. However, to reference this in your SCSS files you will be using the variable prefix you defined for your component, e.g. `$myComponentName-background`.

### 2. Add a SCSS file to the list of assets

Open up the `widget.json` file and list a new file named `css/index.scss` in the `build > assets` array:

```json
"build": {
  "dependencies": [],
  "assets": [
    "css/index.scss",
  ]
}
```

Finally, go ahead and create a new empty file with name `index.scss` in the `css` folder of your repository. This will be the entry point for your SCSS declarations.

### 3. Configure the SCSS declarations

Here follows the initial structure you should be using for your `index.scss` file.

Make sure to update the `packageName` and `variablePrefix` variables using the widget `package` name defined in `widget.json` and the `variablePrefix` defined in the `themeSettings` of `widget.json`:

```scss
/* UPDATE PACKAGE NAME AND VARIABLE PREFIX USING THE SAME VALUES AS "widget.json" */
$packageName: 'com.fliplet.helper-decision-tree';
$variablePrefix: "decisionTree";

/* ----------------------------------------------------- */

@import "package:com.fliplet.theme.default/scss/core/variables";
@import "package:com.fliplet.theme.default/scss/core/mixins";

@mixin componentStyles($options: (), $widgetInstanceId: "", $widgetInstanceUUID: "") {
  /* LIST HERE ALL VARIABLES FROM YOUR THEME, INCLUDING TABLET AND DESKTOP */
  $configuration: map-merge(
    (
      decisionTree-background: $decisionTree-background,
      decisionTree-backgroundTablet: $decisionTree-backgroundTablet,
      decisionTree-backgroundDesktop: $decisionTree-backgroundDesktop,
    ),
    $options
  );

  $instanceSelector: '[data-widget-package="#{$packageName}"]';

  @if $widgetInstanceUUID != "" {
    $instanceSelector: '#{$instanceSelector}[data-uuid="#{$widgetInstanceUUID}"]';
  } @else if $widgetInstanceId != "" {
    $instanceSelector: '#{$instanceSelector}[data-id="#{$widgetInstanceId}"]';
  }

  #{$instanceSelector} {
    /* --------------- STYLES GO HERE --------------- */

    background-color: map-get($configuration, decisionTree-background);

    // Styles for tablet
    @include above($tabletBreakpoint) {
      background-color: map-get($configuration, decisionTree-backgroundTablet);
    }

    // Styles for desktop
    @include above($desktopBreakpoint) {
      background-color: map-get($configuration, decisionTree-backgroundDesktop);
    }

    /* ---------------- END OF STYLES ---------------- */
  }
}

/* Export common styles */
@include componentStyles();

/* Export styles for each widget instance */
@if variable-exists(widgetInstances) {
  @each $widgetInstance in $widgetInstances {
    @if nth($widgetInstance, 2) == $variablePrefix {
      @include componentStyles(nth($widgetInstance, 3), nth($widgetInstance, 1), nth($widgetInstance, 4));
    }
  }
}
```

All variables to be configured via the Fliplet Studio UI should be listed in the `map-merge` you see in the initial part of the file:

```scss
$configuration: map-merge(
  (
    decisionTree-background: $decisionTree-background,
    decisionTree-backgroundTablet: $decisionTree-backgroundTablet,
    decisionTree-backgroundDesktop: $decisionTree-backgroundDesktop,
  ),
  $options
);
```

Each property includes two additional variations for tablet and desktop as seen above.

You can then use the variable by fetching them from the map using `map-get` in the SCSS definitions, e.g.:

```scss
foo {
  background-color: map-get($configuration, decisionTree-background);
}
```

---

## Field types

### Color

- `type`: `color`

```json
{
  "name": "componentForeground",
  "default": "#FFFFFF",
  "label": "Foreground color",
  "type": "color"
}
```

---

### Background

- `type`: `background`

```json
{
  "name": "componentBackground",
  "default": "None",
  "label": "Background color",
  "type": "background"
}
```

---

### Font family

- `type`: `font`

```json
{
  "name": "headingFontFamily",
  "default": "helvetica",
  "label": "Heading font family",
  "type": "font"
}
```

---

### Font style

- `type`: `font-style`

```json
{
  "name": "headingFontWeight",
  "default": "helvetica",
  "label": "Heading font style",
  "type": "font-style"
}
```

### Size

---

- `type`: `size`

```json
{
  "name": "outlineWidth",
  "default": "2px",
  "label": "Outline Width",
  "type": "size"
}
```

---

### Select one

- `type`: `select`

```json
{
  "name": "textBackgroundRepeat",
  "default": "no-repeat",
  "label": "Repeat",
  "type": "select",
  "properties": {
    "no-repeat": "Do not repeat",
    "repeat-x": "Repeat horizontally",
    "repeat-y": "Repeat vertically"
  }
}
```