---
name: fliplet-components-framework
description: Build custom components (widgets) that ship inside Fliplet apps: component definitions, lifecycle, events, dependencies, providers, custom templates, testing.
---

# Fliplet components framework

Build custom components (widgets) that ship inside Fliplet apps: component definitions, lifecycle, events, dependencies, providers, custom templates, testing.

## Documentation

- [Building Fliplet components](https://developers.fliplet.com/Building-components.html): How to scaffold, run, and develop a Fliplet component locally using the CLI, including the generated file layout and the local dev server.
- [Building Fliplet app action functions](https://developers.fliplet.com/Building-functions.html): How to scaffold and develop an app action function with the CLI, declare its dependencies, and configure it via widget.json.
- [Cloning widgets, components, and themes from the CLI](https://developers.fliplet.com/Cloning-widgets.html): How to use the fliplet clone and fliplet list CLI commands to download the source of a published component, menu, or theme to your machine.
- [Component events](https://developers.fliplet.com/Component-events.html): Listen for component lifecycle events (adding, added, removed, moved, render) emitted while users edit a Fliplet screen, via Fliplet.Hooks.on('componentEvent').
- [Output of components](https://developers.fliplet.com/components/Build-output.html): Render Fliplet component output from build.html via Handlebars; read per-instance settings with Fliplet.Widget.instance and support dynamic-container context.
- [The component definition file](https://developers.fliplet.com/components/Definition.html): Define a Fliplet component in widget.json: name, package, version, icon, tags, html_tag, plus interface and build entries for dependencies and assets.
- [Components interfaces](https://developers.fliplet.com/components/Interface.html): Build a Fliplet component's settings UI in interface.html with Handlebars; persist values via Fliplet.Widget.save and rehydrate with Fliplet.Widget.getData.
- [Using providers](https://developers.fliplet.com/components/Using-Providers.html): Components can display providers to get specific data from the system or need a particular piece of functionality to be added.
- [Context targeting](https://developers.fliplet.com/Context-targeting.html): Target devices in Fliplet apps via Modernizr classes and JS flags for iOS, Android, Windows, web, native, mobile/tablet/desktop, notch, and Studio edit mode.
- [Custom Headers](https://developers.fliplet.com/Custom-Headers.html): Configure custom HTTP response headers (CSP, HSTS, CORS, custom security headers) for a Fliplet app via Fliplet.App.Settings and the Developer Options panel.
- [Custom HTML templates for Fliplet components](https://developers.fliplet.com/Custom-template-for-components.html): How to override a component's default template with custom HTML and Handlebars in the new container-based drag-and-drop system.
- [Dependencies and assets](https://developers.fliplet.com/Dependencies-and-assets.html): Declare package dependencies and bundled JS/CSS/font assets for Fliplet components and themes, with separate interface and build entries plus appAssets.
- [Testing Fliplet components](https://developers.fliplet.com/Testing-components.html): Run and write tests for a Fliplet component using the CLI's test command, backed by Mocha, Chai, and Puppeteer.
- [UI guidelines for component output (build)](https://developers.fliplet.com/UI-guidelines-build.html): Recommended Bootstrap-based styles for buttons, forms, and typography in a Fliplet component's user-facing output.
- [UI guidelines for component settings (interface)](https://developers.fliplet.com/UI-guidelines-interface.html): Recommended Bootstrap-based styles for buttons, forms, and typography in a Fliplet component's Studio settings interface.

## How to load full content

Replace `.html` with `.md` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp) (tools: `search_fliplet_docs`, `fetch_fliplet_doc`), or fetch [https://developers.fliplet.com/.well-known/llms-full.txt](https://developers.fliplet.com/.well-known/llms-full.txt) for the entire site as a single stream.
