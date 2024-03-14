// Register this widget instance
Fliplet.Widget.instance({
  name: '{{safeName}}',
  displayName: '{{name}}',
  render: {
    ready: function() {
      // Initialize children components when this widget is ready
      Fliplet.Widget.initializeChildren(this.$el, this);
    }
  }
});
