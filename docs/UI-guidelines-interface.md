# UI guidelines for component interfaces

You are not required to use these style guidelines, but if you want your component to fit the overall style of Fliplet's components we recommend you use them.  

We always include Bootstrap as the framework to build responsive interfaces as part of the `fliplet-studio-ui` dependency. (Learn more about dependencies [here](Dependencies-and-assets.md))

## Basic styles

In the settings of our components we use the following basic styles:

Primary colour: `#00abd2`  
Secondary colour: `#aaaaaa`  
Text: `#333333`  
Headings:
```html
<h2><small>Heading</small></h2>
```
Heading primary colour: `#14505e`  
Heading secondary colour: `#777777`  
Label colour: `#14505e`  
Helper text class:
```css
.text-helper {
  margin-top: 0.5em;
  font-size: 0.8em;
}
```

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

## Buttons

We use Bootstrap's button classes but we tweak the styles to make them look our own.  
Primary button classes: `.btn.btn-primary`
Secondary button classes: `.btn.btn-default`
Danger button classes: `.btn.btn-danger`
Link text button classes: `.btn.btn-link`

**General**

```css
.btn {
  border-radius: 6px;
  line-height: 44px;
  padding: 0 15px;
  border: none;
}
```

**Primary button**

```css
.btn-primary {
  color: #FFF;
  background-color: #00abd2;
  border-bottom: 2px solid #0087a6;
}
.btn-primary:active,
.btn-primary:active:focus,
.btn-primary:active:hover,
.btn-primary:focus,
.btn-primary:hover {
  color: #FFF;
  background-color: #0087a6;
  border-color: #0087a6;
  outline: none;
}
```

**Secondary button**

```css
.btn-default {
  color: #333;
  background-color: #e4e9eb;
  border-bottom: 2px solid #cfd3d5;
}
.btn-default:active,
.btn-default:active:focus,
.btn-default:active:hover,
.btn-default:focus,
.btn-default:hover {
  color: #333;
  background-color: #cfd3d5;
  border-color: #cfd3d5;
  outline: none;
}
```

**Danger button**

```css
.btn-danger {
  color: #FFF;
  background-color: #d9534f;
  border-bottom: 2px solid #c9302c;
}
.btn-danger:active,
.btn-danger:active:focus,
.btn-danger:active:hover,
.btn-danger:focus,
.btn-danger:hover {
  color: #FFF;
  background-color: #c9302c;
  border-color: #c9302c;
  outline: none;
}
```

**Link text button**

```css
.btn-link,
a {
  color: #00abd1;
}
```

---

## Component's form fields

