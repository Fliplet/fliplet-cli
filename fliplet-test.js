'use strict';

const Nightmare = require('nightmare');
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const configstore = require('./lib/configstore');
const config = require('./lib/config');
const publish = require('./lib/publish');
const api = require('./lib/api');
const authToken = configstore.get('auth_token');

// Globals to be used on Mocha tests
global.interfaceBrowser = Nightmare({ show: true });
global.buildBrowser = Nightmare({ show: true });
global.expect = require('chai').expect;
global.should = require('chai').should;
global.casual = require('casual');

// Instantiate a Mocha instance.
const mocha = new Mocha({
  reporter: 'spec'
});

const testDir = `${process.cwd()}/tests`;

/*
 * Extending nightmare with save action
 * To be used with the interfaceBrowser
 * Simulate what happens in Studio
 */
Nightmare.action('save', function (done) {
  this.evaluate_now(function() {

    window.postMessage('save-widget', window.location.origin);
  }, function () {
    // Refresh pages
    interfaceBrowser.refresh();
    buildBrowser.refresh();

    // Wait some time so the refresh really happens
    // TODO: Use .wait with some conditional on both browsers instead
    // TODO: update widgetInstance with new data
    setTimeout(done, 2000);
  })
});

/*
 * Returns a Promise as I suspect we will need it on the future
 */
function visit() {
  interfaceBrowser.goto(interfaceUrl);
  buildBrowser.goto(buildUrl);
  return Promise.resolve();
}

let widget;
let app;
let page;
let widgetInstance;

// Change package name to avoid using an existing one on the environment
const fileName = './widget.json';
const file = require(`${process.cwd()}/widget.json`);
const packageName = file.package;
const tags = file.tags;
file.package = test.${packageName}.${casual.unix_time}`;
file.tags = [];
fs.writeFileSync(fileName, JSON.stringify(file, null, 2));

function restoreWidgetJson() {
  // Restore widget.json file
  file.package = packageName;
  file.tags = tags;
  fs.writeFileSync(fileName, JSON.stringify(file, null, 2));
}

publish.run()
  .then(function (testWidget) {`
    restoreWidgetJson();
    widget = testWidget.widget;
    return api.app.post();
  })
  .then(function (createdApp) {
    app = createdApp.app;
    return api.page.post({ appId: app.id})
  })
  .then(function (createdPage) {
    page = createdPage.page;
    return api.widgetInstance.post({ pageId: page.id, widgetId: widget.id})
  })
  .then(function (createdWidgetInstance) {
    widgetInstance = createdWidgetInstance.widgetInstance;
    const layout = `<section data-fl-edit>{{{widget ${widgetInstance.id}}}}</section>`;
    return api.page.put({
      appId: app.id,
      id: page.id,
      layout
    });
  })
  .then(function () {
    // Export interface/build urls and widgetInstance. They can be used on tests if dev needs it.
    global.interfaceUrl = `${config.api_url}v1/widget-instances/${widgetInstance.id}/interface?auth_token=${authToken}`;
    global.buildUrl = `${config.api_url}v1/apps/${app.id}/pages/${page.id}/preview?auth_token=${authToken}`;
    global.widgetInstance = widgetInstance;
    global.buildSelector = `[data-fl-widget-instance][data-id="${widgetInstance.id}"]`;

    visit()
      .then(function () {
        // Add each .js file to the mocha instance
        fs.readdirSync(testDir).filter(function(file){
          // Only keep the .js files
          return file.substr(-3) === '.js';
        }).forEach(function(file){
          mocha.addFile(
            path.join(testDir, file)
          );
        });

        mocha.run()
          .on('end', function () {
            // Close any open browsers
            interfaceBrowser.end().then(function () {});
            buildBrowser.end().then(function () {});

            // Clean created data
            Promise.all([
              api.widgetInstance.del(widgetInstance.id),
              api.page.del({ id: page.id, appId: app.id })
            ])
              .then(function () {
                return Promise.all([
                  api.app.del(app.id),
                  api.widget.del(widget.id)
                ]);
              })
              .then(function () {
                console.log('Widget Tested.');
              })
              .catch(function (error) {
                console.log('Widget Tested but failed to clean environment.');
                console.log(error);
              });
          });
      });
  })
  .catch(function (error) {
    console.log('Something went wrong.');
    console.log(error);

    restoreWidgetJson();
  });
