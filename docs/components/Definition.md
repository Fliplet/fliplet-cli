# The component definition file

The `widget.json` file defines your component as well as the **dependencies** and **assets** it needs in order to run.

Let's have a look at an example and we'll explain how each section works:

```json
{
  "name": "my Awesome Component",
  "package": "com.example.my-awesome-component",
  "version": "1.0.0",
  "icon": "img/icon.png",
  "tags": [
    "type:component",
    "category:general"
  ],
  "provider_only": false,
  "references": [],
  "html_tag": "span",
  "interface": {
    "dependencies": [
      "fliplet-core",
      "fliplet-studio-ui"
    ],
    "assets": [
      "js/interface.js"
    ]
  },
  "build": {
    "dependencies": [
      "jquery",
      "bootstrap"
    ],
    "assets": [
      "css/build.css"
    ]
  }
}
```

## "name"

The title of your component. This will be visible on Fliplet Studio when a user will select a component.

## "package"

A unique string to define your component on Fliplet. It's usually named after your company website and component name but in reverse order.

e.g. Given my company website is `fliplet.com` and the component I'm developing is a YouTube Video player, I will use `com.fliplet.youtube` (or even `com.fliplet.video.youtube` or `com.fliplet.youtube-video`).

---

<a href="../Building-components.html" class="btn">Back to components</a>