In our components we use the following form fields:
- [Input field](#input-field)
- [Colour picker](#colour-picker)
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

If you want to use an input field without a label, all you need to do is remove the label `<div>` and your markup should look like this:

```html
<div class="form-group clearfix">
  <div class="col-sm-8">
    <input type="text" name="input_field" class="form-control" id="input_field" placeholder="Placeholder" value=""/>
  </div>
</div>
```

### Colour picker

For colour pickers we use Bootstrap's input field with an addon.  
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

If you want to use an input field without a label, all you need to do is remove the label `<div>` and your markup should look like this:

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

If you are using one of these drop-downs with dynamic data to create the `<option>` then we recommend start the `<select>` disabled by adding the `disable` attribute to it, also remove all the `<option>` and in the `span.select-value-proxy` default it to "-- Please wait...".  
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

When it comes to CSS you just need to add a couple of extra things.  
If you add the following the drop-down will look like a disabled field.

```css
.select-proxy-display > .hidden-select[disabled] ~ .icon {
  background-color: #aaa;
}
.select-proxy-display > .hidden-select[disabled] ~ .select-value-proxy {
  background: #e4e9eb;
}
```

### Radio buttons

For radio buttons we have two different styles depending on what we want to achieve.  
If we want to achieve a list of more than 3 options that might also have sub-settings under each option, then we would use the more traditional style.  
If we want to achieve a toggle like look with 3 or less options then we would use a more button like style.

**Traditional style**

Here is the markup to achieve the more traditional style with our branding:

```html
<div class="form-group clearfix">
  <div class="col-sm-4 control-label">
    <label>In what order do you want do display your data?</label>
  </div>
  <div class="col-sm-8">
    <div class="radio">
      <input type="radio" id="alphabetical" name="is_alphabetical" value="true" checked>
      <label for="alphabetical">
        <span class="check"><i class="fa fa-circle"></i></span> Alphabetically
      </label>
    </div>
    <div class="radio">
      <input type="radio" id="order" name="is_alphabetical" value="false">
      <label for="order">
        <span class="check"><i class="fa fa-circle"></i></span> In the order as loaded
      </label>
    </div>
  </div>
</div>
```

The CSS to achieve this list goes as follows:

```css
.radio input {
  display: none;
}
.radio label {
  padding-left: 30px;
  color: #333;
}
.radio label > span.check {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  border: 1px solid #e4e9eb;
  border-radius: 50%;
  background-color: #FFFFFF;
  padding-left: 0;
  margin-bottom: 0;
  text-align: center;
}
.radio input[type="radio"]:checked + label > span.check {
  background-color: #00abd2;
}
.radio label > span.check > i.fa {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  line-height: 18px;
  font-size: 10px;
}
.radio input[type="radio"]:checked + label span.check > i.fa {
  display: block;
  color: #FFF;
}
```

**Button like style**

Here is the markup to achieve the button like style with our branding:

```html
<div class="form-group clearfix inline-radio">
  <div class="col-sm-4 control-label">
    <label for="swipe-to-save">Enable this awesome option?</label>
  </div>
  <div class="col-sm-8">
    <div class="radio-buttons clearfix">
      <div class="radio">
        <input type="radio" id="enable-yes" name="enable_option" value="show">
        <label for="enable-yes">Yes</label>
      </div>
      <div class="radio">
        <input type="radio" id="enable-no" name="enable_option" value="no-show">
        <label for="enable-no">No</label>
      </div>
    </div>
  </div>
</div>
```

The CSS to achieve this list goes as follows:

```css
.inline-radio .radio input {
  display: none;
}
.inline-radio .radio {
  float: left;
  margin: 0;
}
.inline-radio .radio label {
  position: relative;
  height: 44px;
  line-height: 44px;
  border: 1px solid #e4e9eb;
  border-radius: 0;
  background-color: #FFFFFF;
  padding: 0 15px;
  margin-left: 0;
  margin-bottom: 0;
}
.inline-radio .radio:first-child label {
  border-right: none;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.inline-radio .radio:last-child label {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
.inline-radio .radio input[type="radio"]:checked + label {
  background-color: #00abd2;
  color: #FFF;
}
```

In both cases we hide the radio input field and we style the label to look like what we want. The trick is again to use the `<label>` `for` attribute to trigger the radio input.

### Checkboxes

Here is the markup to achieve the checkboxes with our branding:

```html
<div class="form-group clearfix">
  <div class="col-sm-4 control-label">
    <label for="show_subtitle">Show a subtitle in the main list?</label>
  </div>
  <div class="col-sm-8">
    <div class="checkbox">
      <input type="checkbox" id="show_subtitle">
      <label for="show_subtitle">
        <span class="check"><i class="fa fa-check"></i></span> Yes, please
      </label>
    </div>
  </div>
</div>
```

The CSS to achieve this list goes as follows:

```css
.checkbox input {
  display: none;
}
.checkbox label {
  padding-left: 30px;
  color: #333;
}
.checkbox label > span.check {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  border: 1px solid #e4e9eb;
  border-radius: 4px;
  background-color: #FFFFFF;
  padding-left: 0;
  margin-bottom: 0;
  text-align: center;
}
.checkbox input[type="checkbox"]:checked + label > span.check {
  background-color: #00abd2;
}
.checkbox label > span.check > i.fa {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 2px;
}
.checkbox input[type="checkbox"]:checked + label span.check > i.fa {
  display: block;
  color: #FFF;
}
```

We hide the checkbox input field and we style the label to look like what we want. The trick is again to use the `<label>` `for` attribute to trigger the checkbox input.

## Tabs

If you need to categorise your component's settings then you should use our tabbed system.  
Again, we use Bootstrap's tabbed system and we style it to look like we want it.

Here is a quick example of the markup:

```html
<ul class="nav nav-tabs" role="tablist">
  <li role="presentation" class="active" id="general-settings"><a href="#settings-tab" aria-controls="general-settings" role="tab" data-toggle="tab">General Settings</a></li>
  <li role="presentation" class="" id="more-settings"><a href="#more-settings-tab" aria-controls="more-settings" role="tab" data-toggle="tab">More Settings</a></li>
</ul>

<div class="tab-content">
  <div role="tabpanel" class="tab-pane active" id="settings-tab">
    <!-- Content here -->
  </div>
  <div role="tabpanel" class="tab-pane" id="more-settings-tab">
    <!-- Content here -->
  </div>
</div>
```

To make the tabs look like our own tabs, use the following CSS:

```css
.nav-tabs > li.disabled {
  pointer-events: none;
}
.nav-tabs > li.disabled > a {
  color: #999 !important;
}
.nav > li > a,
.nav > li > a:focus,
.nav > li > a:hover {
  color: #333 !important;
  border: 0;
  border-bottom: 4px solid transparent;
  background: none;
}
.nav-tabs > li.active > a,
.nav-tabs > li.active > a:focus,
.nav-tabs > li.active > a:hover {
  color: #333;
  border: 0;
  border-bottom: 4px solid #00abd2;
  background: none;
}
```
