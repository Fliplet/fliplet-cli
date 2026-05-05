---
title: Fliplet.UI
description: "Fliplet-managed UI primitives — toasts, action sheets, modals, date/time pickers, typeahead, tables, panzoom — under the Fliplet.UI namespace."
type: api-reference
tags: [js-api]
v3_relevant: true
deprecated: false
exclude_from_v3_catalog: true
---
# `Fliplet.UI`

The `Fliplet.UI` namespace contains classes for Fliplet-managed UI primitives such as toasts, action sheets, modals, date and time pickers, typeahead, tables, and panzoom. Where appropriate, these UI elements come with the following benefits:

  - Optimized usability across all devices/platforms
  - Support for localization incl. RTL language
  - Support for accessibility
  - Support for appearance settings
  - Centrally managed by Fliplet to maintain support through OS & browser upgrades

All pages load the `fliplet-pages` by default. It includes support for the following UI elements.

  - [Actions](fliplet-ui-actions)
  - [Toast](fliplet-ui-toast)
    - [Error Toast](fliplet-ui-toast-error)

The following UI elements are optionally available by adding extra packages to your app.

## Date & Time

  - [Date Picker](fliplet-ui-datepicker) (`fliplet-ui-datetime`)
  - [Time Picker](fliplet-ui-timepicker) (`fliplet-ui-datetime`)
  - [Date Range](fliplet-ui-daterange) (`fliplet-ui-datetime`)
  - [Time Range](fliplet-ui-timerange) (`fliplet-ui-datetime`)

## Number

  - [Number Input](fliplet-ui-number) (`fliplet-ui-number`)
  - [Range Slider](fliplet-ui-rangeslider) (`fliplet-ui-rangeslider`)

## Multiple choice

  - [Typeahead](fliplet-ui-typeahead) (`fliplet-ui-typeahead`)

## Data Display

  - [Table](fliplet-table) (`fliplet-table`)

## Others

  - [PanZoom](fliplet-ui-panzoom) (`fliplet-ui-panzoom`)
