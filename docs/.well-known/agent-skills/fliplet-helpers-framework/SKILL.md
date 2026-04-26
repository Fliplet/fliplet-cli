---
name: fliplet-helpers-framework
description: Build helpers — reusable Vue-based interface components with editable interface fields, hooks, methods, libraries, and templates.
---

# Fliplet helpers framework

Build helpers — reusable Vue-based interface components with editable interface fields, hooks, methods, libraries, and templates.

## Documentation

- [Distributing Helpers as components](https://developers.fliplet.com/API/helpers/components.html): Package a Fliplet Helper as a reusable widget-framework component so it can be installed and dropped into apps like any first-party component.
- [Dynamic components](https://developers.fliplet.com/API/helpers/dynamic-components.html): Render Helper instances inside Dynamic Container and List Repeater components, with reactive per-record data binding via `supportsDynamicContext`.
- [Helper example: decision tree](https://developers.fliplet.com/API/helpers/example-decision-tree.html): Worked example: build a decision-tree Helper that presents a question, waits for the user's answer, then advances to the next question.
- [Helper example: question and answer](https://developers.fliplet.com/API/helpers/example-question.html): A worked example showing how to build a Helper that presents a multiple-choice question and reveals whether the selected answer is correct.
- [Helper fields (attributes)](https://developers.fliplet.com/API/helpers/fields.html): Pass attributes to a Helper via the HTML `field` element and read them inside the Helper via `this.fields.<name>`.
- [Helper lifecycle hooks and events](https://developers.fliplet.com/API/helpers/hooks.html): Run code at key points in a Helper's lifecycle using the `beforeReady` and `ready` render hooks.
- [Helper configuration interface: fields](https://developers.fliplet.com/API/helpers/interface-fields.html): Define the fields shown in a Helper's Fliplet Studio configuration interface, including their type, label, validation, and default value.
- [Helper configuration interface: hooks and events](https://developers.fliplet.com/API/helpers/interface-hooks.html): Run code when a Helper's configuration interface initializes, becomes ready, or is about to save.
- [Helper configuration interface: external libraries](https://developers.fliplet.com/API/helpers/interface-libraries.html): Include Fliplet-approved or third-party JavaScript and CSS libraries in a Helper's configuration interface via the `dependencies` array.
- [Helper configuration interface: methods](https://developers.fliplet.com/API/helpers/interface-methods.html): Use `find`, `findOne`, and `children` inside a Helper's configuration interface to access nested child Helper instances.
- [Helper configuration interface](https://developers.fliplet.com/API/helpers/interface.html): Define a configuration UI for your Helper so users can set field values for each instance from within Fliplet Studio.
- [Helper external libraries](https://developers.fliplet.com/API/helpers/libraries.html): Declare a Helper's runtime dependencies by listing Fliplet-approved or third-party JS/CSS libraries in its `render.dependencies` array.
- [Helper instance and class methods](https://developers.fliplet.com/API/helpers/methods.html): Define instance methods on a Helper and call Helper class methods such as `find` and `findOne` anywhere in the app lifecycle.
- [Fliplet Helpers overview](https://developers.fliplet.com/API/helpers/overview.html): Helpers are a UI framework for building custom components in Fliplet apps using JavaScript, with a configuration interface in Fliplet Studio.
- [Fliplet Helpers quickstart](https://developers.fliplet.com/API/helpers/quickstart.html): Create your first Fliplet Helper by defining its name, template, and configuration object in screen or global JavaScript.
- [Fliplet.Helper() constructor reference](https://developers.fliplet.com/API/helpers/references/constructor.html): Reference for `Fliplet.Helper()`: the constructor used to define a new Helper in a screen or globally across an app.
- [Fliplet.Helper.field() reference](https://developers.fliplet.com/API/helpers/references/fields.html): Reference for `Fliplet.Helper.field()`: call this from a Helper's configuration interface to read or write the value of another field.
- [Fliplet.Helper query methods reference](https://developers.fliplet.com/API/helpers/references/query.html): Reference for `Fliplet.Helper` query methods used to find Helper instances on the current screen from app code or from a configuration interface.
- [Styling Helpers](https://developers.fliplet.com/API/helpers/style.html): Style a Helper using standard `class` and `style` HTML attributes — they are passed through to the rendered element rather than treated as Helper fields.
- [Helper templates](https://developers.fliplet.com/API/helpers/templates.html): Every Helper defines an HTML template that renders it on screen, with support for variable binding, conditional blocks, and loops.
- [Helper rich-content views](https://developers.fliplet.com/API/helpers/views.html): Define named rich-content views inside a Helper so app builders can drop approved child Helpers into specific regions of its layout.

## How to load full content

Replace `.html` with `.md` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
