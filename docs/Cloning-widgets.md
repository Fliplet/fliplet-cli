# Working with your components

Once you have published a component on Fliplet, its source can be retrieved at any time from any machine as long as you're logged in on the CLI with an account that has got access to it.

Simply use the `clone` command to download a copy of the source code, given a component package name:

```
$ fliplet clone com.fliplet.primary-button

Cloning widget Primary Button (com.fliplet.primary-button).

Please type the path where this widget should be saved to. Press return to use "widget-primary-button".
Done! Widget cloned to "widget-primary-button".
```

---

You can also list all components you have got access to, by using the `list` command as follows:

```
$ fliplet list

Here's the widgets you have access to and can be downloaded:

• Inline Link
  - Package name: com.fliplet.inline-link
  - Version: 1.0.0

• Primary Button
  - Package name: com.fliplet.primary-button
  - Version: 1.0.0

• Push notifications
  - Package name: com.fliplet.push-notifications
  - Version: 1.0.0

To download a widget, type: fliplet clone <packageName>
```

---

To publish a component on Fliplet, please refer to the [publishing](Publishing) documentation.

---

[Back](README.md)
{: .buttons}