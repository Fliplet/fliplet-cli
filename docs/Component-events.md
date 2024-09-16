# Component events

When components are moved around the page in *Edit* mode, Fliplet provides a set of events to manage the user interaction.

## Usage

```js
Fliplet.Hooks.on('componentEvent', function(event) {
  console.log(event.type); // Event type
});
```

## Parameters

```js
Fliplet.Hooks.on('componentEvent', fn);
```

* `fn` (Function(`event`)) **Required** Callback function to process the event
  * `event` (Object)
    * `type` (String) Type of component event
      <details markdown="1">
      <summary>Possible values</summary>

      * `adding` - Component is being added
      * `added` - Component is successfully added
      * `addFailed` - Component failed to add
      * `removed` - Component removed
      * `moved` - Component moved
      * `render` - Component rendered
      </details>
    * `target` (ComponentNode) Target node where the component is added to, removed from or moved to
    * `source` (ComponentNode) Where the node is moved from, if the event type is `moved`
    * `added` (ComponentNodeList) A list of component nodes added
    * `removed` (ComponentNodeList) A list of components nodes removed

## ComponentNode

A node representing a component or a component view container.

**Properties**

* `widgetId` (Number) Widget instance ID
* `helperId` (String) Helper instance ID
* `package` (String) Package name for the widget instance
* `name` (String) Registered widget or helper name
* `view` (String) Name of a widget or helper view container

## Examples

```js
Fliplet.Hooks.on('componentEvent', function(event) {

});
```
