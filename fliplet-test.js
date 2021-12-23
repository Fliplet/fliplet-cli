const puppeteer = require('puppeteer');
const Mocha = require('mocha');
const { expect, should } = require('chai');
const casual = require('casual');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const config = require('./lib/config');
const publish = require('./lib/publish');
const api = require('./lib/api');


const authToken = _.get(config.data, 'user.auth_token', process.env.AUTH_TOKEN);
const debug = !!(process.argv[2] || '').match('--debug');

const runner = async function run() {
  let file;
  let fileName;
  let tags;
  let packageName;

  function restoreWidgetJson() {
    // Restore widget.json file
    file.package = packageName;
    file.tags = tags;
    fs.writeFileSync(fileName, JSON.stringify(file, null, 2));
  }

  try {
    if (!authToken) {
      console.error('[ERROR] Please login before running tests.');
      process.exit(1);
    }

    // puppeteer options
    const opts = {
      headless: !debug,
      slowMo: 100,
      timeout: 10000
    };

    console.log('[BOOTSTRAP] Launching Puppeteer...');

    const browser = await puppeteer.launch(opts);

    // Globals to be used on Mocha tests
    global.browser = browser;
    global.expect = expect;
    global.should = should;
    global.casual = require('casual');

    // Instantiate a Mocha instance.
    const mocha = new Mocha({
      reporter: 'spec'
    });

    /*
     * Extending nightmare with save action
     * To be used with the interfaceBrowser
     * Simulate what happens in Studio
     */
    /*
    Nightmare.action("save", function (done) {
      this.evaluate_now(
        function () {
          window.postMessage("save-widget", window.location.origin);
        },
        function () {
          // Refresh pages
          interfaceBrowser.refresh();
          buildBrowser.refresh();

          // Wait some time so the refresh really happens
          // TODO: Use .wait with some conditional on both browsers instead
          // TODO: update widgetInstance with new data
          setTimeout(done, 2000);
        }
      );
    });
    */

    fileName = './widget.json';
    file = require(`${process.cwd()}/widget.json`);
    packageName = file.package;
    tags = file.tags;

    // Generate a random package name for this test
    file.package = `test.${packageName}.${casual.unix_time}`;
    file.tags = [];
    fs.writeFileSync(fileName, JSON.stringify(file, null, 2));

    const { widget } = await publish.run({ auth_token: authToken });

    restoreWidgetJson();

    api.setAuthToken(authToken);

    const testDir = `${process.cwd()}/tests`;
    const { app } = await api.app.post();
    const { page } = await api.page.post({ appId: app.id });
    const { widgetInstance } = await api.widgetInstance.post({
      pageId: page.id,
      widgetId: widget.id
    });

    const layout = `<section>{{{widget ${widgetInstance.id}}}}</section>`;

    await api.page.put({
      appId: app.id,
      id: page.id,
      layout
    });

    global.widgetInstance = widgetInstance;
    global.buildSelector = `[data-fl-widget-instance][data-id="${widgetInstance.id}"]`;

    browser.renderWidget = async function(isInterface) {
      if (global.page) {
        global.page.close();
      }

      global.page = await global.browser.newPage();

      const uri = isInterface
        ? `v1/widget-instances/${widgetInstance.id}/interface`
        : `v1/apps/${app.id}/pages/${page.id}/preview`;

      const url = `${config.api_url}${uri}?auth_token=${authToken}`;

      await global.page.goto(url);
    };

    browser.renderWidgetWithData = async function(data, isInterface = false) {
      if (data) {
        await api.widgetInstance.put(widgetInstance.id, data);
      }

      return browser.renderWidget(isInterface);
    };

    browser.renderInterface = async function() {
      return browser.renderWidget(true);
    };

    browser.renderInterfaceWithData = async function(data) {
      return browser.renderWidgetWithData(data, true);
    };

    console.log('[BOOTSTRAP] Loading tests from', testDir);

    fs.readdirSync(testDir)
      .filter(function(file) {
        return file.match(/\.js$/);
      })
      .forEach(function(file) {
        console.log('[MOCHA] Adding file', file);
        mocha.addFile(path.join(testDir, file));
      });

    console.log('[MOCHA] Running test suite...');

    mocha.timeout(15000);

    mocha
      .run(function(failures) {
        process.on('exit', function() {
          process.exit(failures); // exit with non-zero status if there were failures
        });
      })
      .on('end', async function() {
        await browser.close();

        // Clean created data
        await Promise.all([
          api.widgetInstance.del(widgetInstance.id),
          api.page.del({ id: page.id, appId: app.id })
        ]);

        await Promise.all([api.app.del(app.id), api.widget.del(widget.id)]);
      });
  } catch (error) {
    console.error(error);

    restoreWidgetJson();
    await global.browser.close();

    process.exit(1);
  }
};

runner();
