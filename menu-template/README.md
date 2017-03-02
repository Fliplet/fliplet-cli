# {{name}}

This menu includes the `fliplet-menu` dependency by default, though you can safely get rid of it if you don't intend to use the default stylesheet included.

The toggle of your menu must be declared using `data-fl-toggle-menu="jquerySelector"` attribute. The jQuery selector will get its `"active"` class toggled on and off when the toggle is clicked/tapped.

You should also have at least one html tag with the `data-fl-navigate-back` attribute to let the user navigate back.