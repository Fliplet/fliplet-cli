# UI guidelines for component interfaces

You are not required to use these style guidelines, but if you want your component to fit the overall style of Fliplet's components we recommend you use them.  

We always include Bootstrap as the framework to build responsive interfaces as part of the `fliplet-studio-ui` dependency. (Learn more about dependencies [here](Dependencies-and-assets.md))

## Component's header

We always start with a small header for the component that is always visible at the top.  
Here is an example:

```html
<header>
  <p>Configure your Primary button</p>
  <a id="help_tip" href="#">Need help?</a>
</header>
```

We use the following CSS to style the header:

```css
header {
  display: flex;
  font-size: 1em;
  border-bottom: 1px solid #e3e9eb;
  margin-bottom: 3rem;
  padding-bottom: 1.5em;
}
header p {
  flex: 1;
  margin: 0 1.4rem 0 0;
}
header a {
  text-decoration: none;
}
```

---

## Component's form fields

In our components we use the following form fields:
- [Input field](#input-field)
- [Color picker](#color-picker)
- [Drop-down list](#drop-down-list)
- [Radio buttons](#radio-buttons)
- [Checkboxes](#checkboxes)

### Input field

As we use Bootstrap, this is how our input fields markup with a label look like:

```html
<div class="form-group clearfix">
  <div class="col-sm-4 control-label">
    <label for="input_field">Input label</label>
  </div>
  <div class="col-sm-8">
    <input type="text" name="input_field" class="form-control" id="input_field" placeholder="Placeholder" value=""/>
  </div>
</div>
```

To make them look like ours, use the following CSS:

```css
/* This eliminates the extra padding
that bootstrap columns have by default */
.form-group {
  margin-left: -15px;
  margin-right: -15px;
}
/* Changes the label styles */
.form-group label {
  font-weight: normal;
  color: #14505e;
}
/* Changes the input field */
.form-control {
  border-radius: 6px;
  border: 1px solid #e4e9eb;
  color: #333;
  height: 44px;
  line-height: 44px;
  padding: 0 15px;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.form-control:focus {
  border-color: #00abd2;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(0, 171, 210, .6);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(0, 171, 210, .6);
}
```

If you want to use a input field without a label, all you need to do is to remove the label `<div>` and your markup should look like this:

```html
<div class="form-group clearfix">
  <div class="col-sm-8">
    <input type="text" name="input_field" class="form-control" id="input_field" placeholder="Placeholder" value=""/>
  </div>
</div>
```

### Color picker

For color pickers we use Bootstrap's input field with an addon.  
Here is an example:

```html
<div class="form-group">
  <div class="col-sm-4 control-label">
    <label>Pick a color</label>
  </div>
  <div class="col-sm-8">
    <div class="input-group">
      <div class="input-group-addon" style="background-color:#00abd2">&nbsp;&nbsp;&nbsp;</div>
      <input type="text" class="form-control" value="#00abd2">
    </div>
  </div>
</div>
```

To make it look like ours, use the following CSS:

```css
/* This eliminates the extra padding
that bootstrap columns have by default */
.form-group {
  margin-left: -15px;
  margin-right: -15px;
}
/* Changes the input field */
.form-control {
    border-radius: 6px;
    border: 1px solid #e4e9eb;
    color: #333;
    height: 44px;
    line-height: 44px;
    padding: 0 15px;
    -webkit-box-shadow: none;
    box-shadow: none;
}
.form-control:focus {
    border-color: #00abd2;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(0, 171, 210, .6);
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(0, 171, 210, .6);
}
/* Changes to the addon */
.input-group .form-control {
    height: 46px;
}

.input-group-addon {
    border-radius: 6px;
}
```

If you want to use a input field without a label, all you need to do is to remove the label `<div>` and your markup should look like this:

```html
<div class="form-group clearfix">
  <div class="col-sm-8">
    <div class="input-group">
      <div class="input-group-addon" style="background-color:#00abd2">&nbsp;&nbsp;&nbsp;</div>
      <input type="text" class="form-control" value="#00abd2">
    </div>
  </div>
</div>
```

### Drop-down list

HTML Select aren't easy to style, some HTML and CSS magic needs to be applied. If you want yours to look like ours do the following:

```html
<div class="form-group clearfix">
  <div class="col-sm-4 control-label">
    <label>An awesome drop-down list</label>
  </div>
  <div class="col-sm-8">
    <label for="drop-down" class="select-proxy-display">
      <span class="icon fa fa-chevron-down"></span>
      <span class="select-value-proxy">-- Select an option</span>
      <select id="drop-down" data-label="select" class="hidden-select form-control">
        <option value="">-- Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </select>
    </label>
  </div>
</div>
```

The trick here is to hide the `<select>` and use a `<label>` to look like a drop-down. The trick is to trigger the drop-down using the `for` attribute in the label that matches the `<select>` `id` attribute.  
We will then use some JavaScript to update the `span.select-value-proxy` text to match the text of the option selected in the drop-down list.

So the JavaScript to achieve what is described above looks like this:

```js
$('.hidden-select').on('change', function() {
  var selectedText = $(this).find('option:selected').text();
  $(this).parents('.select-proxy-display').find('.select-value-proxy').html(selectedText);
});
```

Now to style the drop-down to look like ours, use the following CSS:

```css
.select-proxy-display {
    width: 100%;
    height: 44px;
    margin: 0 auto;
    padding: 0 44px 0 0;
    background: #fff;
    border: 1px solid #e4e9eb;
    border-radius: 6px;
    cursor: pointer;
    outline: 0;
    font-weight: 400;
    line-height: 44px;
    position: relative;
    color: #333;
}
.select-proxy-display > .hidden-select {
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: 0;
    right: 0;
    cursor: pointer;
    opacity: 0;
    z-index: 1;
}
.select-proxy-display > .select-value-proxy {
    position: absolute;
    left: 0;
    top: 0;
    right: 42px;
    bottom: 0;
    padding-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.select-proxy-display > .icon {
    position: absolute;
    width: 44px;
    top: -1px;
    right: -1px;
    bottom: -1px;
    background-color: #00abd2;
    text-align: center;
    line-height: 44px;
    font-size: 18px;
    color: #FFF;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    border-left: 1px solid #e4e9eb;
}
```

**Dynamically appending options**

If you are using one of these drop-downs with dynamic data to create the `<option>` then we recommend start the `<select>` disabled by adding the `disable` attribute to it, also remove the all the `<option>` and in the `span.select-value-proxy` default it to "-- Please wait...".  
Here is the markup for it:

```html
<div class="form-group clearfix">
  <div class="col-sm-4 control-label">
    <label>An awesome drop-down list</label>
  </div>
  <div class="col-sm-8">
    <label for="drop-down" class="select-proxy-display">
      <span class="icon fa fa-chevron-down"></span>
      <span class="select-value-proxy">-- Please wait...</span>
      <select id="drop-down" data-label="select" class="hidden-select form-control" disabled></select>
    </label>
  </div>
</div>
```

Then in the JavaScript after you add the dynamic `<option>` you need to remove the `disabled` attribute and trigger a change.  
Here is an example where we append the column names of a Data Source:

```js
Fliplet.DataSources.getById(dataSourceId).then(function (dataSource) {
  $('#drop-down').html('<option value="">-- Select a column</option>');

  dataSource.columns.forEach(function (c) {
    $('#drop-down').append('<option value="' + c + '">' + c + '</option>');
  });

  // When loading the saved data
  if (data.columnName) {
    $('#drop-down').val(data.columnName);
  }

  // Trigger a change to update the .select-value-proxy text
  $('#drop-down').trigger('change');

  // Removes disabled attribute to allow the user to use the drop-down
  $('#drop-down').prop('disabled', '');
});
```

When it comes to CSS you just need add a couple of extra things.  
If you add the following the drop-down will look like a disabled field.

```css
.select-proxy-display > .hidden-select[disabled] ~ .icon {
    background-color: #aaa;
}
.select-proxy-display > .hidden-select[disabled] ~ .select-value-proxy {
    background: #e4e9eb;
}
```
